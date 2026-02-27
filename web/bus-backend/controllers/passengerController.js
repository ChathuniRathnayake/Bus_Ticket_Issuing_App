import { admin, db } from "../config/firebase.js";
import bcrypt from "bcryptjs";


/* =====================================================
   REGISTER PASSENGER (Email + Password, hashed)
===================================================== */
export const registerPassenger = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1️⃣ Check if passenger already exists
    const existing = await db.collection("passengers").where("email", "==", email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      displayName: `${firstName || ""} ${lastName || ""}`,
    });
    const passengerId = userRecord.uid;

    // 4️⃣ Store in USERS collection (add password here!)
    await db.collection("users").doc(passengerId).set({
      email,
      name: `${firstName || ""} ${lastName || ""}`,
      role: "passenger",
      password: hashedPassword, // 🔒 store hashed password
      createdAt: new Date(),
    });

    // 5️⃣ Store in PASSENGERS collection
    await db.collection("passengers").doc(passengerId).set({
      passengerId,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      password: hashedPassword, // 🔒 store hashed password
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Passenger registered successfully" });

  } catch (error) {
    console.error("Register passenger error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =====================================================
   LOGIN PASSENGER (Email + Password, hashed)
===================================================== */
export const loginPassenger = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1️⃣ Find passenger by email
    const snapshot = await db.collection("passengers").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Passenger not found" });
    }

    const passengerDoc = snapshot.docs[0];
    const passengerData = passengerDoc.data();

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, passengerData.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Generate custom token (optional if you want Firebase Auth token)
    const token = await admin.auth().createCustomToken(passengerDoc.id);

    res.status(200).json({
      message: "Login successful",
      token,
      passenger: {
        passengerId: passengerData.passengerId,
        email: passengerData.email,
        firstName: passengerData.firstName,
        lastName: passengerData.lastName,
      },
    });

  } catch (error) {
    console.error("Login passenger error:", error);
    res.status(500).json({ message: "Server error" });
  }
};