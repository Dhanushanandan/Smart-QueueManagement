<<<<<<< HEAD
const admin = require('firebase-admin');
const LicenseBookingModel = require('../models/LicenseBookingModel');
=======
const admin = require("firebase-admin");
const { recommendTimeSlot } = require("../aiRecommendationService");
const LicenseBookingModel = require("../models/LicenseBookingModel");
>>>>>>> origin/main

class LicenseBookingController {
  constructor() {
    this.db = admin.database();
    this.model = new LicenseBookingModel();
  }

<<<<<<< HEAD
=======
  parseTimeslot(timeslot = "") {
    const trimmed = (timeslot || "").trim();
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.*))?$/);
    if (!match) return { date: "", time: trimmed };
    return { date: match[1] || "", time: (match[2] || "").trim() };
  }

  async generateQueueNumber(timeslot) {
    const { date, time } = this.parseTimeslot(timeslot);
    const snapshot = await this.db.ref("license_bookings").once("value");
    const bookings = Object.values(snapshot.val() || {});

    const matchingBookings = bookings.filter((booking) => {
      const appointmentInfo = booking.appointmentInfo || {};
      return (
        appointmentInfo.timeslot === timeslot ||
        ((appointmentInfo.date || "") === date &&
          (appointmentInfo.time || "") === time)
      );
    });

    const tokenNumber = matchingBookings.length + 1;
    const queueNumber = "DL-" + String(tokenNumber).padStart(3, "0");
    return { tokenNumber, queueNumber, date, time };
  }

