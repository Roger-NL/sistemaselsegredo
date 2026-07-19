#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ROOT = process.cwd();
const ENV_FILES = [".env.local", ".env.vercel", ".env.production.vercel"];

function loadLocalEnv() {
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

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT ausente.");

  const lastBrace = raw.lastIndexOf("}");
  const trimmed = lastBrace >= 0 ? raw.slice(0, lastBrace + 1) : raw;
  const account = JSON.parse(trimmed.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
  account.private_key = account.private_key?.replace(/\\n/g, "\n");
  return account;
}

function configuredAdminEmails() {
  return (process.env.FIREBASE_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const revokeArgument = process.argv.find((argument) => argument.startsWith("--revoke="));
  const revokeEmail = revokeArgument?.slice("--revoke=".length).trim().toLowerCase() || null;
  const emails = revokeEmail ? [revokeEmail] : configuredAdminEmails();

  if (emails.length === 0) {
    throw new Error("Configure FIREBASE_ADMIN_EMAILS com emails separados por virgula.");
  }

  const account = parseServiceAccount();
  const app = getApps()[0] || initializeApp({
    credential: cert(account),
    projectId: account.project_id,
  });
  const firebaseAuth = getAuth(app);

  for (const email of emails) {
    const user = await firebaseAuth.getUserByEmail(email);
    const nextAdminValue = !revokeEmail;
    console.log(`${apply ? "APPLY" : "DRY-RUN"}: ${email} -> admin=${nextAdminValue}`);

    if (apply) {
      await firebaseAuth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        admin: nextAdminValue,
      });
    }
  }

  if (!apply) {
    console.log("Nenhuma claim foi alterada. Repita com --apply depois de rever a lista.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha ao configurar admins.");
  process.exit(1);
});
