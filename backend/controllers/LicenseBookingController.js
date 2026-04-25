const admin = require("firebase-admin");
const { recommendTimeSlot } = require("../aiRecommendationService");
const LicenseBookingModel = require("../models/LicenseBookingModel");

class LicenseBookingController {
  constructor() {
    this.db = admin.database();
    this.model = new LicenseBookingModel();
  }

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

  // Save step 1 - Personal Information
  async savePersonalInfo(req, res) {
    try {
      const { userId } = req.params;
      const personalData = req.body;

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
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step1`).set({
        ...personalData,
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
      });
    }
  }

  // Save step 2 - Identity Information
  async saveIdentityInfo(req, res) {
    try {
      const { userId } = req.params;
      const identityData = req.body;

      console.log("📝 [License] Saving identity info for user:", userId);

      const step1Snapshot = await this.db
        .ref(`temp_license_bookings/${userId}/step1`)
        .once("value");
      if (!step1Snapshot.exists()) {
        return res.status(400).json({
          success: false,
          error: "Please complete personal information first",
        });
      }

      const errors = this.model.validateStep2(identityData);
      if (errors.length > 0) {
        console.log("❌ [License] Validation errors:", errors);
        return res.status(400).json({
          success: false,
          errors,
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step2`).set({
        ...identityData,
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
      });
    }
  }

  // Save step 3 - Medical & Address Information
  async saveMedicalInfo(req, res) {
    try {
      const { userId } = req.params;
      const medicalData = req.body;

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
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step3`).set({
        ...medicalData,
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
      });
    }
  }

  // Save step 4 - License & Emergency Details
  async saveLicenseDetails(req, res) {
    try {
      const { userId } = req.params;
      const licenseData = req.body;

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
        });
      }

      await this.db.ref(`temp_license_bookings/${userId}/step4`).set({
        ...licenseData,
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
      });
    }
  }

  // Get AI recommended time slot
  async getRecommendedTimeSlot(req, res) {
    try {
      const { userId } = req.params;
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
      }

      res.json({
        success: true,
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
      });
    }
  }

  // Get available slots
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.query;
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

        if (!bookedSlots.has(fullSlot)) {
          availableSlots.push({
            date: targetDate,
            time: slot,
            fullSlot,
            crowdLevel,
          });
        }
      });

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
      });
    }
  }

  // Get temp license booking data
  async getTempBookingData(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref(`temp_license_bookings/${userId}`)
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
      console.error("❌ [License] Error fetching temp data:", error);
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
      await bookingRef.set(bookingData);

      await this.db.ref(`temp_license_bookings/${userId}`).remove();

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
      });
    }
  }

  // Create license appointment from dashboard
  async createAppointment(req, res) {
    try {
      const appointmentData = req.body;

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
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

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
      });
    }
  }

  // Get user's license bookings
  async getUserBookings(req, res) {
    try {
      const { userId } = req.params;

      const snapshot = await this.db
        .ref("license_bookings")
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
      console.error("❌ [License] Error fetching bookings:", error);
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
        .ref(`license_bookings/${bookingId}`)
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
      console.error("❌ [License] Error fetching booking details:", error);
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

      await this.db.ref(`license_bookings/${bookingId}`).update({
        "appointmentInfo/status": "cancelled",
        "appointmentInfo/cancelledAt": Date.now(),
        updatedAt: Date.now(),
      });

      res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("❌ [License] Error cancelling booking:", error);
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

      await this.db.ref(`license_bookings/${bookingId}`).update({
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
      console.error("❌ [License] Error rescheduling booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reschedule booking",
      });
    }
  }
}

module.exports = LicenseBookingController;