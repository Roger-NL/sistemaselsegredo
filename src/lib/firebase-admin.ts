import * as admin from 'firebase-admin';

// Protect against multiple initializations
if (!admin.apps.length) {
  admin.initializeApp({
    // Usa as credenciais de ambiente nativo se no backend Google. 
    // Em dev (localhost), pode falhar sem variável GOOGLE_APPLICATION_CREDENTIALS
    // Se falhar em dev local, vamos usar o projectId padrão
    projectId: 'esenglishacad',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
