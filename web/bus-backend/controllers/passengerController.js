import { admin, db } from "../config/firebase.js";


// =========================
// 🔐 REGISTER
// =========================
export const registerPassenger = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password required"
      });
    }

    // Create Firebase Auth user
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    // Store passenger profile
    await db.collection("passengers").doc(user.uid).set({
      uid: user.uid,
      username,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      password, // ⚠️ Plain for now (can hash later)
      createdAt: new Date()
    });

    res.status(201).json({
      message: "Passenger registered successfully"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// 🔐 LOGIN (USERNAME + PASSWORD)
// =========================
export const loginPassenger = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    // Find passenger
    const snapshot = await db
      .collection("passengers")
      .where("username", "==", username)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: "Passenger not found"
      });
    }

    const passengerDoc = snapshot.docs[0];
    const passengerData = passengerDoc.data();

    // Password check
    if (passengerData.password !== password) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Create Firebase custom token
    const token = await admin.auth().createCustomToken(passengerDoc.id);

    res.json({
      message: "Login successful",
      token,
      passenger: passengerData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// 👤 GET PROFILE
// =========================
export const getPassengerProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const doc = await db.collection("passengers").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        message: "Passenger not found"
      });
    }

    res.json(doc.data());

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// ✏️ UPDATE PROFILE
// =========================

export const updatePassengerProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const {
      firstName,
      lastName,
      phone,
      profilePic
    } = req.body;

    await db.collection("passengers")
      .doc(uid)
      .update({
        firstName,
        lastName,
        phone,
        profilePic
      });

    res.json({
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


// =========================
// 🔎 SEARCH BUSES
// =========================
export const searchBuses = async (req, res) => {
  try {
    const snapshot = await db.collection("buses").get();

    const buses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(buses);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// 💺 GET BUS SEATS
// =========================
export const getBusSeats = async (req, res) => {
  try {
    const { busId } = req.params;

    const busDoc = await db.collection("buses").doc(busId).get();

    if (!busDoc.exists) {
      return res.status(404).json({
        message: "Bus not found"
      });
    }

    res.json(busDoc.data());

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =========================
// 🎟 BOOK SEAT
// =========================
export const bookSeat = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { busId, seatNumber } = req.body;

    if (!busId || !seatNumber) {
      return res.status(400).json({
        message: "Bus ID and seat number required"
      });
    }

    const existing = await db.collection("bookings")
    .where("busId", "==", busId)
    .where("seatNumber", "==", seatNumber)
    .get();

if (!existing.empty) {
  return res.status(400).json({
    message: "Seat already booked"
  });
}

    res.json({
      message: "Seat booked successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};