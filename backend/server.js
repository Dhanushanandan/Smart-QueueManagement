const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// ROUTES
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// ============================================
// FIREBASE INIT
// ============================================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://smartqueuemanagement-5fa87-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const db = admin.database();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// 🔥 LOG ALL REQUESTS (VERY USEFUL)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// AUTH
app.use("/api/auth", authRoutes);

// ROOT
app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartQueue API Running 🚀" });
});

// ============================================
// USERS
// ============================================

app.get("/api/user/:email", async (req, res) => {
  try {
    const snapshot = await db
      .ref("users")
      .orderByChild("email")
      .equalTo(req.params.email)
      .once("value");

    if (!snapshot.exists()) {
      return res.json({ success: false, message: "User not found" });
    }

    const data = snapshot.val();
    const userId = Object.keys(data)[0];

    return res.json({
      success: true,
      data: { userId, ...data[userId] },
    });
  } catch (err) {
    console.error("❌ USER FETCH ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user", async (req, res) => {
  try {
    const user = req.body;

    if (!user.userId) {
      return res.status(400).json({ success: false, message: "userId required" });
    }

    await db.ref("users/" + user.userId).set({
      ...user,
      createdAt: Date.now(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ CREATE USER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/user/:userId", async (req, res) => {
  try {
    await db.ref("users/" + req.params.userId).update({
      ...req.body,
      updatedAt: Date.now(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ UPDATE USER ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// ============================================
// APPOINTMENTS
// ============================================

app.post("/api/appointments", async (req, res) => {
  try {
    const snapshot = await db.ref("appointments").once("value");
    const count = Object.keys(snapshot.val() || {}).length;

    const queueNumber = `A-${String(count + 1).padStart(3, "0")}`;

    const newAppointment = {
      ...req.body,
      queueNumber,
      status: "upcoming",
      createdAt: Date.now(),
    };

    const ref = db.ref("appointments").push();
    await ref.set(newAppointment);

    res.json({
      success: true,
      id: ref.key,
      data: newAppointment,
    });
  } catch (err) {
    console.error("❌ CREATE APPOINTMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/appointments/:userId", async (req, res) => {
  try {
    const snapshot = await db.ref("appointments").once("value");
    const data = snapshot.val() || {};

    const result = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .filter((a) => a.userId === req.params.userId);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ GET APPOINTMENTS ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// ============================================
// QUEUE
// ============================================

app.get("/api/queue/:userId", async (req, res) => {
  try {
    const snapshot = await db.ref("appointments").once("value");
    const data = snapshot.val() || {};

    const list = Object.entries(data)
      .map(([id, v]) => ({ id, ...v }))
      .filter((a) =>
        ["upcoming", "pending", "confirmed", "processing"].includes(a.status)
      )
      .sort((a, b) => a.createdAt - b.createdAt);

    const position =
      list.findIndex((item) => item.userId === req.params.userId) + 1;

    res.json({
      success: true,
      data: {
        position: position || 0,
        totalWaiting: list.length,
      },
    });
  } catch (err) {
    console.error("❌ QUEUE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// ============================================
// ANNOUNCEMENTS
// ============================================

app.get("/api/announcements", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "New Service Available",
        description: "We added new services!",
      },
      {
        id: 2,
        title: "System Maintenance",
        description: "Sunday 2AM-4AM downtime",
      },
    ],
  });
});

// ============================================
// SERVICE ARRANGEMENTS
// ============================================

app.get("/api/service-arrangements", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Priority Queue",
      },
      {
        id: 2,
        title: "Virtual Assistant",
      },
    ],
  });
});

// ============================================
// GLOBAL 404 HANDLER (🔥 VERY IMPORTANT)
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found ❌",
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SmartQueue API Running on port ${PORT}`);
});