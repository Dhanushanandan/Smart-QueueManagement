const admin = require("firebase-admin");
const db = admin.database();

// ==============================
// SAVE PENDING USER
// ==============================
exports.savePendingUser = async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    await db.ref(`pendingUsers/${userId}`).set({
      email,
      createdAt: Date.now(),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ==============================
// FINALIZE USER
// ==============================
exports.finalizeUser = async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false });
    }

    await db.ref(`users/${uid}`).set({
      email,
      createdAt: Date.now(),
    });

    await db.ref(`pendingUsers/${uid}`).remove();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ==============================
// CHECK USER NODE
// ==============================
exports.checkUserNode = async (req, res) => {
  try {
    const snapshot = await db.ref("users").once("value");
    const data = snapshot.val() || {};

    return res.json({
      success: true,
      usersCount: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ==============================
// CHECK PENDING EMAIL
// ==============================
exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const snapshot = await db
      .ref("pendingUsers")
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    return res.json({
      success: true,
      exists: snapshot.exists(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ==============================
// CHECK USER STATUS
// ==============================
exports.checkUserStatus = async (req, res) => {
  try {
    const { email } = req.body;

    const snapshot = await db
      .ref("users")
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    return res.json({
      success: true,
      exists: snapshot.exists(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};