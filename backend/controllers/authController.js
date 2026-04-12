const admin = require("../firebaseAdmin");

// ============================================
// SAVE PENDING USER
// ============================================

exports.savePendingUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const { uid } = await admin.auth().verifyIdToken(idToken);

    const { nic, name, dob, email, mobile } = req.body;

    if (!nic || !name || !dob || !email || !mobile) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const ref = admin.database().ref(`pendingUsers/${uid}`);

    // 🔥 Prevent overwrite if already exists
    const snapshot = await ref.once("value");
    if (snapshot.exists()) {
      return res.status(400).json({ message: "User already pending" });
    }

    await ref.set({
      uid,
      nic,
      name,
      dob,
      email: email.toLowerCase(),
      mobile,
      createdAt: Date.now(),
    });

    res.status(200).json({ message: "Pending user saved" });
  } catch (error) {
    console.error("savePendingUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// FINALIZE USER (MOVE FROM PENDING → USERS)
// ============================================

exports.finalizeUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const { uid } = await admin.auth().verifyIdToken(idToken);

    const userRecord = await admin.auth().getUser(uid);

    if (!userRecord.emailVerified) {
      return res.status(400).json({ message: "Email is not verified" });
    }

    const pendingRef = admin.database().ref(`pendingUsers/${uid}`);
    const userRef = admin.database().ref(`users/${uid}`);

    const snapshot = await pendingRef.once("value");

    if (!snapshot.exists()) {
      return res.status(400).json({ message: "No pending user found" });
    }

    const data = snapshot.val();

    // 🔥 Save to users
    await userRef.set({
      ...data,
      memberType: "Standard Member",
      theme: "light",
      notifications: true,
      finalizedAt: Date.now(),
    });

    // 🔥 Remove pending
    await pendingRef.remove();

    res.status(200).json({ message: "User finalized successfully" });
  } catch (error) {
    console.error("finalizeUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CHECK USER STATUS
// ============================================

exports.checkUserStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const { uid } = await admin.auth().verifyIdToken(idToken);

    const [userSnap, pendingSnap] = await Promise.all([
      admin.database().ref(`users/${uid}`).once("value"),
      admin.database().ref(`pendingUsers/${uid}`).once("value"),
    ]);

    if (userSnap.exists()) {
      return res.status(200).json({ status: "user" });
    }

    if (pendingSnap.exists()) {
      return res.status(200).json({ status: "pending" });
    }

    return res.status(200).json({ status: "not_found" });
  } catch (error) {
    console.error("checkUserStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CHECK PENDING EMAIL (OPTIMIZED)
// ============================================

exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const snapshot = await admin.database().ref("pendingUsers").once("value");

    if (!snapshot.exists()) {
      return res.status(200).json({ exists: false });
    }

    const users = snapshot.val();

    const exists = Object.values(users).some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    res.status(200).json({ exists });
  } catch (error) {
    console.error("checkPendingEmail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CHECK NODE LOCATION
// ============================================

exports.checkUserNode = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const { uid } = await admin.auth().verifyIdToken(idToken);

    const [userSnap, pendingSnap] = await Promise.all([
      admin.database().ref(`users/${uid}`).once("value"),
      admin.database().ref(`pendingUsers/${uid}`).once("value"),
    ]);

    res.status(200).json({
      inUsers: userSnap.exists(),
      inPendingUsers: pendingSnap.exists(),
    });
  } catch (error) {
    console.error("checkUserNode error:", error);
    res.status(500).json({ message: error.message });
  }
};