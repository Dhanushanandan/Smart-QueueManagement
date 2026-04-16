const router = require("express").Router();
const controller = require("../controllers/dashboardController");

// USER
router.post("/user", controller.createUser);
router.get("/user/:email", controller.getUserByEmail);

// APPOINTMENTS
router.post("/appointments", controller.createAppointment);
router.get("/appointments/:uid", controller.getAppointments);

// QUEUE
router.get("/queue/:uid", controller.getQueueStatus);
router.post("/queue/refresh/:uid", controller.refreshQueue);

// NOTIFICATIONS
router.get("/notifications/:uid", controller.getNotifications);
router.put("/notifications/:uid/:id", controller.markNotificationRead);

// STATS
router.get("/stats/:uid", controller.getStats);

// ANNOUNCEMENTS
router.get("/announcements", controller.getAnnouncements);

module.exports = router;