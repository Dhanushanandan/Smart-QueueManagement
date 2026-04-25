<<<<<<< HEAD
const admin = require('firebase-admin');
const NICBookingModel = require('../models/NICBookingModel');
=======
const admin = require("firebase-admin");
const { recommendTimeSlot } = require("../aiRecommendationService");
const NICBookingModel = require("../models/NICBookingModel");
>>>>>>> origin/main

class NICBookingController {
  constructor() {
    this.db = admin.database();
    this.model = new NICBookingModel();
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
    const snapshot = await this.db.ref("nic_bookings").once("value");
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
    const queueNumber = "NIC-" + String(tokenNumber).padStart(3, "0");
    return { tokenNumber, queueNumber, date, time };
  }

>>>>>>> origin/main
  // Save step 1 - Personal Information
  async savePersonalInfo(req, res) {
    try {
      const { userId } = req.params;
      const personalData = req.body;

<<<<<<< HEAD
      console.log('📝 Saving personal info for user:', userId);
      console.log('Data received:', personalData);
=======
      console.log("📝 Saving personal info for user:", userId);
      console.log("Data received:", personalData);
>>>>>>> origin/main

      // Validate data
      const errors = this.model.validatePersonalInfo(personalData);
      if (errors.length > 0) {
<<<<<<< HEAD
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
        });
      }

      // Save to temporary storage
      await this.db.ref(`temp_bookings/${userId}/personalInfo`).set({
        ...personalData,
        savedAt: Date.now()
      });

      console.log('✅ Personal info saved successfully');

