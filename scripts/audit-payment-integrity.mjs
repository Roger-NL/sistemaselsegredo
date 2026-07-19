#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ROOT = process.cwd();
const ENV_FILES = [".env.local", ".env.vercel", ".env.production.vercel"];
const PAID_STATUSES = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
const MAX_DETAILS = 50;

function loadLocalEnvironment() {
  for (const filename of ENV_FILES) {
    const filePath = path.join(PROJECT_ROOT, filename);
    if (!fs.existsSync(filePath)) continue;

    for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] ||= value;
    }
  }
}

function parseServiceAccount(raw) {
  const lastBrace = raw.lastIndexOf("}");
  const trimmed = lastBrace >= 0 ? raw.slice(0, lastBrace + 1) : raw;
  const account = JSON.parse(trimmed.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
  account.private_key = account.private_key?.replace(/\\n/g, "\n");
  return account;
}

function userLabel(userId) {
  return createHash("sha256").update(userId).digest("hex").slice(0, 12);
}

function groupKey(userId, plan) {
  return `${userId}|${plan}`;
}

function printDetails(title, rows) {
  console.log(`${title}: ${rows.length}`);
  for (const row of rows.slice(0, MAX_DETAILS)) {
    console.log(`  ${JSON.stringify(row)}`);
  }
  if (rows.length > MAX_DETAILS) {
    console.log(`  ... ${rows.length - MAX_DETAILS} registo(s) adicional(is) omitido(s)`);
  }
}

async function main() {
  if (process.argv.includes("--apply")) {
    throw new Error("Este auditor e estritamente read-only; --apply nao e suportado.");
  }

  loadLocalEnvironment();
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

  console.log("Auditoria de integridade de pagamentos — READ-ONLY");
  const [attemptSnapshot, intentSnapshot, userSnapshot] = await Promise.all([
    db.collection("payment_attempts").get(),
    db.collection("checkout_intents").get(),
    db.collection("users").get(),
  ]);

  const users = new Map(userSnapshot.docs.map((document) => [document.id, document.data()]));
  const paidGroups = new Map();

  for (const document of attemptSnapshot.docs) {
    const data = document.data();
    if (!PAID_STATUSES.has(data.status)) continue;
    const userId = typeof data.userId === "string" ? data.userId : "";
    const plan = typeof data.plan === "string" ? data.plan : "unknown";
    if (!userId) continue;
    const key = groupKey(userId, plan);
    const group = paidGroups.get(key) || [];
    group.push({ id: document.id, data });
    paidGroups.set(key, group);
  }

  const paidWithoutEntitlement = [];
  const duplicatePaidGroups = [];

  for (const group of paidGroups.values()) {
    const { userId, plan } = group[0].data;
    const user = users.get(userId);
    const paidIds = new Set(group.map((attempt) => attempt.id));

    if (group.length > 1) {
      duplicatePaidGroups.push({
        user: userLabel(userId),
        plan,
        paymentIds: [...paidIds],
      });
    }

    const hasEntitlement = plan === "lifetime"
      ? user?.subscriptionStatus === "premium" &&
        (paidIds.has(user?.premiumPaymentId) || paidIds.has(user?.paymentId))
      : plan === "specialty"
        ? paidIds.has(user?.lastSpecialtyPurchasePaymentId)
        : false;

    if (!hasEntitlement) {
      paidWithoutEntitlement.push({
        user: userLabel(userId),
        plan,
        paymentIds: [...paidIds],
        userExists: Boolean(user),
        subscriptionStatus: user?.subscriptionStatus || null,
      });
    }
  }

  const reconciliationRequired = intentSnapshot.docs
    .filter((document) => document.data().status === "reconciliation_required")
    .map((document) => {
      const data = document.data();
      return {
        intentId: document.id,
        user: typeof data.userId === "string" ? userLabel(data.userId) : null,
        plan: data.plan || null,
        paymentId: data.paymentId || null,
        updatedAt: data.updatedAt || null,
      };
    });

  console.log(`Payment attempts lidos: ${attemptSnapshot.size}`);
  console.log(`Checkout intents lidos: ${intentSnapshot.size}`);
  console.log(`Utilizadores lidos: ${userSnapshot.size}`);
  printDetails("Grupos pagos sem entitlement coerente", paidWithoutEntitlement);
  printDetails("Grupos com múltiplos pagamentos pagos por utilizador/plano", duplicatePaidGroups);
  printDetails("Intents que exigem reconciliação", reconciliationRequired);
  console.log("Nenhuma escrita foi efetuada.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha inesperada na auditoria.");
  process.exitCode = 1;
});
