const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = admin.firestore();

// Passenger login
exports.loginPassenger = async (req, res) => {
  try {
    const { username, password } = req.body;

    const snapshot = await db
      .collection("passengers")
      .where("username", "==", username)
      .get();

    if (snapshot.empty) return res.status(400).json({ message: "User not found" });

    const passenger = snapshot.docs[0].data();

    const isMatch = await bcrypt.compare(password, passenger.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username: passenger.username }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create passenger account
exports.registerPassenger = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const snapshot = await db.collection("passengers").where("username", "==", username).get();
    if (!snapshot.empty) return res.status(400).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);

    await db.collection("passengers").add({ username, password: hashed });

    res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};