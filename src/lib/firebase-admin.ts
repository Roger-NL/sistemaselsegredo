import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (raw) {
    try {
      const lastBrace = raw.lastIndexOf('}');
      const serviceAccountKey = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('[firebase-admin] Erro ao parsear FIREBASE_SERVICE_ACCOUNT:', e);
      admin.initializeApp({ projectId: 'esenglishacad' });
    }
  } else {
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT não configurado — usando ADC (falha no Vercel sem esta var)');
    admin.initializeApp({ projectId: 'esenglishacad' });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();