const express = require('express');
const router = express.Router();
const LicenseBookingController = require('../controllers/LicenseBookingController');

const licenseBookingController = new LicenseBookingController();

// Step-by-step save routes
router.post('/save-personal/:userId', (req, res) => 
  licenseBookingController.savePersonalInfo(req, res)
);

router.post('/save-identity/:userId', (req, res) => 
  licenseBookingController.saveIdentityInfo(req, res)
);

router.post('/save-medical/:userId', (req, res) => 
  licenseBookingController.saveMedicalInfo(req, res)
);

router.post('/save-license-details/:userId', (req, res) => 
  licenseBookingController.saveLicenseDetails(req, res)
);

// Document routes
router.post('/save-documents/:userId', (req, res) => 
  licenseBookingController.saveDocuments(req, res)
);

// Slot routes
router.get('/recommended-slot/:userId', (req, res) => 
  licenseBookingController.getRecommendedTimeSlot(req, res)
);

router.get('/available-slots', (req, res) => 
  licenseBookingController.getAvailableSlots(req, res)
);

// Temp data route
router.get('/temp-data/:userId', (req, res) => 
  licenseBookingController.getTempBookingData(req, res)
);

// Booking confirmation
router.post('/confirm/:userId', (req, res) => 
  licenseBookingController.confirmBooking(req, res)
);

// Appointment creation from dashboard
router.post('/appointments', (req, res) => 
  licenseBookingController.createAppointment(req, res)
);

// User bookings
router.get('/user-bookings/:userId', (req, res) => 
  licenseBookingController.getUserBookings(req, res)
);

// Single booking details
router.get('/booking/:bookingId', (req, res) => 
  licenseBookingController.getBookingDetails(req, res)
);

// Cancel booking
router.put('/cancel/:bookingId', (req, res) => 
  licenseBookingController.cancelBooking(req, res)
);

// Reschedule booking
router.put('/reschedule/:bookingId', (req, res) => 
  licenseBookingController.rescheduleBooking(req, res)
);

module.exports = router;