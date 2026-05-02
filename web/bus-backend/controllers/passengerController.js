import { admin, db } from "../config/firebase.js";

// register passenger
export const registerPassenger = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password and name are required",
      });
    }

    const existing = await db
      .collection("passengers")
      .where("email", "==", email)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name, 
    });

    const uid = userRecord.uid;

    await db.collection("users").doc(uid).set({
      uid,
      email,
      name: name, 
      role: "passenger",
      createdAt: new Date(),
    });

    await db.collection("passengers").doc(uid).set({
      passengerId: uid,
      email,
      fullName: name,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Passenger registered successfully",
      uid,
    });

  } catch (error) {
    console.error("Register passenger error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

//login passenger
export const loginPassenger = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userData = snapshot.docs[0].data();
    const uid = snapshot.docs[0].id;

    const token = await admin.auth().createCustomToken(uid, {
      role: userData.role,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    });

  } catch (error) {
    console.error("Login passenger error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};