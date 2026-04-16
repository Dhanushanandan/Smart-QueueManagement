import { Router } from 'express';
import {
    checkPendingEmail,
    checkUserNode,
    finalizeUser, saveCertificateDetails,
    savePendingUser,
    uploadCertificate
} from './auth.controller';

const router = Router();

router.post('/save-pending-user', savePendingUser);
router.post('/upload-certificate', uploadCertificate);
router.post('/check-pending-email', checkPendingEmail);
router.post('/check-user-node', checkUserNode);
router.post('/finalize-user', finalizeUser);
router.post('/save-certificate-details', saveCertificateDetails);


export default router;