>>>>>>> origin/main
  // Save step 1 - Personal Information
  async savePersonalInfo(req, res) {
    try {
      const { userId } = req.params;
      const personalData = req.body;

<<<<<<< HEAD
      console.log('📝 [License] Saving personal info for user:', userId);

      const errors = this.model.validateStep1(personalData, personalData.licenseType || 'new');
      if (errors.length > 0) {
        console.log('❌ [License] Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log("📝 [License] Saving personal info for user:", userId);

      const errors = this.model.validateStep1(
        personalData,
        personalData.licenseType || "new",
      );
      if (errors.length > 0) {
        console.log("❌ [License] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step1`).set({
        ...personalData,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ [License] Personal info saved successfully');

      res.json({
        success: true,
        message: 'Personal information saved temporarily',
        data: personalData
      });
    } catch (error) {
      console.error('❌ [License] Error saving personal info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save personal information'
=======
        authUserId: personalData.authUserId || "",
        authEmail: personalData.authEmail || "",
        savedAt: Date.now(),
      });

      console.log("✅ [License] Personal info saved successfully");

      res.json({
        success: true,
        message: "Personal information saved temporarily",
        data: personalData,
      });
    } catch (error) {
      console.error("❌ [License] Error saving personal info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save personal information",
>>>>>>> origin/main
      });
    }
  }

  // Save step 2 - Identity Information
  async saveIdentityInfo(req, res) {
    try {
      const { userId } = req.params;
      const identityData = req.body;

<<<<<<< HEAD
      console.log('📝 [License] Saving identity info for user:', userId);

      const step1Snapshot = await this.db.ref(`temp_license_bookings/${userId}/step1`).once('value');
      if (!step1Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: 'Please complete personal information first'
=======
      console.log("📝 [License] Saving identity info for user:", userId);

      const step1Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step1`)
        .once("value");
      if (!step1Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete personal information first",
>>>>>>> origin/main
        });
      }

      const errors = this.model.validateStep2(identityData);
      if (errors.length > 0) {
<<<<<<< HEAD
        console.log('❌ [License] Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
        console.log("❌ [License] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step2`).set({
        ...identityData,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ [License] Identity info saved successfully');

      res.json({
        success: true,
        message: 'Identity information saved temporarily',
        data: identityData
      });
    } catch (error) {
      console.error('❌ [License] Error saving identity info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save identity information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ [License] Identity info saved successfully");

      res.json({
        success: true,
        message: "Identity information saved temporarily",
        data: identityData,
      });
    } catch (error) {
      console.error("❌ [License] Error saving identity info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save identity information",
>>>>>>> origin/main
      });
    }
  }

  // Save step 3 - Medical & Address Information
  async saveMedicalInfo(req, res) {
    try {
      const { userId } = req.params;
      const medicalData = req.body;

<<<<<<< HEAD
      console.log('📝 [License] Saving medical & address info for user:', userId);

      const step2Snapshot = await this.db.ref(`temp_license_bookings/${userId}/step2`).once('value');
      if (!step2Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: 'Please complete identity information first'
        });
      }

      const step1Snapshot = await this.db.ref(`temp_license_bookings/${userId}/step1`).once('value');
      const step1Data = step1Snapshot.val() || {};
      const serviceType = step1Data.licenseType || 'new';

      const errors = this.model.validateStep3(medicalData, serviceType);
      if (errors.length > 0) {
        console.log('❌ [License] Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log(
        "📝 [License] Saving medical & address info for user:",
        userId,
      );

      const step2Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step2`)
        .once("value");
      if (!step2Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete identity information first",
        });
      }

      const step1Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step1`)
        .once("value");
      const step1Data = step1Snapshot.val() || {};
      const serviceType = step1Data.licenseType || "new";

      const errors = this.model.validateStep3(medicalData, serviceType);
      if (errors.length > 0) {
        console.log("❌ [License] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step3`).set({
        ...medicalData,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ [License] Medical & address info saved successfully');

      res.json({
        success: true,
        message: 'Medical and address information saved temporarily',
        data: medicalData
      });
    } catch (error) {
      console.error('❌ [License] Error saving medical info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save medical information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ [License] Medical & address info saved successfully");

      res.json({
        success: true,
        message: "Medical and address information saved temporarily",
        data: medicalData,
      });
    } catch (error) {
      console.error("❌ [License] Error saving medical info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save medical information",
>>>>>>> origin/main
      });
    }
  }

  // Save step 4 - License & Emergency Details
  async saveLicenseDetails(req, res) {
    try {
      const { userId } = req.params;
      const licenseData = req.body;

<<<<<<< HEAD
      console.log('📝 [License] Saving license details for user:', userId);

      const step3Snapshot = await this.db.ref(`temp_license_bookings/${userId}/step3`).once('value');
      if (!step3Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: 'Please complete medical information first'
        });
      }

      const step1Snapshot = await this.db.ref(`temp_license_bookings/${userId}/step1`).once('value');
      const step1Data = step1Snapshot.val() || {};
      const serviceType = step1Data.licenseType || 'new';

      const errors = this.model.validateStep4(licenseData, serviceType);
      if (errors.length > 0) {
        console.log('❌ [License] Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log("📝 [License] Saving license details for user:", userId);

      const step3Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step3`)
        .once("value");
      if (!step3Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete medical information first",
        });
      }

      const step1Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step1`)
        .once("value");
      const step1Data = step1Snapshot.val() || {};
      const serviceType = step1Data.licenseType || "new";

      const errors = this.model.validateStep4(licenseData, serviceType);
      if (errors.length > 0) {
        console.log("❌ [License] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step4`).set({
        ...licenseData,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ [License] License details saved successfully');

      res.json({
        success: true,
        message: 'License details saved temporarily',
        data: licenseData
      });
    } catch (error) {
      console.error('❌ [License] Error saving license details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save license details'
=======
        savedAt: Date.now(),
      });

      console.log("✅ [License] License details saved successfully");

      res.json({
        success: true,
        message: "License details saved temporarily",
        data: licenseData,
      });
    } catch (error) {
      console.error("❌ [License] Error saving license details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save license details",
>>>>>>> origin/main
      });
    }
  }

  // Get AI recommended time slot
  async getRecommendedTimeSlot(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      const snapshot = await this.db.ref('license_bookings')
        .orderByChild('appointmentInfo/timeslot')
        .once('value');
      
      const bookings = snapshot.val() || {};
      const bookedSlots = new Set();
      
      Object.values(bookings).forEach(booking => {
        if (booking.appointmentInfo?.timeslot && 
            (booking.appointmentInfo.status === 'confirmed' || booking.appointmentInfo.status === 'upcoming')) {
          bookedSlots.add(booking.appointmentInfo.timeslot);
        }
      });

      const allSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
        '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM'
      ];

      // AI Logic: Prefer morning slots (less crowded), avoid booked slots
      let recommendedSlot = null;
      
      // First try morning slots (9 AM - 11 AM)
      const morningSlots = allSlots.filter(slot => 
        slot.includes('09:') || slot.includes('10:')
      );
      
      for (const slot of morningSlots) {
        const fullSlot = `${dateString} ${slot}`;
        if (!bookedSlots.has(fullSlot)) {
          recommendedSlot = {
            date: dateString,
            time: slot,
            fullSlot: fullSlot,
            crowdLevel: 'Less crowded'
          };
          break;
        }
      }
      
      // If no morning slots, try afternoon slots
      if (!recommendedSlot) {
        for (const slot of allSlots) {
          const fullSlot = `${dateString} ${slot}`;
          if (!bookedSlots.has(fullSlot)) {
            let crowdLevel = 'Moderate';
            if (slot.includes('01:') || slot.includes('02:')) crowdLevel = 'Moderate';
            else if (slot.includes('03:')) crowdLevel = 'Busy';
            
            recommendedSlot = {
              date: dateString,
              time: slot,
              fullSlot: fullSlot,
              crowdLevel: crowdLevel
            };
            break;
          }
        }
      }

      if (recommendedSlot) {
        await this.db.ref(`temp_license_bookings/${userId}/recommendedSlot`).set(recommendedSlot);
=======
      const snapshot = await this.db.ref("license_bookings").once("value");
      const bookings = Object.values(snapshot.val() || {});

      const aiResult = await recommendTimeSlot({
        serviceType: "license",
        bookings,
      });

      if (aiResult.recommended) {
        await this.db
          .ref(`temp_license_bookings/${userId}/recommendedSlot`)
          .set(aiResult.recommended);
>>>>>>> origin/main
      }

      res.json({
        success: true,
<<<<<<< HEAD
        data: recommendedSlot || { message: 'No slots available for tomorrow' }
      });
    } catch (error) {
      console.error('❌ [License] Error getting time slot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommended time slot'
=======
        data: aiResult.recommended || {
          message: "No slots available for tomorrow",
        },
        allSlots: aiResult.allSlots || [],
      });
    } catch (error) {
      console.error("❌ [LICENSE] Error getting time slot:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get recommended time slot",
>>>>>>> origin/main
      });
    }
  }

  // Get available slots
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.query;
<<<<<<< HEAD
      const targetDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const snapshot = await this.db.ref('license_bookings')
        .orderByChild('appointmentInfo/timeslot')
        .once('value');
      
      const bookings = snapshot.val() || {};
      const bookedSlots = new Set();
      
      Object.values(bookings).forEach(booking => {
        if (booking.appointmentInfo?.timeslot && 
            (booking.appointmentInfo.status === 'confirmed' || booking.appointmentInfo.status === 'upcoming')) {
=======
      const targetDate =
        date || new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const snapshot = await this.db
        .ref("license_bookings")
        .orderByChild("appointmentInfo/timeslot")
        .once("value");

      const bookings = snapshot.val() || {};
      const bookedSlots = new Set();

      Object.values(bookings).forEach((booking) => {
        if (
          booking.appointmentInfo?.timeslot &&
          (booking.appointmentInfo.status === "confirmed" ||
            booking.appointmentInfo.status === "upcoming")
        ) {
>>>>>>> origin/main
          bookedSlots.add(booking.appointmentInfo.timeslot);
        }
      });

      const allSlots = [
<<<<<<< HEAD
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
        '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM'
      ];

      const availableSlots = [];
      
      allSlots.forEach(slot => {
        const fullSlot = `${targetDate} ${slot}`;
        
        let crowdLevel = 'Less crowded';
        if (slot.includes('09') || slot.includes('10')) {
          crowdLevel = 'Less crowded';
        } else if (slot.includes('11') || slot.includes('01') || slot.includes('02')) {
          crowdLevel = 'Moderate';
        } else {
          crowdLevel = 'Busy';
        }
        
=======
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
      ];

      const availableSlots = [];

      allSlots.forEach((slot) => {
        const fullSlot = `${targetDate} ${slot}`;

        let crowdLevel = "Less crowded";
        if (slot.includes("09") || slot.includes("10")) {
          crowdLevel = "Less crowded";
        } else if (
          slot.includes("11") ||
          slot.includes("01") ||
          slot.includes("02")
        ) {
          crowdLevel = "Moderate";
        } else {
          crowdLevel = "Busy";
        }

>>>>>>> origin/main
        if (!bookedSlots.has(fullSlot)) {
          availableSlots.push({
            date: targetDate,
            time: slot,
            fullSlot,
<<<<<<< HEAD
            crowdLevel
=======
            crowdLevel,
>>>>>>> origin/main
          });
        }
      });

<<<<<<< HEAD
      console.log(`📅 [License] Available slots for ${targetDate}: ${availableSlots.length}`);

      res.json({
        success: true,
        data: availableSlots
      });
    } catch (error) {
      console.error('❌ [License] Error getting available slots:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available slots'
=======
      console.log(
        `📅 [License] Available slots for ${targetDate}: ${availableSlots.length}`,
      );

      res.json({
        success: true,
        data: availableSlots,
      });
    } catch (error) {
      console.error("❌ [License] Error getting available slots:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get available slots",
>>>>>>> origin/main
      });
    }
  }

  // Get temp license booking data
  async getTempBookingData(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref(`temp_license_bookings/${userId}`).once('value');
      const data = snapshot.val() || {};
      
=======

      const snapshot = await this.db
        .ref(`temp_license_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

>>>>>>> origin/main
      res.json({
        success: true,
        data: {
          ...data.step1,
          ...data.step2,
          ...data.step3,
          ...data.step4,
          recommendedSlot: data.recommendedSlot || null,
<<<<<<< HEAD
          documents: data.documents || []
        }
      });
    } catch (error) {
      console.error('❌ [License] Error fetching temp data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking data'
=======
          documents: data.documents || [],
        },
      });
    } catch (error) {
      console.error("❌ [License] Error fetching temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
>>>>>>> origin/main
      });
    }
  }

  // Save documents
  async saveDocuments(req, res) {
    try {
      const { userId } = req.params;
      const { documents } = req.body;

<<<<<<< HEAD
      console.log('📄 [License] Saving documents for user:', userId);

      await this.db.ref(`temp_license_bookings/${userId}/documents`).set(documents);

      res.json({
        success: true,
        message: 'Documents saved successfully',
        data: documents
      });
    } catch (error) {
      console.error('❌ [License] Error saving documents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save documents'
=======
      console.log("📄 [License] Saving documents for user:", userId);

      await this.db
        .ref(`temp_license_bookings/${userId}/documents`)
        .set(documents);

      res.json({
        success: true,
        message: "Documents saved successfully",
        data: documents,
      });
    } catch (error) {
      console.error("❌ [License] Error saving documents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save documents",
>>>>>>> origin/main
      });
    }
  }

  // Confirm and save complete booking
  async confirmBooking(req, res) {
    try {
      const { userId } = req.params;
      const { timeslot, documents, serviceType } = req.body;

      if (!timeslot) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'Time slot is required'
        });
      }

      const tempSnapshot = await this.db.ref(`temp_license_bookings/${userId}`).once('value');
      const tempData = tempSnapshot.val() || {};

      if (!tempData.step1 || !tempData.step2 || !tempData.step3 || !tempData.step4) {
        return res.status(400).json({
          success: false,
          error: 'Missing required information. Please complete all steps.'
=======
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_license_bookings/${userId}`)
        .once("value");
      const tempData = tempSnapshot.val() || {};

      if (
        !tempData.step1 ||
        !tempData.step2 ||
        !tempData.step3 ||
        !tempData.step4
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required information. Please complete all steps.",
>>>>>>> origin/main
        });
      }

      const completeData = {
        ...tempData.step1,
        ...tempData.step2,
        ...tempData.step3,
        ...tempData.step4,
        timeslot,
<<<<<<< HEAD
        documents: documents || tempData.documents || []
      };

      const bookingData = this.model.formatBookingData(userId, completeData, serviceType || tempData.step1.licenseType || 'new');

      const bookingRef = this.db.ref('license_bookings').push();
=======
        documents: documents || tempData.documents || [],
      };

      const actualUserId = tempData.step1?.authUserId || userId;
      // const actualUserId = tempData.step1?.authUserId || userId;
      const bookingData = this.model.formatBookingData(
        actualUserId,
        completeData,
        serviceType || tempData.step1.licenseType || "new",
      );

      const { tokenNumber, queueNumber, date, time } =
        await this.generateQueueNumber(timeslot);
      bookingData.appointmentInfo = {
        ...bookingData.appointmentInfo,
        date: bookingData.appointmentInfo.date || date,
        time: bookingData.appointmentInfo.time || time,
        queueNumber,
        tokenNumber,
      };

      const bookingRef = this.db.ref("license_bookings").push();
