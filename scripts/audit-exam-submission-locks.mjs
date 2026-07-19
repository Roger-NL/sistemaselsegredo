#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = process.cwd();
const ENV_FILES = [".env.local", ".env.vercel", ".env.production.vercel"];
const APPLY = process.argv.includes("--apply");

function loadEnvFromFiles() {
  for (const filename of ENV_FILES) {
    const fullPath = path.join(ROOT, filename);
    if (!fs.existsSync(fullPath)) continue;

    for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const equalIndex = line.indexOf("=");
      if (equalIndex === -1) continue;

      const key = line.slice(0, equalIndex).trim();
      let value = line.slice(equalIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function parseServiceAccount(raw) {
  const lastBrace = raw.lastIndexOf("}");
  const trimmed = lastBrace >= 0 ? raw.slice(0, lastBrace + 1) : raw;
  const parsed = JSON.parse(trimmed.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
  parsed.private_key = parsed.private_key?.replace(/\\n/g, "\n");
  return parsed;
}

function timestampMillis(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  const parsed = Date.parse(typeof value === "string" ? value : "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function pendingKey(userId, pillarId) {
  return `${userId}|${pillarId}`;
}

function expectedLockId(userId, pillarId) {
  return `${userId}_p${pillarId}`;
}

async function applyOperations(db, operations) {
  for (let offset = 0; offset < operations.length; offset += 400) {
    const batch = db.batch();
    for (const operation of operations.slice(offset, offset + 400)) {
      batch.set(operation.ref, operation.data, { merge: true });
    }
    await batch.commit();
  }
}

async function main() {
  loadEnvFromFiles();
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!rawServiceAccount) throw new Error("FIREBASE_SERVICE_ACCOUNT ausente.");

  const serviceAccount = parseServiceAccount(rawServiceAccount);
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
  const db = getFirestore(app);

  console.log(`Auditoria de exam_submission_locks — modo ${APPLY ? "APPLY" : "DRY-RUN"}`);
  const [examSnapshot, lockSnapshot] = await Promise.all([
    db.collection("pillar_exams").get(),
    db.collection("exam_submission_locks").get(),
  ]);

  const pendingGroups = new Map();
  let invalidPendingExams = 0;
  for (const examDoc of examSnapshot.docs) {
    const data = examDoc.data();
    if (data.status !== "pending") continue;

    const userId = typeof data.userId === "string" ? data.userId : "";
    const pillarId = Number(data.pillarId);
    if (!userId || !Number.isInteger(pillarId)) {
      invalidPendingExams += 1;
      continue;
    }

    const key = pendingKey(userId, pillarId);
    const group = pendingGroups.get(key) || [];
    group.push({ id: examDoc.id, data });
    pendingGroups.set(key, group);
  }

  const locksById = new Map(lockSnapshot.docs.map((doc) => [doc.id, doc]));
  const operations = [];
  const expectedPendingLockIds = new Set();
  let healthyLocks = 0;
  let missingLocks = 0;
  let mismatchedLocks = 0;
  let duplicatePendingGroups = 0;

  for (const group of pendingGroups.values()) {
    group.sort((left, right) => timestampMillis(right.data.createdAt) - timestampMillis(left.data.createdAt));
    if (group.length > 1) duplicatePendingGroups += 1;

    const canonicalExam = group[0];
    const userId = canonicalExam.data.userId;
    const pillarId = Number(canonicalExam.data.pillarId);
    const lockId = expectedLockId(userId, pillarId);
    expectedPendingLockIds.add(lockId);
    const lockDoc = locksById.get(lockId);
    const lockData = lockDoc?.data();
    const isHealthy = Boolean(
      lockDoc &&
      lockData?.userId === userId &&
      Number(lockData?.pillarId) === pillarId &&
      lockData?.examId === canonicalExam.id &&
      lockData?.status === "pending"
    );

    if (isHealthy) {
      healthyLocks += 1;
      continue;
    }

    if (lockDoc) mismatchedLocks += 1;
    else missingLocks += 1;

    operations.push({
      ref: db.collection("exam_submission_locks").doc(lockId),
      data: {
        userId,
        pillarId,
        examId: canonicalExam.id,
        status: "pending",
        migratedAt: new Date().toISOString(),
      },
    });
  }

  let orphanPendingLocks = 0;
  for (const lockDoc of lockSnapshot.docs) {
    const data = lockDoc.data();
    if (data.status !== "pending") continue;
    if (expectedPendingLockIds.has(lockDoc.id)) continue;
    const key = pendingKey(data.userId, Number(data.pillarId));
    if (pendingGroups.has(key)) continue;

    orphanPendingLocks += 1;
    operations.push({
      ref: lockDoc.ref,
      data: {
        status: "orphaned",
        orphanedAt: new Date().toISOString(),
      },
    });
  }

  console.log(`Exames lidos: ${examSnapshot.size}`);
  console.log(`Locks lidos: ${lockSnapshot.size}`);
  console.log(`Grupos com exame pendente: ${pendingGroups.size}`);
  console.log(`Locks pendentes corretos: ${healthyLocks}`);
  console.log(`Locks ausentes: ${missingLocks}`);
  console.log(`Locks divergentes: ${mismatchedLocks}`);
  console.log(`Locks pendentes órfãos: ${orphanPendingLocks}`);
  console.log(`Grupos com múltiplos exames pendentes: ${duplicatePendingGroups}`);
  console.log(`Exames pendentes inválidos: ${invalidPendingExams}`);
  console.log(`Operações planeadas: ${operations.length}`);

  if (!APPLY) {
    console.log("Nenhuma escrita efetuada. Use --apply explicitamente para aplicar o plano.");
    return;
  }

  await applyOperations(db, operations);
  console.log(`Aplicadas ${operations.length} operação(ões).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha inesperada.");
  process.exitCode = 1;
});
