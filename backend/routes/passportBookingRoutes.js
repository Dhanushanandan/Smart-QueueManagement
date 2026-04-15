const express = require('express');
const router = express.Router();
const PassportBookingController = require('../controllers/PassportBookingController');

const passportBookingController = new PassportBookingController();

// Step-by-step save routes
router.post('/save-personal/:userId', (req, res) => 
  passportBookingController.savePersonalInfo(req, res)
);

router.post('/save-identity/:userId', (req, res) => 
  passportBookingController.saveIdentityInfo(req, res)
);

router.post('/save-family/:userId', (req, res) => 
  passportBookingController.saveFamilyInfo(req, res)
);

router.post('/save-passport-details/:userId', (req, res) => 
  passportBookingController.savePassportDetails(req, res)
);

// Document routes
router.post('/save-documents/:userId', (req, res) => 
  passportBookingController.saveDocuments(req, res)
);

// Slot routes
router.get('/recommended-slot/:userId', (req, res) => 
  passportBookingController.getRecommendedTimeSlot(req, res)
);

router.get('/available-slots', (req, res) => 
  passportBookingController.getAvailableSlots(req, res)
);

// Temp data route
router.get('/temp-data/:userId', (req, res) => 
  passportBookingController.getTempBookingData(req, res)
);

// Booking confirmation
router.post('/confirm/:userId', (req, res) => 
  passportBookingController.confirmBooking(req, res)
);

// Appointment creation from dashboard
router.post('/appointments', (req, res) => 
  passportBookingController.createAppointment(req, res)
);

// User bookings
router.get('/user-bookings/:userId', (req, res) => 
  passportBookingController.getUserBookings(req, res)
);

// Single booking details
router.get('/booking/:bookingId', (req, res) => 
  passportBookingController.getBookingDetails(req, res)
);

// Cancel booking
router.put('/cancel/:bookingId', (req, res) => 
  passportBookingController.cancelBooking(req, res)
);

// Reschedule booking
router.put('/reschedule/:bookingId', (req, res) => 
  passportBookingController.rescheduleBooking(req, res)
);

module.exports = router;