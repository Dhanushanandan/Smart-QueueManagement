const admin = require("firebase-admin");
const { recommendTimeSlot } = require("../aiRecommendationService");
const PassportBookingModel = require("../models/PassportBookingModel");

class PassportBookingController {
  constructor() {
    this.db = admin.database();
    this.model = new PassportBookingModel();
  }

  parseTimeslot(timeslot = "") {
    const trimmed = (timeslot || "").trim();
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.*))?$/);
    if (!match) return { date: "", time: trimmed };
    return { date: match[1] || "", time: (match[2] || "").trim() };
  }

  async generateQueueNumber(timeslot) {
    const { date, time } = this.parseTimeslot(timeslot);
    const snapshot = await this.db.ref("passport_bookings").once("value");
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
    const queueNumber = "PPT-" + String(tokenNumber).padStart(3, "0");
    return { tokenNumber, queueNumber, date, time };
  }

  // Save step 1 - Personal Information
  async savePersonalInfo(req, res) {
    try {
      const { userId } = req.params;
      const personalData = req.body;

      console.log("📝 [Passport] Saving personal info for user:", userId);

      const errors = this.model.validateStep1(personalData);
      if (errors.length > 0) {
        console.log("❌ [Passport] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_passport_bookings/${userId}/step1`).set({
        ...personalData,
        authUserId: personalData.authUserId || "",
        authEmail: personalData.authEmail || "",
        savedAt: Date.now(),
      });

      console.log("✅ [Passport] Personal info saved successfully");

      res.json({
        success: true,
        message: "Personal information saved temporarily",
        data: personalData,
      });
    } catch (error) {
      console.error("❌ [Passport] Error saving personal info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save personal information",
      });
    }
  }

  // Save step 2 - Identity Information
  async saveIdentityInfo(req, res) {
    try {
      const { userId } = req.params;
      const identityData = req.body;

      console.log("📝 [Passport] Saving identity info for user:", userId);

      const step1Snapshot = await this.db
        .ref(`temp_passport_bookings/${userId}/step1`)
        .once("value");
      if (!step1Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete personal information first",
        });
      }

      const errors = this.model.validateStep2(identityData);
      if (errors.length > 0) {
        console.log("❌ [Passport] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_passport_bookings/${userId}/step2`).set({
        ...identityData,
        savedAt: Date.now(),
      });

      console.log("✅ [Passport] Identity info saved successfully");

      res.json({
        success: true,
        message: "Identity information saved temporarily",
        data: identityData,
      });
    } catch (error) {
      console.error("❌ [Passport] Error saving identity info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save identity information",
      });
    }
  }

  // Save step 3 - Family & Address Information
  async saveFamilyInfo(req, res) {
    try {
      const { userId } = req.params;
      const familyData = req.body;

      console.log(
        "📝 [Passport] Saving family & address info for user:",
        userId,
      );

      const step2Snapshot = await this.db
        .ref(`temp_passport_bookings/${userId}/step2`)
        .once("value");
      if (!step2Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete identity information first",
        });
      }

      const errors = this.model.validateStep3(familyData);
      if (errors.length > 0) {
        console.log("❌ [Passport] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_passport_bookings/${userId}/step3`).set({
        ...familyData,
        savedAt: Date.now(),
      });

      console.log("✅ [Passport] Family & address info saved successfully");

      res.json({
        success: true,
        message: "Family and address information saved temporarily",
        data: familyData,
      });
    } catch (error) {
      console.error("❌ [Passport] Error saving family info:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save family information",
      });
    }
  }

  // Save step 4 - Passport & Emergency Details
  async savePassportDetails(req, res) {
    try {
      const { userId } = req.params;
      const passportData = req.body;

      console.log("📝 [Passport] Saving passport details for user:", userId);

      const step3Snapshot = await this.db
        .ref(`temp_passport_bookings/${userId}/step3`)
        .once("value");
      if (!step3Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete family information first",
        });
      }

      const errors = this.model.validateStep4(passportData);
      if (errors.length > 0) {
        console.log("❌ [Passport] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_passport_bookings/${userId}/step4`).set({
        ...passportData,
        savedAt: Date.now(),
      });

      console.log("✅ [Passport] Passport details saved successfully");

      res.json({
        success: true,
        message: "Passport details saved temporarily",
        data: passportData,
      });
    } catch (error) {
      console.error("❌ [Passport] Error saving passport details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save passport details",
      });
    }
  }

  // Get AI recommended time slot
  async getRecommendedTimeSlot(req, res) {
    try {
      const { userId } = req.params;
      const snapshot = await this.db.ref("passport_bookings").once("value");
      const bookings = Object.values(snapshot.val() || {});

      const aiResult = await recommendTimeSlot({
        serviceType: "passport",
        bookings,
      });

      if (aiResult.recommended) {
        await this.db
          .ref(`temp_passport_bookings/${userId}/recommendedSlot`)
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
      console.error("❌ [PASSPORT] Error getting time slot:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get recommended time slot",
      });
    }
  }

  // Get available slots
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split("T")[0];

      const snapshot = await this.db
        .ref("passport_bookings")
        .orderByChild("appointmentInfo/timeslot")
        .once("value");

      const bookings = snapshot.val() || {};
      const bookedSlots = new Set();

      Object.values(bookings).forEach((booking) => {
        if (booking.appointmentInfo?.timeslot) {
          bookedSlots.add(booking.appointmentInfo.timeslot);
        }
      });

      const allSlots = [
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
        if (!bookedSlots.has(fullSlot)) {
          const hour = parseInt(slot.split(":")[0]);
          const isPM = slot.includes("PM");
          const actualHour = isPM && hour !== 12 ? hour + 12 : hour;

          let crowdLevel = "Less crowded";
          if (actualHour >= 9 && actualHour <= 11) {
            crowdLevel = "Less crowded";
          } else if (actualHour >= 13 && actualHour <= 15) {
            crowdLevel = "Moderate";
          } else {
            crowdLevel = "Busy";
          }

          availableSlots.push({
            date: targetDate,
            time: slot,
            fullSlot,
            crowdLevel,
          });
        }
      });

      res.json({
        success: true,
        data: availableSlots,
      });
    } catch (error) {
      console.error("❌ [Passport] Error getting available slots:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get available slots",
      });
    }
  }

  // Get temp passport booking data
  async getTempBookingData(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref(`temp_passport_bookings/${userId}`)
        .once("value");
      const data = snapshot.val() || {};

      res.json({
        success: true,
        data: {
          ...data.step1,
          ...data.step2,
          ...data.step3,
          ...data.step4,
          recommendedSlot: data.recommendedSlot || null,
          documents: data.documents || [],
        },
      });
    } catch (error) {
      console.error("❌ [Passport] Error fetching temp data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking data",
      });
    }
  }

  // Save documents
  async saveDocuments(req, res) {
    try {
      const { userId } = req.params;
      const { documents } = req.body;

      console.log("📝 [Passport] Saving documents for user:", userId);

      await this.db
        .ref(`temp_passport_bookings/${userId}/documents`)
        .set(documents);

      console.log("✅ [Passport] Documents saved successfully");

      res.json({
        success: true,
        message: "Documents saved successfully",
        data: documents,
      });
    } catch (error) {
      console.error("❌ [Passport] Error saving documents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save documents",
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
          error: "Time slot is required",
        });
      }

      const tempSnapshot = await this.db
        .ref(`temp_passport_bookings/${userId}`)
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
        });
      }

      const completeData = {
        ...tempData.step1,
        ...tempData.step2,
        ...tempData.step3,
        ...tempData.step4,
        timeslot,
        documents: documents || tempData.documents || [],
      };

      const actualUserId = tempData.step1?.authUserId || userId;
      // const actualUserId = tempData.step1?.authUserId || userId;
      const bookingData = this.model.formatBookingData(
        actualUserId,
        completeData,
        serviceType || "new",
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

      const bookingRef = this.db.ref("passport_bookings").push();
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_passport_bookings/${userId}`).remove();

      console.log("✅ [Passport] Booking confirmed:", bookingData.bookingId);

      res.json({
        success: true,
        message: "Passport Appointment confirmed successfully! 🎉",
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
          confirmedAt: bookingData.appointmentInfo.confirmedAt,
        },
      });
    } catch (error) {
      console.error("❌ [Passport] Error confirming booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to confirm booking",
      });
    }
  }

  // Get user's passport bookings
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref("passport_bookings")
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
      console.error("❌ [Passport] Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bookings",
      });
    }
  }

  // Get single booking details
  async getBookingDetails(req, res) {
    try {
      const { bookingId } = req.params;

      const snapshot = await this.db
        .ref(`passport_bookings/${bookingId}`)
        .once("value");
      const booking = snapshot.val();

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      res.json({
        success: true,
        data: {
          id: bookingId,
          ...booking,
        },
      });
    } catch (error) {
      console.error("❌ [Passport] Error fetching booking details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch booking details",
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;

      await this.db.ref(`passport_bookings/${bookingId}`).update({
        "appointmentInfo/status": "cancelled",
        "appointmentInfo/cancelledAt": Date.now(),
        updatedAt: Date.now(),
      });

      res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("❌ [Passport] Error cancelling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel booking",
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
          error: "New time slot is required",
        });
      }

      await this.db.ref(`passport_bookings/${bookingId}`).update({
        "appointmentInfo/timeslot": timeslot,
        "appointmentInfo/rescheduledAt": Date.now(),
        updatedAt: Date.now(),
      });

      res.json({
        success: true,
        message: "Booking rescheduled successfully",
        data: { timeslot },
      });
    } catch (error) {
      console.error("❌ [Passport] Error rescheduling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reschedule booking",
      });
    }
  }

  // Create appointment from dashboard
  async createAppointment(req, res) {
    try {
      const appointmentData = req.body;

      console.log("📝 [Passport] Creating appointment from dashboard");

      const timeslot =
        `${appointmentData.date || ""} ${appointmentData.time || ""}`.trim();
      const { tokenNumber, queueNumber } =
        await this.generateQueueNumber(timeslot);

      const bookingData = {
        userId: appointmentData.userId,
        serviceType: appointmentData.service || "passport",
        bookingId: `PPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        personalInfo: {
          fullName: appointmentData.fullName || "",
          mobile: appointmentData.phone || "",
          email: appointmentData.email || "",
        },
        addressInfo: {
          address: appointmentData.address || "",
        },
        passportDetails: {
          passportType: appointmentData.passportType || "Ordinary",
        },
        appointmentInfo: {
          date: appointmentData.date || "",
          time: appointmentData.time || "",
          timeslot,
          status: "upcoming",
          confirmedAt: Date.now(),
          queueNumber,
          tokenNumber,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const bookingRef = this.db.ref("passport_bookings").push();
      await bookingRef.set(bookingData);

      console.log("✅ [Passport] Appointment created:", bookingData.bookingId);

      res.json({
        success: true,
        message: "Passport appointment booked successfully!",
        data: {
          bookingId: bookingData.bookingId,
          queueNumber,
          tokenNumber,
          timeslot: bookingData.appointmentInfo.timeslot,
        },
      });
    } catch (error) {
      console.error("❌ [Passport] Error creating appointment:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create appointment",
      });
    }
  }
}

module.exports = PassportBookingController;
