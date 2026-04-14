const admin = require("../firebaseAdmin");
const db = admin.database();

// ==============================
// SAVE PENDING USER
// ==============================
exports.savePendingUser = async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and userId are required" 
      });
    }

    // Check if already exists
    const existingSnapshot = await db.ref(`pendingUsers/${userId}`).once("value");
    if (existingSnapshot.exists()) {
      return res.json({ 
        success: true, 
        message: "User already in pending" 
      });
    }

    await db.ref(`pendingUsers/${userId}`).set({
      email: email.toLowerCase().trim(),
      userId: userId,
      createdAt: Date.now(),
    });

    return res.json({ 
      success: true, 
      message: "User saved to pending" 
    });
  } catch (err) {
    console.error("Error in savePendingUser:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// FINALIZE USER - FIXED
// ==============================
exports.finalizeUser = async (req, res) => {
  try {
    // Get user from Firebase Auth token (set by middleware)
    const uid = req.user?.uid;
    const email = req.user?.email;
    
    console.log("Finalizing user:", uid, email);
    
    if (!uid || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing user data" 
      });
    }

    // Get pending user data
    const pendingSnapshot = await db.ref(`pendingUsers/${uid}`).once("value");
    const pendingData = pendingSnapshot.val();
    
    if (!pendingData) {
      // Check if user already exists in users
      const userSnapshot = await db.ref(`users/${uid}`).once("value");
      if (userSnapshot.exists()) {
        return res.json({ 
          success: true, 
          message: "User already exists" 
        });
      }
      
      return res.status(404).json({ 
        success: false, 
        message: "User not found in pending" 
      });
    }

    // Move to users collection
    await db.ref(`users/${uid}`).set({
      userId: uid,
      email: email.toLowerCase().trim(),
      name: email.split('@')[0],
      memberType: "Standard Member",
      theme: "light",
      notifications: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Remove from pending
    await db.ref(`pendingUsers/${uid}`).remove();

    console.log("User finalized successfully:", uid);
    
    return res.json({ 
      success: true, 
      message: "User finalized successfully" 
    });
  } catch (err) {
    console.error("Error in finalizeUser:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK USER NODE - FIXED VERSION
// ==============================
exports.checkUserNode = async (req, res) => {
  try {
    const uid = req.user?.uid;
    
    console.log("Checking user node for UID:", uid);
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No user ID" 
      });
    }

    // Check if user exists in users collection
    const userSnapshot = await db.ref(`users/${uid}`).once("value");
    const inUsers = userSnapshot.exists();
    
    // Check if user exists in pendingUsers collection
    const pendingSnapshot = await db.ref(`pendingUsers/${uid}`).once("value");
    const inPendingUsers = pendingSnapshot.exists();

    console.log("User check result:", { inUsers, inPendingUsers });

    return res.json({
      success: true,
      inUsers: inUsers,
      inPendingUsers: inPendingUsers
    });
  } catch (err) {
    console.error("Error in checkUserNode:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK PENDING EMAIL
// ==============================
exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    console.log("Checking pending email:", email);

    const snapshot = await db
      .ref("pendingUsers")
      .orderByChild("email")
      .equalTo(email.toLowerCase().trim())
      .once("value");

    const exists = snapshot.exists();
    console.log("Pending email exists:", exists);

    return res.json({
      success: true,
      exists: exists,
    });
  } catch (err) {
    console.error("Error in checkPendingEmail:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK USER STATUS
// ==============================
exports.checkUserStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const snapshot = await db
      .ref("users")
      .orderByChild("email")
      .equalTo(email.toLowerCase().trim())
      .once("value");

    return res.json({
      success: true,
      exists: snapshot.exists(),
    });
  } catch (err) {
    console.error("Error in checkUserStatus:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// HEALTH CHECK
// ==============================
exports.healthCheck = (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
};