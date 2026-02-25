// web/bus-backend/config/firebase.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore DB instance
const db = admin.firestore();

// Export using ESM
export { admin, db };