      res.json({
        success: true,
        message: 'Personal information saved temporarily',
        data: personalData
      });
    } catch (error) {
      console.error('❌ Error saving personal info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save personal information'
=======
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_bookings/${userId}/personalInfo`).set({
        ...personalData,
        authUserId: personalData.authUserId || "",
        authEmail: personalData.authEmail || "",
        savedAt: Date.now(),
      });

      console.log("✅ Personal info saved successfully");

      res.json({
        success: true,
        message: "Personal information saved temporarily",
        data: personalData,
      });
    } catch (error) {
      console.error("❌ Error saving personal info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save personal information",
>>>>>>> origin/main
      });
    }
  }

  // Save step 2 - Verification Information
  async saveVerificationInfo(req, res) {
    try {
      const { userId } = req.params;
      const verificationData = req.body;

<<<<<<< HEAD
      console.log('📝 Saving verification info for user:', userId);
=======
      console.log("📝 Saving verification info for user:", userId);
>>>>>>> origin/main

      // Validate data
      const errors = this.model.validateVerificationInfo(verificationData);
      if (errors.length > 0) {
<<<<<<< HEAD
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      // Check if personal info exists
<<<<<<< HEAD
      const personalSnapshot = await this.db.ref(`temp_bookings/${userId}/personalInfo`).once('value');
      if (!personalSnapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: 'Please complete personal information first'
=======
      const personalSnapshot = await this.db
        .ref(`temp_bookings/${userId}/personalInfo`)
        .once("value");
      if (!personalSnapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete personal information first",
>>>>>>> origin/main
        });
      }

      // Save verification info
      await this.db.ref(`temp_bookings/${userId}/verificationInfo`).set({
        ...verificationData,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ Verification info saved successfully');

      res.json({
        success: true,
        message: 'Verification information saved temporarily',
        data: verificationData
      });
    } catch (error) {
      console.error('❌ Error saving verification info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save verification information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ Verification info saved successfully");

      res.json({
        success: true,
        message: "Verification information saved temporarily",
        data: verificationData,
      });
    } catch (error) {
      console.error("❌ Error saving verification info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save verification information",
>>>>>>> origin/main
      });
    }
  }

  // Save Renewal Step 1
  async saveRenewalStep1(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

<<<<<<< HEAD
      console.log('📝 Saving renewal step 1 for user:', userId);

      const errors = this.model.validateRenewalStep1(data);
      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log("📝 Saving renewal step 1 for user:", userId);

      const errors = this.model.validateRenewalStep1(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step1`).set({
        ...data,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ Renewal step 1 saved successfully');

      res.json({
        success: true,
        message: 'Personal and old NIC information saved',
        data: data
      });
    } catch (error) {
      console.error('❌ Error saving renewal step 1:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ Renewal step 1 saved successfully");

      res.json({
        success: true,
        message: "Personal and old NIC information saved",
        data: data,
      });
    } catch (error) {
      console.error("❌ Error saving renewal step 1:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save information",
>>>>>>> origin/main
      });
    }
  }

  // Save Renewal Step 2 (Police Report)
  async saveRenewalStep2(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

<<<<<<< HEAD
      console.log('📝 Saving renewal step 2 for user:', userId);

      const errors = this.model.validateRenewalStep2(data);
      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log("📝 Saving renewal step 2 for user:", userId);

      const errors = this.model.validateRenewalStep2(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step2`).set({
        ...data,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ Renewal step 2 saved successfully');

      res.json({
        success: true,
        message: 'Police report information saved',
        data: data
      });
    } catch (error) {
      console.error('❌ Error saving renewal step 2:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ Renewal step 2 saved successfully");

      res.json({
        success: true,
        message: "Police report information saved",
        data: data,
      });
    } catch (error) {
      console.error("❌ Error saving renewal step 2:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save information",
>>>>>>> origin/main
      });
    }
  }

  // Save Renewal Step 3 (Address & Documents)
  async saveRenewalStep3(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

<<<<<<< HEAD
      console.log('📝 Saving renewal step 3 for user:', userId);

      const errors = this.model.validateRenewalStep3(data);
      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({
          success: false,
          errors
=======
      console.log("📝 Saving renewal step 3 for user:", userId);

      const errors = this.model.validateRenewalStep3(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
>>>>>>> origin/main
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step3`).set({
        ...data,
<<<<<<< HEAD
        savedAt: Date.now()
      });

      console.log('✅ Renewal step 3 saved successfully');

      res.json({
        success: true,
        message: 'Address and document information saved',
        data: data
      });
    } catch (error) {
      console.error('❌ Error saving renewal step 3:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save information'
=======
        savedAt: Date.now(),
      });

      console.log("✅ Renewal step 3 saved successfully");

      res.json({
        success: true,
        message: "Address and document information saved",
        data: data,
      });
    } catch (error) {
      console.error("❌ Error saving renewal step 3:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save information",
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
      
      const snapshot = await this.db.ref('nic_bookings')
        .orderByChild('appointmentInfo/timeslot')
        .once('value');
      
      const bookings = snapshot.val() || {};
      const bookedSlots = new Set();
      
      Object.values(bookings).forEach(booking => {
        if (booking.appointmentInfo?.timeslot) {
          bookedSlots.add(booking.appointmentInfo.timeslot);
        }
      });

      const allSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
        '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM'
      ];

      const slotPopularity = {};
      allSlots.forEach(slot => {
        const hour = parseInt(slot.split(':')[0]);
        const isPM = slot.includes('PM');
        const actualHour = isPM && hour !== 12 ? hour + 12 : hour;
        
        if (actualHour >= 9 && actualHour <= 11) {
          slotPopularity[slot] = 1;
        } else if (actualHour >= 13 && actualHour <= 15) {
          slotPopularity[slot] = 2;
        } else {
          slotPopularity[slot] = 3;
        }
      });

      let recommendedSlot = null;
      for (const slot of allSlots) {
        if (!bookedSlots.has(`${dateString} ${slot}`)) {
          recommendedSlot = {
            date: dateString,
            time: slot,
            fullSlot: `${dateString} ${slot}`,
            crowdLevel: slotPopularity[slot] === 1 ? 'Less crowded' : 
                        slotPopularity[slot] === 2 ? 'Moderate' : 'Busy'
          };
          break;
        }
      }

      if (recommendedSlot) {
        await this.db.ref(`temp_bookings/${userId}/recommendedSlot`).set(recommendedSlot);
=======
      const snapshot = await this.db.ref("nic_bookings").once("value");
      const bookings = Object.values(snapshot.val() || {});

      const aiResult = await recommendTimeSlot({
        serviceType: "nic",
        bookings,
      });

      if (aiResult.recommended) {
        await this.db
          .ref(`temp_bookings/${userId}/recommendedSlot`)
          .set(aiResult.recommended);
>>>>>>> origin/main
      }

      res.json({
        success: true,
<<<<<<< HEAD
        data: recommendedSlot || { message: 'No slots available for tomorrow' }
      });
    } catch (error) {
      console.error('❌ Error getting time slot:', error);
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
      console.error("❌ Error getting time slot:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get recommended time slot",
      });
    }
  }

  // Get available slots with AI estimated waiting time
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.query;
      const snapshot = await this.db.ref("nic_bookings").once("value");
      const bookings = Object.values(snapshot.val() || {});

      const aiResult = await recommendTimeSlot({
        serviceType: "nic",
        bookings,
        date,
      });

      res.json({
        success: true,
        data: aiResult.allSlots || [],
      });
    } catch (error) {
      console.error("❌ Error getting available slots:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get available slots",
>>>>>>> origin/main
      });
    }
  }

  // Get all temp booking data for review
  async getTempBookingData(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref(`temp_bookings/${userId}`).once('value');
      const data = snapshot.val() || {};
      
=======

      const snapshot = await this.db
        .ref(`temp_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

>>>>>>> origin/main
      res.json({
        success: true,
        data: {
          personalInfo: data.personalInfo || {},
          verificationInfo: data.verificationInfo || {},
<<<<<<< HEAD
          recommendedSlot: data.recommendedSlot || null
        }
      });
    } catch (error) {
      console.error('❌ Error fetching temp data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking data'
=======
          recommendedSlot: data.recommendedSlot || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
>>>>>>> origin/main
      });
    }
  }

  // Get temp renewal data
  async getTempRenewalData(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref(`temp_renewal_bookings/${userId}`).once('value');
      const data = snapshot.val() || {};
      
=======

      const snapshot = await this.db
        .ref(`temp_renewal_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

>>>>>>> origin/main
      res.json({
        success: true,
        data: {
          ...data.step1,
          ...data.step2,
          ...data.step3,
<<<<<<< HEAD
          recommendedSlot: data.recommendedSlot || null
        }
      });
    } catch (error) {
      console.error('❌ Error fetching renewal temp data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking data'
=======
          recommendedSlot: data.recommendedSlot || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching renewal temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
>>>>>>> origin/main
      });
    }
  }

  // Confirm and save complete booking (Registration)
  async confirmBooking(req, res) {
    try {
      const { userId } = req.params;
      const { timeslot } = req.body;

      if (!timeslot) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'Time slot is required'
        });
      }

      const tempSnapshot = await this.db.ref(`temp_bookings/${userId}`).once('value');
