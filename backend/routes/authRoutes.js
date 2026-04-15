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

const authController = require("../controllers/authController");

router.post("/save-pending-user", authController.savePendingUser);
router.post("/check-user-node", authController.checkUserNode);
router.post("/check-pending-email", authController.checkPendingEmail);
router.post("/finalize-user", authController.finalizeUser);
router.post("/upload-certificate", authController.uploadCertificate);
router.post("/save-certificate-details", authController.saveCertificateDetails);

module.exports = router;
