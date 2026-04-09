#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import admin from "firebase-admin";

const ROOT = process.cwd();
const ENV_FILES = [".env.local", ".env.vercel", ".env.production.vercel"];

function loadEnvFromFiles() {
  for (const filename of ENV_FILES) {
    const fullPath = path.join(ROOT, filename);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
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

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function ok(message) {
  console.log(`✔ ${message}`);
}

function warn(message) {
  console.log(`⚠ ${message}`);
}

function fail(message) {
  console.log(`✖ ${message}`);
}

function parseJsonEnv(key) {
  const raw = process.env[key];
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  } catch {
    throw new Error(`${key} não está em JSON válido.`);
  }
}

async function checkFirebase(serviceAccount) {
  if (!serviceAccount) {
    fail("FIREBASE_SERVICE_ACCOUNT ausente.");
    return false;
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    fail("FIREBASE_SERVICE_ACCOUNT está incompleto.");
    return false;
  }

  try {
    const app = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });

    const db = app.firestore();
    await db.collection("users").limit(1).get();
    ok(`Firebase Admin conectado ao projeto ${serviceAccount.project_id}.`);
    return true;
  } catch (error) {
    fail(`Firebase Admin falhou: ${error instanceof Error ? error.message : "erro desconhecido"}`);
    return false;
  }
}

async function checkGoogleCalendar(serviceAccount) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!serviceAccount) {
    fail("GOOGLE_CALENDAR_SERVICE_ACCOUNT ausente.");
    return false;
  }

  if (!calendarId) {
    fail("GOOGLE_CALENDAR_ID ausente.");
    return false;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const calendarInfo = await calendar.calendars.get({
      calendarId,
    });

    ok(`Google Calendar acessível: ${calendarInfo.data.summary || calendarId}.`);

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

    const events = await calendar.events.list({
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: 5,
    });

    ok(`Leitura de agenda funcionando. ${events.data.items?.length || 0} evento(s) inspecionado(s).`);

    const tutorEmail = process.env.GOOGLE_CALENDAR_TUTOR_EMAIL;
    if (tutorEmail) {
      ok(`Tutor configurado para confirmação: ${tutorEmail}.`);
    } else {
      warn("GOOGLE_CALENDAR_TUTOR_EMAIL ausente. O tutor não será identificado para liberar o Pilar 3 automaticamente.");
    }

    return true;
  } catch (error) {
    fail(`Google Calendar falhou: ${error instanceof Error ? error.message : "erro desconhecido"}`);
    return false;
  }
}

async function main() {
  loadEnvFromFiles();

  console.log("Diagnóstico de agendamentos ao vivo\n");

  const requiredKeys = [
    "FIREBASE_SERVICE_ACCOUNT",
    "GOOGLE_CALENDAR_SERVICE_ACCOUNT",
    "GOOGLE_CALENDAR_ID",
  ];

  for (const key of requiredKeys) {
    if (process.env[key]) {
      ok(`${key} encontrado.`);
    } else {
      fail(`${key} ausente.`);
    }
  }

  const optionalKeys = [
    "GOOGLE_CALENDAR_TUTOR_EMAIL",
    "GOOGLE_CALENDAR_TIMEZONE",
    "GOOGLE_CALENDAR_SLOT_DURATION_MINUTES",
    "GOOGLE_CALENDAR_SLOT_GAP_MINUTES",
    "GOOGLE_CALENDAR_WORKDAY_START_HOUR",
    "GOOGLE_CALENDAR_WORKDAY_END_HOUR",
    "GOOGLE_CALENDAR_WORKDAYS",
  ];

  for (const key of optionalKeys) {
    if (process.env[key]) {
      ok(`${key} configurado.`);
    } else {
      warn(`${key} não configurado. O sistema usa padrão interno.`);
    }
  }

  let firebaseAccount = null;
  let googleAccount = null;

  try {
    firebaseAccount = parseJsonEnv("FIREBASE_SERVICE_ACCOUNT");
  } catch (error) {
    fail(error instanceof Error ? error.message : "FIREBASE_SERVICE_ACCOUNT inválido.");
  }

  try {
    googleAccount = parseJsonEnv("GOOGLE_CALENDAR_SERVICE_ACCOUNT");
  } catch (error) {
    fail(error instanceof Error ? error.message : "GOOGLE_CALENDAR_SERVICE_ACCOUNT inválido.");
  }

  console.log("");
  const firebaseOk = await checkFirebase(firebaseAccount);
  const calendarOk = await checkGoogleCalendar(googleAccount);

  console.log("");
  if (firebaseOk && calendarOk) {
    ok("Integração pronta para uso real.");
    process.exit(0);
  }

  fail("Integração ainda não está pronta. Corrija os itens acima e rode novamente.");
  process.exit(1);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : "Falha inesperada.");
  process.exit(1);
});
