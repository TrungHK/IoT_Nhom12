const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;

function initFirebase() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  const resolvedPath = path.resolve(serviceAccountPath);

  if (fs.existsSync(resolvedPath)) {
    const serviceAccount = require(resolvedPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('[Firebase] Initialized with Service Account Key file.');
  } else {
    console.warn(`[Firebase Warning] Service account file not found at ${resolvedPath}. Running in offline/mock mode.`);
    admin.initializeApp({
      projectId: 'smart-parking-iot',
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }

  db = admin.database();
  return { admin, db };
}

module.exports = {
  initFirebase,
  getDb: () => db,
  admin
};