>>>>>>> origin/main
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_license_bookings/${userId}`).remove();

<<<<<<< HEAD
      const queueNumber = `DL-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      console.log('✅ [License] Booking confirmed:', bookingData.bookingId);

      res.json({
        success: true,
        message: 'Driving License Appointment confirmed successfully! 🎉',
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt
        }
      });
    } catch (error) {
      console.error('❌ [License] Error confirming booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm booking'
=======
      console.log("✅ [License] Booking confirmed:", bookingData.bookingId);

      res.json({
        success: true,
        message: "Driving License Appointment confirmed successfully! 🎉",
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt,
        },
      });
    } catch (error) {
      console.error("❌ [License] Error confirming booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to confirm booking",
>>>>>>> origin/main
      });
    }
  }

  // Create license appointment from dashboard
  async createAppointment(req, res) {
    try {
      const appointmentData = req.body;

<<<<<<< HEAD
      console.log('📝 [License] Creating appointment from dashboard');

      const bookingId = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const bookingData = {
        userId: appointmentData.userId,
        bookingId,
        serviceType: appointmentData.service || 'license',
        personalInfo: {
          fullName: appointmentData.fullName || '',
          mobile: appointmentData.phone || '',
          email: appointmentData.email || '',
        },
        addressInfo: {
          address: appointmentData.address || '',
        },
        licenseDetails: {
          licenseType: appointmentData.licenseType || 'new',
        },
        appointmentInfo: {
          date: appointmentData.date || '',
          time: appointmentData.time || '',
          timeslot: `${appointmentData.date} ${appointmentData.time}`,
          status: 'upcoming',
          confirmedAt: Date.now(),
=======
      console.log("📝 [License] Creating appointment from dashboard");

      const bookingId = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const timeslot =
        `${appointmentData.date || ""} ${appointmentData.time || ""}`.trim();
      const { tokenNumber, queueNumber } =
        await this.generateQueueNumber(timeslot);

      const bookingData = {
        userId: appointmentData.userId,
        bookingId,
        serviceType: appointmentData.service || "license",
        personalInfo: {
          fullName: appointmentData.fullName || "",
          mobile: appointmentData.phone || "",
          email: appointmentData.email || "",
        },
        addressInfo: {
          address: appointmentData.address || "",
        },
        licenseDetails: {
          licenseType: appointmentData.licenseType || "new",
        },
        appointmentInfo: {
          date: appointmentData.date || "",
          time: appointmentData.time || "",
          timeslot,
          status: "upcoming",
          confirmedAt: Date.now(),
          queueNumber,
          tokenNumber,
>>>>>>> origin/main
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

<<<<<<< HEAD
      const bookingRef = this.db.ref('license_bookings').push();
      await bookingRef.set(bookingData);

      const queueNumber = `DL-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      console.log('✅ [License] Appointment created:', bookingId);

      res.json({
        success: true,
        message: 'Driving license appointment booked successfully!',
        data: {
          bookingId,
          queueNumber,
          timeslot: bookingData.appointmentInfo.timeslot
        }
      });
    } catch (error) {
      console.error('❌ [License] Error creating appointment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create appointment'
=======
      const bookingRef = this.db.ref("license_bookings").push();
      await bookingRef.set(bookingData);

      console.log("✅ [License] Appointment created:", bookingId);

      res.json({
        success: true,
        message: "Driving license appointment booked successfully!",
        data: {
          bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
        },
      });
    } catch (error) {
      console.error("❌ [License] Error creating appointment:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create appointment",
>>>>>>> origin/main
      });
    }
  }

  // Get user's license bookings
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref('license_bookings')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const bookings = snapshot.val() || {};
      const bookingList = Object.entries(bookings).map(([id, data]) => ({
        id,
        ...data
=======

      const snapshot = await this.db
        .ref("license_bookings")
        .orderByChild("userId")
        .equalTo(userId)
        .once("value");

      const bookings = snapshot.val() || {};
      const bookingList = Object.entries(bookings).map(([id, data]) => ({
        id,
        ...data,
>>>>>>> origin/main
      }));

      bookingList.sort((a, b) => b.createdAt - a.createdAt);

      res.json({
        success: true,
<<<<<<< HEAD
        data: bookingList
      });
    } catch (error) {
      console.error('❌ [License] Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
=======
        data: bookingList,
      });
    } catch (error) {
      console.error("❌ [License] Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bookings",
>>>>>>> origin/main
      });
    }
  }

  // Get single booking details
  async getBookingDetails(req, res) {
    try {
      const { bookingId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref(`license_bookings/${bookingId}`).once('value');
      const booking = snapshot.val();
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
=======

      const snapshot = await this.db
        .ref(`license_bookings/${bookingId}`)
        .once("value");
      const booking = snapshot.val();

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
>>>>>>> origin/main
        });
      }

      res.json({
        success: true,
        data: {
          id: bookingId,
<<<<<<< HEAD
          ...booking
        }
      });
    } catch (error) {
      console.error('❌ [License] Error fetching booking details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking details'
=======
          ...booking,
        },
      });
    } catch (error) {
      console.error("❌ [License] Error fetching booking details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking details",
>>>>>>> origin/main
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
<<<<<<< HEAD
      
      await this.db.ref(`license_bookings/${bookingId}`).update({
        'appointmentInfo/status': 'cancelled',
        'appointmentInfo/cancelledAt': Date.now(),
        updatedAt: Date.now()
=======

      await this.db.ref(`license_bookings/${bookingId}`).update({
        "appointmentInfo/status": "cancelled",
        "appointmentInfo/cancelledAt": Date.now(),
        updatedAt: Date.now(),
>>>>>>> origin/main
      });

      res.json({
        success: true,
<<<<<<< HEAD
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('❌ [License] Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking'
=======
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("❌ [License] Error cancelling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel booking",
>>>>>>> origin/main
      });
    }
  }

  // Reschedule booking
  async rescheduleBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { timeslot } = req.body;

      if (!timeslot) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'New time slot is required'
=======
          error: "New time slot is required",
>>>>>>> origin/main
        });
      }

      await this.db.ref(`license_bookings/${bookingId}`).update({
<<<<<<< HEAD
        'appointmentInfo/timeslot': timeslot,
        'appointmentInfo/rescheduledAt': Date.now(),
        updatedAt: Date.now()
=======
        "appointmentInfo/timeslot": timeslot,
        "appointmentInfo/rescheduledAt": Date.now(),
        updatedAt: Date.now(),
>>>>>>> origin/main
      });

      res.json({
        success: true,
<<<<<<< HEAD
        message: 'Booking rescheduled successfully',
        data: { timeslot }
      });
    } catch (error) {
      console.error('❌ [License] Error rescheduling booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reschedule booking'
=======
        message: "Booking rescheduled successfully",
        data: { timeslot },
      });
    } catch (error) {
      console.error("❌ [License] Error rescheduling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reschedule booking",
>>>>>>> origin/main
      });
    }
  }
}

<<<<<<< HEAD
module.exports = LicenseBookingController;
=======
module.exports = LicenseBookingController;
>>>>>>> origin/main
