const { db } = require("../config/firebase");

//////////////////////////////////////////////////////
// 👤 USER MANAGEMENT
//////////////////////////////////////////////////////

exports.createUser = async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    await db.collection("users").doc(userId).set({
      userId,
      email,
      name,
      memberType: "Standard Member",
      theme: "light",
      notifications: true,
    });

    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", req.params.email)
      .get();

    if (snapshot.empty)
      return res.json({ success: false, message: "User not found" });

    res.json({
      success: true,
      data: snapshot.docs[0].data(),
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//////////////////////////////////////////////////////
// 📅 APPOINTMENTS
//////////////////////////////////////////////////////

exports.createAppointment = async (req, res) => {
  try {
    const data = req.body;

    const doc = await db.collection("appointments").add({
      ...data,
      status: "upcoming",
      timestamp: Date.now(),
      createdAt: new Date(),
    });

    res.json({ success: true, id: doc.id });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const snapshot = await db
      .collection("appointments")
      .where("userId", "==", req.params.uid)
      .get();

    let upcoming = [];
    let past = [];

    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };

      if (data.status === "completed") past.push(data);
      else upcoming.push(data);
    });

    res.json({ success: true, data: { upcoming, past } });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//////////////////////////////////////////////////////
// ⏱️ QUEUE SYSTEM (CORE DASHBOARD FEATURE)
//////////////////////////////////////////////////////

exports.getQueueStatus = async (req, res) => {
  try {
    const uid = req.params.uid;

    const snapshot = await db
      .collection("appointments")
      .orderBy("timestamp")
      .get();

    let position = 0;
    let totalWaiting = 0;
    let found = false;
    let serviceName = "";

    snapshot.forEach((doc) => {
      const d = doc.data();

      if (d.status === "upcoming") {
        totalWaiting++;

        if (!found) position++;

        if (d.userId === uid) {
          found = true;
          serviceName = d.serviceName;
        }
      }
    });

    const queueDoc = await db.collection("queue").doc("main").get();
    const avgTime = queueDoc.exists ? queueDoc.data().avgServiceTime : 10;

    res.json({
      success: true,
      data: {
        position,
        totalWaiting,
        serviceName,
        estimatedTime: `${position * avgTime} mins`,
        currentNumber: `A-${String(position).padStart(3, "0")}`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.refreshQueue = async (req, res) => {
  return exports.getQueueStatus(req, res);
};

//////////////////////////////////////////////////////
// 🔔 NOTIFICATIONS
//////////////////////////////////////////////////////

exports.getNotifications = async (req, res) => {
  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", req.params.uid)
      .get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("notifications").doc(id).update({
      read: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//////////////////////////////////////////////////////
// 📊 DASHBOARD STATS (YOUR UI CARDS)
//////////////////////////////////////////////////////

exports.getStats = async (req, res) => {
  try {
    const uid = req.params.uid;

    // Completed
    const completedSnap = await db
      .collection("appointments")
      .where("userId", "==", uid)
      .where("status", "==", "completed")
      .get();

    const completed = completedSnap.size;

    // Waiting
    const waitingSnap = await db
      .collection("appointments")
      .where("status", "==", "upcoming")
      .get();

    const waiting = waitingSnap.size;

    // Satisfaction
    const feedbackSnap = await db
      .collection("feedback")
      .where("userId", "==", uid)
      .get();

    let total = 0;
    let count = 0;

    feedbackSnap.forEach((d) => {
      total += d.data().rating;
      count++;
    });

    const satisfaction = count ? Math.round((total / count) * 20) : 0;

    res.json({
      success: true,
      data: {
        waiting,
        completed,
        satisfaction: `${satisfaction}%`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//////////////////////////////////////////////////////
// 📢 ANNOUNCEMENTS
//////////////////////////////////////////////////////

exports.getAnnouncements = async (req, res) => {
  try {
    const snapshot = await db.collection("announcements").get();

    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};