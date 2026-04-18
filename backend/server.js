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


const ACTIVE_STATUSES = ["upcoming", "pending", "confirmed", "processing"];
const SERVICE_CONFIG = {
  nic: { node: "nic_bookings", prefix: "NIC", label: (value) => value.serviceType === "renewal" ? "NIC Renewal" : "NIC Registration" },
  passport: { node: "passport_bookings", prefix: "PPT", label: (value) => value.serviceType === "renewal" ? "Passport Renewal" : "Passport" },
  license: { node: "license_bookings", prefix: "DL", label: (value) => value.serviceType === "renewal" ? "Driving License Renewal" : "Driving License" },
};

const normalizeStatus = (status = "") => (status || "confirmed").toLowerCase();

const parseDateTimeFromTimeslot = (timeslot = "") => {
  if (!timeslot || typeof timeslot !== "string") {
    return { date: "", time: "", timestamp: 0 };
  }

  const trimmed = timeslot.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.*))?$/);
  let date = "";
  let time = "";

  if (match) {
    date = match[1] || "";
    time = (match[2] || "").trim();
  } else {
    const parts = trimmed.split(" ");
    date = parts[0] || "";
    time = parts.slice(1).join(" ").trim();
  }

  let timestamp = 0;
  if (date && time) {
    const parsed = new Date(`${date} ${time}`);
    timestamp = Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  } else if (date) {
    const parsed = new Date(date);
    timestamp = Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  return { date, time, timestamp };
};

const buildAppointmentFromBooking = (serviceKey, id, value) => {
  const info = value.appointmentInfo || {};
  const parsed = parseDateTimeFromTimeslot(info.timeslot || `${info.date || ""} ${info.time || ""}`.trim());
  return {
    id,
    userId: value.userId || "",
    source: serviceKey,
    service: serviceKey,
    serviceName: SERVICE_CONFIG[serviceKey].label(value),
    status: normalizeStatus(info.status),
    date: info.date || parsed.date || "",
    time: info.time || parsed.time || "",
    timeslot: info.timeslot || `${info.date || parsed.date || ""} ${info.time || parsed.time || ""}`.trim(),
    appointmentTimestamp: parsed.timestamp || info.confirmedAt || value.createdAt || 0,
    createdAt: value.createdAt || 0,
    queueNumber: info.queueNumber || value.queueNumber || value.bookingId || "",
    tokenNumber: info.tokenNumber || value.tokenNumber || null,
    bookingId: value.bookingId || "",
    fullName: value.personalInfo?.fullName || "",
  };
};

const readServiceBookingsForUser = async (serviceKey, userId) => {
  const snapshot = await db.ref(SERVICE_CONFIG[serviceKey].node).orderByChild("userId").equalTo(userId).once("value");
  return Object.entries(snapshot.val() || {}).map(([id, value]) => buildAppointmentFromBooking(serviceKey, id, value));
};

const readAllServiceBookings = async () => {
  const snapshots = await Promise.all(
    Object.entries(SERVICE_CONFIG).map(async ([serviceKey, config]) => {
      const snapshot = await db.ref(config.node).once("value");
      return [serviceKey, snapshot.val() || {}];
    })
  );

  return snapshots.flatMap(([serviceKey, records]) =>
    Object.entries(records).map(([id, value]) => buildAppointmentFromBooking(serviceKey, id, value))
  );
};

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require("./routes/authRoutes");
const nicBookingRoutes = require("./routes/nicBookingRoutes");
const passportBookingRoutes = require("./routes/passportBookingRoutes");
const licenseBookingRoutes = require("./routes/licenseBookingRoutes");

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
      licenseBooking: "/api/license-booking",
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
app.use("/api/license-booking", licenseBookingRoutes);

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
    const { userId } = req.params;

    const [legacySnapshot, nicAppointments, passportAppointments, licenseAppointments] = await Promise.all([
      db.ref("appointments").once("value"),
      readServiceBookingsForUser("nic", userId),
      readServiceBookingsForUser("passport", userId),
      readServiceBookingsForUser("license", userId),
    ]);

    const legacyAppointments = Object.entries(legacySnapshot.val() || {})
      .map(([id, value]) => ({
        id,
        ...value,
        source: "legacy",
        service: value.service || "appointment",
        serviceName: value.serviceName || value.service || "Appointment",
        status: normalizeStatus(value.status),
        queueNumber: value.queueNumber || value.bookingId || "",
        tokenNumber: value.tokenNumber || null,
        appointmentTimestamp: value.createdAt || 0,
      }))
      .filter((item) => item.userId === userId);

    const result = [
      ...legacyAppointments,
      ...nicAppointments,
      ...passportAppointments,
      ...licenseAppointments,
    ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// QUEUE
// ============================================

const buildQueueResponse = async (userId) => {
  const activeBookings = (await readAllServiceBookings()).filter((item) => ACTIVE_STATUSES.includes(item.status));
  const userActiveBookings = activeBookings
    .filter((item) => item.userId === userId)
    .sort((a, b) => (a.appointmentTimestamp || a.createdAt || 0) - (b.appointmentTimestamp || b.createdAt || 0));

  const activeBooking = userActiveBookings[0];

  if (!activeBooking) {
    return {
      position: 0,
      totalWaiting: 0,
      estimatedTime: "0 mins",
      connectionId: "",
      serviceName: "No Active Service",
      status: "completed",
      currentNumber: "A-000",
      queueNumber: "",
      tokenNumber: null,
      timeslot: "",
      date: "",
      time: "",
    };
  }

  const sameQueue = activeBookings
    .filter((item) => item.service === activeBooking.service && item.date === activeBooking.date && item.time === activeBooking.time)
    .sort((a, b) => {
      const aToken = Number(a.tokenNumber || Number.MAX_SAFE_INTEGER);
      const bToken = Number(b.tokenNumber || Number.MAX_SAFE_INTEGER);
      if (aToken !== bToken) return aToken - bToken;
      return (a.appointmentTimestamp || a.createdAt || 0) - (b.appointmentTimestamp || b.createdAt || 0);
    });

  const positionIndex = sameQueue.findIndex((item) => item.id === activeBooking.id);
  const position = positionIndex >= 0 ? positionIndex + 1 : 0;
  const peopleAhead = Math.max(0, position - 1);

  return {
    position,
    totalWaiting: peopleAhead,
    estimatedTime: `${peopleAhead * 10} mins`,
    connectionId: activeBooking.bookingId || activeBooking.id,
    serviceName: activeBooking.serviceName,
    status: activeBooking.status,
    currentNumber: sameQueue[0]?.queueNumber || activeBooking.queueNumber || "A-000",
    queueNumber: activeBooking.queueNumber,
    tokenNumber: activeBooking.tokenNumber,
    timeslot: activeBooking.timeslot,
    date: activeBooking.date,
    time: activeBooking.time,
  };
};

app.get("/api/queue/:userId", async (req, res) => {
  try {
    const data = await buildQueueResponse(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error fetching queue:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/queue/refresh/:userId", async (req, res) => {
  try {
    const data = await buildQueueResponse(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error refreshing queue:", err);
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

  const refs = Object.values(SERVICE_CONFIG).map((config) => db.ref(config.node));

  const pushUpdate = async () => {
    try {
      const data = await buildQueueResponse(userId);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error("❌ Error streaming queue:", error);
    }
  };

  refs.forEach((ref) => ref.on("value", pushUpdate));
  pushUpdate();

  req.on("close", () => {
    refs.forEach((ref) => ref.off("value", pushUpdate));
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