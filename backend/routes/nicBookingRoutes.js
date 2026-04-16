const express = require('express');
const router = express.Router();
const NICBookingController = require('../controllers/NICBookingController');

const nicBookingController = new NICBookingController();

// Registration routes
router.post('/save-personal/:userId', (req, res) => 
  nicBookingController.savePersonalInfo(req, res)
);

router.post('/save-verification/:userId', (req, res) => 
  nicBookingController.saveVerificationInfo(req, res)
);

// Renewal routes
router.post('/save-renewal-step1/:userId', (req, res) => 
  nicBookingController.saveRenewalStep1(req, res)
);

router.post('/save-renewal-step2/:userId', (req, res) => 
  nicBookingController.saveRenewalStep2(req, res)
);

router.post('/save-renewal-step3/:userId', (req, res) => 
  nicBookingController.saveRenewalStep3(req, res)
);

// Common routes
router.get('/recommended-slot/:userId', (req, res) => 
  nicBookingController.getRecommendedTimeSlot(req, res)
);

router.get('/temp-data/:userId', (req, res) => 
  nicBookingController.getTempBookingData(req, res)
);

router.get('/temp-renewal-data/:userId', (req, res) => 
  nicBookingController.getTempRenewalData(req, res)
);

router.post('/confirm/:userId', (req, res) => 
  nicBookingController.confirmBooking(req, res)
);

router.post('/confirm-renewal/:userId', (req, res) => 
  nicBookingController.confirmRenewalBooking(req, res)
);

router.get('/user-bookings/:userId', (req, res) => 
  nicBookingController.getUserBookings(req, res)
);

router.put('/cancel/:bookingId', (req, res) => 
  nicBookingController.cancelBooking(req, res)
);

module.exports = router;