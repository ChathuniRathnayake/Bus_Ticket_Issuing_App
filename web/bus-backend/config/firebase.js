// config/firebase.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read service account JSON safely
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "serviceAccountKey.json"),
    "utf-8"
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };