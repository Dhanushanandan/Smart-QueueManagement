const admin = require("firebase-admin");
const { recommendTimeSlot } = require("../aiRecommendationService");
const NICBookingModel = require("../models/NICBookingModel");

class NICBookingController {
  constructor() {
    this.db = admin.database();
    this.model = new NICBookingModel();
  }

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

  // Save step 1 - Personal Information
  async savePersonalInfo(req, res) {
    try {
      const { userId } = req.params;
      const personalData = req.body;

      console.log("📝 Saving personal info for user:", userId);
      console.log("Data received:", personalData);

      // Validate data
      const errors = this.model.validatePersonalInfo(personalData);
      if (errors.length > 0) {
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
      });
    }
  }

  // Save step 2 - Verification Information
  async saveVerificationInfo(req, res) {
    try {
      const { userId } = req.params;
      const verificationData = req.body;

      console.log("📝 Saving verification info for user:", userId);

      // Validate data
      const errors = this.model.validateVerificationInfo(verificationData);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      // Check if personal info exists
      const personalSnapshot = await this.db
        .ref(`temp_bookings/${userId}/personalInfo`)
        .once("value");
      if (!personalSnapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete personal information first",
        });
      }

      // Save verification info
      await this.db.ref(`temp_bookings/${userId}/verificationInfo`).set({
        ...verificationData,
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
      });
    }
  }

  // Save Renewal Step 1
  async saveRenewalStep1(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

      console.log("📝 Saving renewal step 1 for user:", userId);

      const errors = this.model.validateRenewalStep1(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step1`).set({
        ...data,
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
      });
    }
  }

  // Save Renewal Step 2 (Police Report)
  async saveRenewalStep2(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

      console.log("📝 Saving renewal step 2 for user:", userId);

      const errors = this.model.validateRenewalStep2(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step2`).set({
        ...data,
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
      });
    }
  }

  // Save Renewal Step 3 (Address & Documents)
  async saveRenewalStep3(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;

      console.log("📝 Saving renewal step 3 for user:", userId);

      const errors = this.model.validateRenewalStep3(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_renewal_bookings/${userId}/step3`).set({
        ...data,
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
      });
    }
  }

  // Get AI recommended time slot
  async getRecommendedTimeSlot(req, res) {
    try {
      const { userId } = req.params;
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
      }

      res.json({
        success: true,
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
      });
    }
  }

  // Get all temp booking data for review
  async getTempBookingData(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref(`temp_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

      res.json({
        success: true,
        data: {
          personalInfo: data.personalInfo || {},
          verificationInfo: data.verificationInfo || {},
          recommendedSlot: data.recommendedSlot || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
      });
    }
  }

  // Get temp renewal data
  async getTempRenewalData(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref(`temp_renewal_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

      res.json({
        success: true,
        data: {
          ...data.step1,
          ...data.step2,
          ...data.step3,
          recommendedSlot: data.recommendedSlot || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching renewal temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
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
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_bookings/${userId}`)
        .once("value");
      const tempData = tempSnapshot.val() || {};

      if (!tempData.personalInfo || !tempData.verificationInfo) {
        return res.status(400).json({
          success: false,
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
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_bookings/${userId}`).remove();

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
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_renewal_bookings/${userId}`)
        .once("value");
      const tempData = tempSnapshot.val() || {};

      if (!tempData.step1 || !tempData.step3) {
        return res.status(400).json({
          success: false,
          error: "Missing required information. Please complete all steps.",
        });
      }

      const completeData = {
        ...tempData.step1,
        ...tempData.step2,
        ...tempData.step3,
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
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_renewal_bookings/${userId}`).remove();

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
      });
    }
  }

  // Get user's bookings
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref("nic_bookings")
        .orderByChild("userId")
        .equalTo(userId)
        .once("value");

      const bookings = snapshot.val() || {};
      const bookingList = Object.entries(bookings).map(([id, data]) => ({
        id,
        ...data,
      }));

      bookingList.sort((a, b) => b.createdAt - a.createdAt);

      res.json({
        success: true,
        data: bookingList,
      });
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bookings",
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;

      await this.db.ref(`nic_bookings/${bookingId}`).update({
        "appointmentInfo/status": "cancelled",
        "appointmentInfo/cancelledAt": Date.now(),
        updatedAt: Date.now(),
      });

      res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("❌ Error cancelling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel booking",
      });
    }
  }
}

module.exports = NICBookingController;