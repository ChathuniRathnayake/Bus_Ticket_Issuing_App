const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const passengerRoutes = require("./routes/passengerRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/passenger", passengerRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));