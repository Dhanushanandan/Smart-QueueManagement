const express = require("express");
const router = express.Router();

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

router.post("/save-pending-user", savePendingUser);
router.post("/finalize-user", finalizeUser);
router.post("/check-user-status", checkUserStatus);
router.post("/check-pending-email", checkPendingEmail);
router.post("/check-user-node", checkUserNode);

module.exports = router;