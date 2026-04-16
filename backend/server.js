const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

// ============================================
// FIREBASE INIT
// ============================================

const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require("./routes/authRoutes");
const nicBookingRoutes = require("./routes/nicBookingRoutes");
const passportBookingRoutes = require("./routes/passportBookingRoutes");

// ============================================
// EXPRESS APP
// ============================================

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "SmartQueue API Running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      nicBooking: "/api/nic-booking",
      passportBooking: "/api/passport-booking",
    },
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// ============================================
// ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/nic-booking", nicBookingRoutes);
app.use("/api/passport-booking", passportBookingRoutes);

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
    console.error("❌ Error fetching user:", err);
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

    res.json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/user/:userId", async (req, res) => {
  try {
    await db.ref("users/" + req.params.userId).update({
      ...req.body,
      updatedAt: Date.now(),
    });

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// ANNOUNCEMENTS
// ============================================

app.get("/api/announcements", async (req, res) => {
  try {
    const defaultAnnouncements = [
      {
        id: "1",
        title: "System Maintenance",
        description: "Scheduled maintenance on Sunday 10 PM - 2 AM",
        icon: "construct-outline",
        color: "#F59E0B",
      },
      {
        id: "2",
        title: "New Service Available",
        description: "Passport applications now available online",
        icon: "airplane-outline",
        color: "#3B82F6",
      },
      {
        id: "3",
        title: "Holiday Notice",
        description: "Offices closed on Poya Day",
        icon: "calendar-outline",
        color: "#10B981",
      },
    ];

    const snapshot = await db.ref("announcements").once("value");
    const data = snapshot.val();

    if (data) {
      res.json({ success: true, data: Object.values(data) });
    } else {
      await db.ref("announcements").set(defaultAnnouncements);
      res.json({ success: true, data: defaultAnnouncements });
    }
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVICE ARRANGEMENTS
// ============================================

app.get("/api/service-arrangements", async (req, res) => {
  try {
    const defaultArrangements = [
      {
        title: "NIC Services",
        description: "Counter 1-5 • Ground Floor",
        icon: "card-account-details-outline",
        color: "#3B82F6",
      },
      {
        title: "Passport Services",
        description: "Counter 6-10 • First Floor",
        icon: "airplane",
        color: "#0F172A",
      },
      {
        title: "Driving License",
        description: "Counter 11-15 • Second Floor",
        icon: "car",
        color: "#10B981",
      },
    ];

    const snapshot = await db.ref("serviceArrangements").once("value");
    const data = snapshot.val();

    if (data) {
      res.json({ success: true, data: Object.values(data) });
    } else {
      await db.ref("serviceArrangements").set(defaultArrangements);
      res.json({ success: true, data: defaultArrangements });
    }
  } catch (error) {
    console.error("❌ Error fetching service arrangements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.ref(`notifications/${userId}`).once("value");
    const data = snapshot.val() || {};

    const notifications = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...value,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/notifications/:userId/:notificationId", async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    await db.ref(`notifications/${userId}/${notificationId}`).update({
      read: true,
      readAt: Date.now(),
    });

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Error updating notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// NEARBY FACILITIES
// ============================================

app.get("/api/nearby-facilities", async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        url: "https://www.google.com/maps/search/Department+of+Immigration+and+Emigration+Sri+Lanka",
      },
    });
  } catch (error) {
    console.error("❌ Error getting nearby facilities:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// LEGACY APPOINTMENTS
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
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ success: false, error: err.message });
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
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ success: false, error: err.message });
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
    console.error("❌ Error fetching queue:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SmartQueue API Running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️ Database: Firebase Realtime Database`);
  console.log(`📍 Local: http://localhost:${PORT}`);
});

module.exports = app;