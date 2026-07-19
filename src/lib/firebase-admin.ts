import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (raw) {
    try {
      const lastBrace = raw.lastIndexOf('}');
      const trimmed = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;
      const cleaned = trimmed.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      const serviceAccount = JSON.parse(cleaned);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error('[firebase-admin] Erro ao parsear FIREBASE_SERVICE_ACCOUNT:', e);
      initializeApp({ projectId: 'esenglishacad' });
    }
  } else {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT não configurado — usando ADC (falha no Vercel sem esta var)');
    initializeApp({ projectId: 'esenglishacad' });
  }
}

const adminApp = getApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
