const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/save-pending-user", authController.savePendingUser);
router.post("/check-user-node", authController.checkUserNode);
router.post("/check-pending-email", authController.checkPendingEmail);
router.post("/finalize-user", authController.finalizeUser);
router.post("/upload-certificate", authController.uploadCertificate);
router.post("/save-certificate-details", authController.saveCertificateDetails);

module.exports = router;
