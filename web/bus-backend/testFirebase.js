// testFirebase.js
import { db, admin } from "./config/firebase.js";

async function testFirestore() {
  try {
    // Add a test document to 'testCollection'
    const docRef = db.collection("testCollection").doc("testDoc");
    await docRef.set({
      message: "Firebase Admin SDK is working!",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Test document written successfully");

    // Read it back
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testFirestore();