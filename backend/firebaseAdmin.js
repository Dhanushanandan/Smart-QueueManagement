const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://smartqueuemanagement-5fa87-default-rtdb.asia-southeast1.firebasedatabase.app/",
  });
}

module.exports = admin;