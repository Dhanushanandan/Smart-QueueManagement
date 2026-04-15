const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// 🔥 ROUTES
const authRoutes = require("./routes/authRoutes");
const nicBookingRoutes = require("./routes/nicBookingRoutes");

dotenv.config();

// ============================================
// FIREBASE INIT (Realtime DB)
// ============================================

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://smartqueuemanagement-5fa87-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const db = admin.database();
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Auth routes
app.use("/api/auth", authRoutes);

// NIC Booking routes
app.use("/api/nic-booking", nicBookingRoutes);

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({ 
    message: "SmartQueue API Running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      nicBooking: "/api/nic-booking"
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected"
  });
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
    console.error('❌ Error fetching user:', err);
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
    console.error('❌ Error creating user:', err);
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
    console.error('❌ Error updating user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// NIC BOOKING - DIRECT ROUTES (BACKUP)
// ============================================

// Save personal info (Step 1)
app.post("/api/nic-booking/save-personal/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const personalData = req.body;

    console.log('📝 Saving personal info for user:', userId);
    console.log('Data received:', personalData);

    // Basic validation
    if (!personalData.fullName || !personalData.dob || !personalData.gender || !personalData.mobile) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields'
      });
    }

    // Phone validation - accept both formats (with +94 or starting with 0)
    const phoneRegex = /^(\+94[0-9]{9}|0[0-9]{9})$/;
    if (!phoneRegex.test(personalData.mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number must be 10 digits (e.g., 0771234567 or +94771234567)'
      });
    }

    await db.ref(`temp_bookings/${userId}/personalInfo`).set({
      ...personalData,
      savedAt: Date.now()
    });

    console.log('✅ Personal info saved');

    res.json({
      success: true,
      message: 'Personal information saved temporarily',
      data: personalData
    });
  } catch (error) {
    console.error('❌ Error saving personal info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save verification info (Step 2)
app.post("/api/nic-booking/save-verification/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const verificationData = req.body;

    console.log('📝 Saving verification info for user:', userId);

    // Basic validation
    if (!verificationData.address || !verificationData.district || !verificationData.ds || 
        !verificationData.gn || !verificationData.birthNo || !verificationData.birthDate || 
        !verificationData.citizenship) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields'
      });
    }

    // Check if personal info exists
    const personalSnapshot = await db.ref(`temp_bookings/${userId}/personalInfo`).once('value');
    if (!personalSnapshot.exists()) {
      return res.status(400).json({
        success: false,
        error: 'Please complete personal information first'
      });
    }

    await db.ref(`temp_bookings/${userId}/verificationInfo`).set({
      ...verificationData,
      savedAt: Date.now()
    });

    console.log('✅ Verification info saved');

    res.json({
      success: true,
      message: 'Verification information saved temporarily',
      data: verificationData
    });
  } catch (error) {
    console.error('❌ Error saving verification info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save renewal step 1
app.post("/api/nic-booking/save-renewal-step1/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    console.log('📝 Saving renewal step 1 for user:', userId);

    if (!data.fullName || !data.dob || !data.gender || !data.mobile || !data.oldNicNumber || !data.reason) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields'
      });
    }

    const phoneRegex = /^(\+94[0-9]{9}|0[0-9]{9})$/;
    if (!phoneRegex.test(data.mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number must be 10 digits (e.g., 0771234567 or +94771234567)'
      });
    }

    await db.ref(`temp_renewal_bookings/${userId}/step1`).set({
      ...data,
      savedAt: Date.now()
    });

    console.log('✅ Renewal step 1 saved');

    res.json({
      success: true,
      message: 'Personal and old NIC information saved',
      data: data
    });
  } catch (error) {
    console.error('❌ Error saving renewal step 1:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save renewal step 2 (Police Report)
app.post("/api/nic-booking/save-renewal-step2/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    console.log('📝 Saving renewal step 2 for user:', userId);

    if (!data.policeStation || !data.complaintNumber || !data.complaintDate) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields'
      });
    }

    await db.ref(`temp_renewal_bookings/${userId}/step2`).set({
      ...data,
      savedAt: Date.now()
    });

    console.log('✅ Renewal step 2 saved');

    res.json({
      success: true,
      message: 'Police report information saved',
      data: data
    });
  } catch (error) {
    console.error('❌ Error saving renewal step 2:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save renewal step 3 (Address & Documents)
app.post("/api/nic-booking/save-renewal-step3/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    console.log('📝 Saving renewal step 3 for user:', userId);

    if (!data.address || !data.district || !data.ds || !data.gn || !data.birthNo || !data.birthDate) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields'
      });
    }

    await db.ref(`temp_renewal_bookings/${userId}/step3`).set({
      ...data,
      savedAt: Date.now()
    });

    console.log('✅ Renewal step 3 saved');

    res.json({
      success: true,
      message: 'Address and document information saved',
      data: data
    });
  } catch (error) {
    console.error('❌ Error saving renewal step 3:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TIME SLOT MANAGEMENT
// ============================================

// Get available time slots for manual selection
app.get("/api/nic-booking/available-slots", async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Get existing bookings for tomorrow
    const snapshot = await db.ref('nic_bookings')
      .orderByChild('appointmentInfo/timeslot')
      .once('value');
    
    const bookings = snapshot.val() || {};
    const bookedSlots = new Set();
    
    Object.values(bookings).forEach(booking => {
      if (booking.appointmentInfo?.timeslot && booking.appointmentInfo.status === 'confirmed') {
        bookedSlots.add(booking.appointmentInfo.timeslot);
      }
    });

    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
      '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM'
    ];

    const availableSlots = [];
    
    allSlots.forEach(time => {
      const fullSlot = `${dateString} ${time}`;
      
      // Determine crowd level
      let crowdLevel;
      if (time.includes('09') || time.includes('10')) {
        crowdLevel = 'Less crowded';
      } else if (time.includes('11') || time.includes('01') || time.includes('02')) {
        crowdLevel = 'Moderate';
      } else {
        crowdLevel = 'Busy';
      }
      
      // Only add if not booked
      if (!bookedSlots.has(fullSlot)) {
        availableSlots.push({
          date: dateString,
          time: time,
          fullSlot: fullSlot,
          crowdLevel: crowdLevel,
          available: true
        });
      }
    });

    console.log(`📅 Available slots for ${dateString}: ${availableSlots.length}`);

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('❌ Error getting available slots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI recommended time slot
app.get("/api/nic-booking/recommended-slot/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Get existing bookings
    const snapshot = await db.ref('nic_bookings')
      .orderByChild('appointmentInfo/timeslot')
      .once('value');
    
    const bookings = snapshot.val() || {};
    const bookedSlots = new Set();
    
    Object.values(bookings).forEach(booking => {
      if (booking.appointmentInfo?.timeslot && booking.appointmentInfo.status === 'confirmed') {
        bookedSlots.add(booking.appointmentInfo.timeslot);
      }
    });

    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
      '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM'
    ];

    // AI Logic: Prefer morning slots (less crowded), avoid booked slots
    let recommendedSlot = null;
    
    // First try morning slots (9 AM - 11 AM)
    const morningSlots = allSlots.filter(slot => 
      slot.includes('09:') || slot.includes('10:')
    );
    
    for (const slot of morningSlots) {
      const fullSlot = `${dateString} ${slot}`;
      if (!bookedSlots.has(fullSlot)) {
        recommendedSlot = {
          date: dateString,
          time: slot,
          fullSlot: fullSlot,
          crowdLevel: 'Less crowded'
        };
        break;
      }
    }
    
    // If no morning slots, try afternoon slots
    if (!recommendedSlot) {
      for (const slot of allSlots) {
        const fullSlot = `${dateString} ${slot}`;
        if (!bookedSlots.has(fullSlot)) {
          let crowdLevel = 'Moderate';
          if (slot.includes('01:') || slot.includes('02:')) crowdLevel = 'Moderate';
          else if (slot.includes('03:')) crowdLevel = 'Busy';
          
          recommendedSlot = {
            date: dateString,
            time: slot,
            fullSlot: fullSlot,
            crowdLevel: crowdLevel
          };
          break;
        }
      }
    }

    if (recommendedSlot) {
      await db.ref(`temp_bookings/${userId}/recommendedSlot`).set(recommendedSlot);
    }

    res.json({
      success: true,
      data: recommendedSlot || { message: 'No slots available for tomorrow' }
    });
  } catch (error) {
    console.error('❌ Error getting time slot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TEMP DATA RETRIEVAL
// ============================================

// Get temp data for review
app.get("/api/nic-booking/temp-data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.ref(`temp_bookings/${userId}`).once('value');
    const data = snapshot.val() || {};
    
    res.json({
      success: true,
      data: {
        personalInfo: data.personalInfo || {},
        verificationInfo: data.verificationInfo || {},
        recommendedSlot: data.recommendedSlot || null,
        documents: data.documents || []
      }
    });
  } catch (error) {
    console.error('❌ Error fetching temp data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get temp renewal data
app.get("/api/nic-booking/temp-renewal-data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.ref(`temp_renewal_bookings/${userId}`).once('value');
    const data = snapshot.val() || {};
    
    res.json({
      success: true,
      data: {
        ...data.step1,
        ...data.step2,
        ...data.step3,
        documents: data.documents || []
      }
    });
  } catch (error) {
    console.error('❌ Error fetching renewal temp data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

// Save uploaded document links
app.post("/api/nic-booking/save-documents/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { documents, serviceType } = req.body;

    console.log('📄 Saving documents for user:', userId);

    const storagePath = serviceType === 'registration' 
      ? `temp_bookings/${userId}/documents`
      : `temp_renewal_bookings/${userId}/documents`;

    await db.ref(storagePath).set(documents);

    res.json({
      success: true,
      message: 'Documents saved successfully',
      data: documents
    });
  } catch (error) {
    console.error('❌ Error saving documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// BOOKING CONFIRMATION
// ============================================

// Confirm booking (Registration)
app.post("/api/nic-booking/confirm/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeslot, documents } = req.body;

    if (!timeslot) {
      return res.status(400).json({ success: false, error: 'Time slot is required' });
    }

    const tempSnapshot = await db.ref(`temp_bookings/${userId}`).once('value');
    const tempData = tempSnapshot.val() || {};

    if (!tempData.personalInfo || !tempData.verificationInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required information. Please complete all steps.'
      });
    }

    const bookingId = `NIC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const bookingData = {
      userId,
      bookingId,
      serviceType: 'registration',
      personalInfo: tempData.personalInfo,
      verificationInfo: tempData.verificationInfo,
      documents: documents || [],
      appointmentInfo: {
        timeslot,
        status: 'confirmed',
        confirmedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.ref(`nic_bookings/${bookingId}`).set(bookingData);
    await db.ref(`temp_bookings/${userId}`).remove();

    const queueNumber = `NIC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    console.log('✅ Registration confirmed:', bookingId);

    res.json({
      success: true,
      message: 'NIC Appointment confirmed successfully! 🎉',
      data: {
        bookingId,
        queueNumber,
        timeslot,
        confirmedAt: bookingData.appointmentInfo.confirmedAt
      }
    });
  } catch (error) {
    console.error('❌ Error confirming booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Confirm renewal booking
app.post("/api/nic-booking/confirm-renewal/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeslot, documents } = req.body;

    if (!timeslot) {
      return res.status(400).json({ success: false, error: 'Time slot is required' });
    }

    const tempSnapshot = await db.ref(`temp_renewal_bookings/${userId}`).once('value');
    const tempData = tempSnapshot.val() || {};

    if (!tempData.step1 || !tempData.step3) {
      return res.status(400).json({
        success: false,
        error: 'Missing required information. Please complete all steps.'
      });
    }

    const bookingId = `NIC-R-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const bookingData = {
      userId,
      bookingId,
      serviceType: 'renewal',
      personalInfo: {
        fullName: tempData.step1.fullName,
        fullNameLocal: tempData.step1.fullNameLocal || '',
        dob: tempData.step1.dob,
        gender: tempData.step1.gender,
        mobile: tempData.step1.mobile,
      },
      renewalInfo: {
        oldNicNumber: tempData.step1.oldNicNumber,
        oldNicIssueDate: tempData.step1.oldNicIssueDate || '',
        reason: tempData.step1.reason,
        policeStation: tempData.step2?.policeStation || '',
        complaintNumber: tempData.step2?.complaintNumber || '',
        complaintDate: tempData.step2?.complaintDate || '',
      },
      verificationInfo: {
        address: tempData.step3.address,
        district: tempData.step3.district,
        dsDivision: tempData.step3.ds,
        gnDivision: tempData.step3.gn,
        birthCertificateNo: tempData.step3.birthNo,
        birthCertificateDate: tempData.step3.birthDate,
        remarks: tempData.step3.remarks || '',
      },
      documents: documents || [],
      appointmentInfo: {
        timeslot,
        status: 'confirmed',
        confirmedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.ref(`nic_bookings/${bookingId}`).set(bookingData);
    await db.ref(`temp_renewal_bookings/${userId}`).remove();

    const queueNumber = `NIC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    console.log('✅ Renewal confirmed:', bookingId);

    res.json({
      success: true,
      message: 'NIC Renewal Appointment confirmed successfully! 🎉',
      data: {
        bookingId,
        queueNumber,
        timeslot,
        confirmedAt: bookingData.appointmentInfo.confirmedAt
      }
    });
  } catch (error) {
    console.error('❌ Error confirming renewal booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// BOOKING RETRIEVAL
// ============================================

// Get user's bookings
app.get("/api/nic-booking/user-bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.ref('nic_bookings')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');
    
    const bookings = snapshot.val() || {};
    const bookingList = Object.entries(bookings).map(([id, data]) => ({
      id,
      ...data
    }));

    bookingList.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      data: bookingList
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel booking
app.put("/api/nic-booking/cancel/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    await db.ref(`nic_bookings/${bookingId}`).update({
      'appointmentInfo/status': 'cancelled',
      'appointmentInfo/cancelledAt': Date.now(),
      updatedAt: Date.now()
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// APPOINTMENTS (Legacy - Keep for compatibility)
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
    console.error('❌ Error creating appointment:', err);
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
    console.error('❌ Error fetching appointments:', err);
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
    console.error('❌ Error fetching queue:', err);
    res.status(500).json({ success: false, error: err.message });
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
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SmartQueue API Running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Firebase Realtime Database`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://192.168.1.65:${PORT}`);
});

module.exports = app;