const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
  savePendingUser,
  finalizeUser,
  checkUserStatus,
  checkPendingEmail,
  checkUserNode,
} = require("../controllers/authController");

// ==============================
// AUTH ROUTES
// ==============================

router.get("/", (req, res) => {
  res.json({ message: "Auth API is working 🚀" });
});

// Public routes
router.post("/save-pending-user", savePendingUser);
router.post("/check-user-status", checkUserStatus);
router.post("/check-pending-email", checkPendingEmail);

// Protected routes 🔐
router.post("/check-user-node", verifyToken, checkUserNode);
router.post("/finalize-user", verifyToken, finalizeUser);

module.exports = router;