const express = require("express");
const router = express.Router();
const {
  savePendingUser,
  finalizeUser,
  checkUserStatus,
  checkPendingEmail,
  checkUserNode,
} = require("../controllers/authController");

router.post("/save-pending-user", savePendingUser);
router.post("/finalize-user", finalizeUser);
router.post("/check-user-status", checkUserStatus);
router.post("/check-pending-email", checkPendingEmail);
router.post("/check-user-node", checkUserNode);
router.post("/check-pending-email", checkPendingEmail);
router.post("/finalize-user", finalizeUser);

module.exports = router;