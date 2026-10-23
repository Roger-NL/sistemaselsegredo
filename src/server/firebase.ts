import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** One lazy bootstrap. Importing a handler never initializes credentials or contacts Firebase. */
function getAdminApp() {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "esenglishacad" });
  try {
    const account = JSON.parse(raw);
    if (typeof account.private_key === "string") account.private_key = account.private_key.replace(/\\n/g, "\n");
    return initializeApp({ credential: cert(account) });
  } catch {
    // Do not log credentials or silently fall back to another identity.
    throw new Error("FIREBASE_SERVICE_ACCOUNT_INVALID");
  }
}

export function getAdminAuth() { return getAuth(getAdminApp()); }
export function getAdminDb() { return getFirestore(getAdminApp()); }
