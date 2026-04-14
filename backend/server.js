const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// 🔥 ROUTES
const authRoutes = require("./routes/authRoutes");

dotenv.config();

// ============================================
// FIREBASE INIT (Realtime DB)
// ============================================

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://smartqueuemanagement-5fa87-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const db = admin.database();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// ROUTES (OPTION 1 CLEAN STRUCTURE)
// ============================================

// Auth routes
app.use("/api/auth", authRoutes);

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({ message: "SmartQueue API Running 🚀" });
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

    res.json({
      success: true,
      data: { userId, ...data[userId] },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user", async (req, res) => {
  try {
    const user = req.body;

    await db.ref("users/" + user.userId).set({
      ...user,
      createdAt: Date.now(),
    });

    res.json({ success: true });
  } catch (err) {
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

    let position = 0;

    list.forEach((item, index) => {
      if (item.userId === req.params.userId) {
        position = index + 1;
      }
    });

    res.json({
      success: true,
      data: {
        position,
        totalWaiting: list.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ============================================
// SSE STREAM
// ============================================

app.get("/api/queue/stream/:userId", (req, res) => {
  const userId = req.params.userId;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const ref = db.ref("appointments");

  const listener = ref.on("value", (snapshot) => {
    const data = snapshot.val() || {};

    const list = Object.values(data);

    let position = 0;

    list.forEach((item, index) => {
      if (item.userId === userId) {
        position = index + 1;
      }
    });

    res.write(`data: ${JSON.stringify({ position })}\n\n`);
  });

  req.on("close", () => {
    ref.off("value", listener);
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SmartQueue API Running on port ${PORT}`);
});