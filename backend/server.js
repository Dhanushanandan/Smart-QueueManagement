const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: "SmartQueue API Server is running!",
    endpoints: [
      "GET  /api/user/:email",
      "POST /api/user",
      "PUT  /api/user/:userId",
      "GET  /api/announcements",
      "GET  /api/service-arrangements",
      "GET  /api/queue/:userId",
      "POST /api/queue/refresh/:userId",
      "GET  /api/appointments/:userId",
      "POST /api/appointments",
      "GET  /api/notifications/:userId",
      "PUT  /api/notifications/:userId/:notificationId",
      "GET  /api/nearby-facilities",
      "GET  /api/stats/:userId"
    ]
  });
});

// ============================================
// USER ROUTES
// ============================================

app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const snapshot = await db.collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({ success: false, message: "User not found" });
    }

    const userData = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/user', async (req, res) => {
  try {
    const userData = req.body;
    const userRef = db.collection("users").doc(userData.userId);
    
    const newUser = {
      userId: userData.userId,
      name: userData.name || "User",
      email: userData.email,
      memberType: userData.memberType || "Standard Member",
      theme: userData.theme || "light",
      notifications: userData.notifications !== undefined ? userData.notifications : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(newUser);
    
    res.json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    await db.collection("users").doc(userId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STATS ROUTE
// ============================================

app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get waiting count (upcoming appointments)
    const waitingSnap = await db.collection("appointments")
      .where("status", "in", ["upcoming", "pending", "confirmed"])
      .get();
    const waiting = waitingSnap.size;

    // Get completed count for this user
    const completedSnap = await db.collection("appointments")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .get();
    const completed = completedSnap.size;

    // Calculate satisfaction from feedback
    const feedbackSnap = await db.collection("feedback")
      .where("userId", "==", userId)
      .get();

    let totalRating = 0;
    let ratingCount = 0;

    feedbackSnap.forEach(doc => {
      const rating = doc.data().rating;
      if (rating) {
        totalRating += rating;
        ratingCount++;
      }
    });

    const satisfaction = ratingCount > 0 
      ? Math.round((totalRating / (ratingCount * 5)) * 100)
      : 98; // Default if no feedback

    res.json({
      success: true,
      data: { waiting, completed, satisfaction }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ANNOUNCEMENTS ROUTES
// ============================================

app.get('/api/announcements', async (req, res) => {
  try {
    const snapshot = await db.collection("announcements")
      .where("active", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVICE ARRANGEMENTS ROUTES
// ============================================

app.get('/api/service-arrangements', async (req, res) => {
  try {
    const snapshot = await db.collection("serviceArrangements")
      .where("active", "==", true)
      .orderBy("order")
      .get();

    const arrangements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: arrangements });
  } catch (error) {
    console.error('Error fetching service arrangements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// QUEUE ROUTES
// ============================================

app.get('/api/queue/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all upcoming appointments ordered by creation time
    const snapshot = await db.collection("appointments")
      .where("status", "in", ["upcoming", "pending", "confirmed", "processing"])
      .orderBy("createdAt")
      .get();

    let position = 0;
    let totalWaiting = 0;
    let found = false;
    let userAppointment = null;
    let currentNumber = "A-000";

    const appointments = [];
    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      appointments.push(data);
      
      if (data.userId === userId) {
        found = true;
        userAppointment = data;
        position = totalWaiting + 1;
      }
      
      if (data.status !== "completed" && data.status !== "cancelled") {
        totalWaiting++;
      }
    });

    // Get average service time
    const queueDoc = await db.collection("settings").doc("queue").get();
    const avgServiceTime = queueDoc.exists ? queueDoc.data().avgServiceTime || 10 : 10;

    // Calculate estimated time
    const estimatedMinutes = position * avgServiceTime;
    const estimatedTime = estimatedMinutes < 60 
      ? `${estimatedMinutes} mins`
      : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

    // Get current serving number
    if (appointments.length > 0 && appointments[0].status === "processing") {
      currentNumber = appointments[0].queueNumber || "A-001";
    }

    const queueData = {
      position: found ? position : 0,
      estimatedTime,
      serviceName: userAppointment?.serviceName || "No Active Service",
      status: userAppointment?.status || "inactive",
      currentNumber,
      totalWaiting: Math.max(0, totalWaiting - 1),
      connectionId: userId,
      avgServiceTime
    };

    res.json({ success: true, data: queueData });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/queue/refresh/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return fresh queue data
    const snapshot = await db.collection("appointments")
      .where("status", "in", ["upcoming", "pending", "confirmed", "processing"])
      .orderBy("createdAt")
      .get();

    let position = 0;
    let totalWaiting = 0;
    let userAppointment = null;

    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      
      if (data.userId === userId) {
        userAppointment = data;
        position = totalWaiting + 1;
      }
      
      if (data.status !== "completed" && data.status !== "cancelled") {
        totalWaiting++;
      }
    });

    const queueDoc = await db.collection("settings").doc("queue").get();
    const avgServiceTime = queueDoc.exists ? queueDoc.data().avgServiceTime || 10 : 10;

    const estimatedMinutes = position * avgServiceTime;
    const estimatedTime = estimatedMinutes < 60 
      ? `${estimatedMinutes} mins`
      : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

    res.json({
      success: true,
      data: {
        position,
        estimatedTime,
        serviceName: userAppointment?.serviceName || "No Active Service",
        status: userAppointment?.status || "inactive",
        totalWaiting: Math.max(0, totalWaiting - 1),
        avgServiceTime
      }
    });
  } catch (error) {
    console.error('Error refreshing queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// SSE Stream for real-time updates
app.get('/api/queue/stream/:userId', async (req, res) => {
  const { userId } = req.params;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial data
  const sendQueueUpdate = async () => {
    try {
      const snapshot = await db.collection("appointments")
        .where("status", "in", ["upcoming", "pending", "confirmed", "processing"])
        .orderBy("createdAt")
        .get();

      let position = 0;
      let totalWaiting = 0;
      let userAppointment = null;

      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        
        if (data.userId === userId) {
          userAppointment = data;
          position = totalWaiting + 1;
        }
        
        if (data.status !== "completed" && data.status !== "cancelled") {
          totalWaiting++;
        }
      });

      const queueDoc = await db.collection("settings").doc("queue").get();
      const avgServiceTime = queueDoc.exists ? queueDoc.data().avgServiceTime || 10 : 10;

      const estimatedMinutes = position * avgServiceTime;
      const estimatedTime = estimatedMinutes < 60 
        ? `${estimatedMinutes} mins`
        : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

      const data = {
        position,
        estimatedTime,
        serviceName: userAppointment?.serviceName || "No Active Service",
        status: userAppointment?.status || "inactive",
        totalWaiting: Math.max(0, totalWaiting - 1),
        timestamp: Date.now()
      };

      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('SSE error:', error);
    }
  };

  await sendQueueUpdate();
  
  const interval = setInterval(sendQueueUpdate, 10000);
  
  // Listen for Firestore changes
  const unsubscribe = db.collection("appointments")
    .where("status", "in", ["upcoming", "pending", "confirmed", "processing"])
    .onSnapshot(async () => {
      await sendQueueUpdate();
    });

  req.on('close', () => {
    clearInterval(interval);
    unsubscribe();
  });
});

// ============================================
// APPOINTMENTS ROUTES
// ============================================

app.get('/api/appointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.collection("appointments")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const upcoming = [];
    const past = [];

    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      
      if (data.status === "completed" || data.status === "cancelled") {
        past.push(data);
      } else {
        upcoming.push(data);
      }
    });

    res.json({ success: true, data: { upcoming, past } });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointmentData = req.body;

    // Generate queue number
    const queueSnapshot = await db.collection("appointments")
      .where("status", "in", ["upcoming", "pending", "confirmed", "processing"])
      .get();
    
    const queueNumber = `A-${String(queueSnapshot.size + 1).padStart(3, '0')}`;

    const newAppointment = {
      ...appointmentData,
      queueNumber,
      status: "upcoming",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("appointments").add(newAppointment);

    // Create notification
    await db.collection("notifications").add({
      userId: appointmentData.userId,
      title: "Appointment Confirmed",
      message: `Your ${appointmentData.serviceName} appointment is confirmed. Queue number: ${queueNumber}`,
      type: "appointment",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      id: docRef.id,
      data: { ...newAppointment, id: docRef.id }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/notifications/:userId/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection("notifications").doc(notificationId).update({
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// NEARBY FACILITIES
// ============================================

app.get('/api/nearby-facilities', (req, res) => {
  res.json({
    success: true,
    data: {
      url: "https://www.google.com/maps/search/hospitals+clinics+pharmacies+near+me"
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});