=======
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_bookings/${userId}`)
        .once("value");
>>>>>>> origin/main
      const tempData = tempSnapshot.val() || {};

      if (!tempData.personalInfo || !tempData.verificationInfo) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'Missing required information. Please complete all steps.'
        });
      }

      const completeData = {
        ...tempData.personalInfo,
        ...tempData.verificationInfo,
        timeslot
      };

      const bookingData = this.model.formatBookingData(userId, completeData, 'registration');

      const bookingRef = this.db.ref('nic_bookings').push();
=======
          error: "Missing required information. Please complete all steps.",
        });
      }

      const actualUserId = tempData.personalInfo?.authUserId || userId;

      const completeData = {
        ...tempData.personalInfo,
        ...tempData.verificationInfo,
        timeslot,
      };

      // const actualUserId = tempData.personalInfo?.authUserId || userId;
      const bookingData = this.model.formatBookingData(
        actualUserId,
        completeData,
        "registration",
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

      const bookingRef = this.db.ref("nic_bookings").push();
>>>>>>> origin/main
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_bookings/${userId}`).remove();

<<<<<<< HEAD
      const queueNumber = `NIC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      console.log('✅ Booking confirmed:', bookingData.bookingId);

      res.json({
        success: true,
        message: 'NIC Appointment confirmed successfully! 🎉',
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt
        }
      });
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm booking'
=======
      console.log("✅ Booking confirmed:", bookingData.bookingId);

      res.json({
        success: true,
        message: "NIC Appointment confirmed successfully! 🎉",
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt,
        },
      });
    } catch (error) {
      console.error("❌ Error confirming booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to confirm booking",
>>>>>>> origin/main
      });
    }
  }

  // Confirm renewal booking
  async confirmRenewalBooking(req, res) {
    try {
      const { userId } = req.params;
      const { timeslot } = req.body;

      if (!timeslot) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'Time slot is required'
        });
      }

      const tempSnapshot = await this.db.ref(`temp_renewal_bookings/${userId}`).once('value');
=======
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_renewal_bookings/${userId}`)
        .once("value");
