const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = admin.firestore();

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db.collection("admins").where("email", "==", email).get();
    if (snapshot.empty) return res.status(400).json({ message: "Admin not found" });

    const adminData = snapshot.docs[0].data();
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: adminData.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};