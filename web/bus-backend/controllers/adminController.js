import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = admin.firestore();

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin in Firestore
    const snapshot = await db
      .collection("admins")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const adminData = snapshot.docs[0].data();

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      adminData.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: adminData.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};