>>>>>>> origin/main
      const tempData = tempSnapshot.val() || {};

      if (!tempData.step1 || !tempData.step3) {
        return res.status(400).json({
          success: false,
<<<<<<< HEAD
          error: 'Missing required information. Please complete all steps.'
=======
          error: "Missing required information. Please complete all steps.",
>>>>>>> origin/main
        });
      }

      const completeData = {
        ...tempData.step1,
        ...tempData.step2,
        ...tempData.step3,
<<<<<<< HEAD
        timeslot
      };

      const bookingData = this.model.formatBookingData(userId, completeData, 'renewal');

      const bookingRef = this.db.ref('nic_bookings').push();
=======
        timeslot,
      };

      const actualUserId = tempData.step1?.authUserId || userId;
      const bookingData = this.model.formatBookingData(
        actualUserId,
        completeData,
        "renewal",
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

      const bookingRef = this.db.ref("nic_bookings").push();
>>>>>>> origin/main
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_renewal_bookings/${userId}`).remove();

<<<<<<< HEAD
      const queueNumber = `NIC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      console.log('✅ Renewal booking confirmed:', bookingData.bookingId);

      res.json({
        success: true,
        message: 'NIC Renewal Appointment confirmed successfully! 🎉',
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt
        }
      });
    } catch (error) {
      console.error('❌ Error confirming renewal booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm booking'
=======
      console.log("✅ Renewal booking confirmed:", bookingData.bookingId);

      res.json({
        success: true,
        message: "NIC Renewal Appointment confirmed successfully! 🎉",
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt,
        },
      });
    } catch (error) {
      console.error("❌ Error confirming renewal booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to confirm booking",
>>>>>>> origin/main
      });
    }
  }

  // Get user's bookings
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;
<<<<<<< HEAD
      
      const snapshot = await this.db.ref('nic_bookings')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const bookings = snapshot.val() || {};
      const bookingList = Object.entries(bookings).map(([id, data]) => ({
        id,
        ...data
=======

      const snapshot = await this.db
        .ref("nic_bookings")
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
      console.error('❌ Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
=======
        data: bookingList,
      });
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bookings",
>>>>>>> origin/main
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
<<<<<<< HEAD
      
      await this.db.ref(`nic_bookings/${bookingId}`).update({
        'appointmentInfo/status': 'cancelled',
        'appointmentInfo/cancelledAt': Date.now(),
        updatedAt: Date.now()
=======

      await this.db.ref(`nic_bookings/${bookingId}`).update({
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
      console.error('❌ Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking'
=======
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("❌ Error cancelling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel booking",
>>>>>>> origin/main
      });
    }
  }
}

<<<<<<< HEAD
module.exports = NICBookingController;
=======
module.exports = NICBookingController;
>>>>>>> origin/main
