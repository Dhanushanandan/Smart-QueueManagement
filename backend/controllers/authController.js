const admin = require("../firebaseAdmin");

exports.savePendingUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { nic, name, dob, email, mobile } = req.body;

    if (!nic || !name || !dob || !email || !mobile) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    await admin.database().ref("pendingUsers/" + uid).set({
      uid: uid,
      nic: nic,
      name: name,
      dob: dob,
      email: email,
      mobile: mobile,
    });

    res.status(200).json({ message: "Pending user saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await admin.auth().getUser(uid);

    if (!userRecord.emailVerified) {
      return res.status(400).json({ message: "Email is not verified" });
    }

    const snapshot = await admin
      .database()
      .ref("pendingUsers/" + uid)
      .once("value");

    const pendingData = snapshot.val();

    if (!pendingData) {
      return res.status(400).json({ message: "No pending user data found" });
    }

    await admin.database().ref("users/" + uid).set({
      uid: pendingData.uid,
      nic: pendingData.nic,
      name: pendingData.name,
      dob: pendingData.dob,
      email: pendingData.email,
      mobile: pendingData.mobile,
    });

    await admin.database().ref("pendingUsers/" + uid).remove();

    res.status(200).json({ message: "User saved in Realtime Database" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// const admin = require("../firebaseAdmin");

exports.checkUserStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userSnapshot = await admin.database().ref("users/" + uid).once("value");
    if (userSnapshot.exists()) {
      return res.status(200).json({ status: "user" });
    }

    const pendingSnapshot = await admin.database().ref("pendingUsers/" + uid).once("value");
    if (pendingSnapshot.exists()) {
      return res.status(200).json({ status: "pending" });
    }

    return res.status(200).json({ status: "not_found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const snapshot = await admin.database().ref("pendingUsers").once("value");
    const pendingUsers = snapshot.val();

    if (!pendingUsers) {
      return res.status(200).json({ exists: false });
    }

    let exists = false;

    Object.keys(pendingUsers).forEach((key) => {
      if (
        pendingUsers[key].email &&
        pendingUsers[key].email.toLowerCase() === email.toLowerCase()
      ) {
        exists = true;
      }
    });

    return res.status(200).json({ exists: exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.checkUserNode = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userSnapshot = await admin.database().ref("users/" + uid).once("value");
    const pendingSnapshot = await admin.database().ref("pendingUsers/" + uid).once("value");

    res.status(200).json({
      inUsers: userSnapshot.exists(),
      inPendingUsers: pendingSnapshot.exists(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const snapshot = await admin.database().ref("pendingUsers").once("value");
    const pendingUsers = snapshot.val();

    if (!pendingUsers) {
      return res.status(200).json({ exists: false });
    }

    let exists = false;

    Object.keys(pendingUsers).forEach((key) => {
      if (
        pendingUsers[key].email &&
        pendingUsers[key].email.toLowerCase() === email.toLowerCase()
      ) {
        exists = true;
      }
    });

    res.status(200).json({ exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await admin.auth().getUser(uid);

    if (!userRecord.emailVerified) {
      return res.status(400).json({ message: "Email is not verified" });
    }

    const pendingRef = admin.database().ref("pendingUsers/" + uid);
    const snapshot = await pendingRef.once("value");
    const pendingData = snapshot.val();

    if (!pendingData) {
      return res.status(400).json({ message: "No pending user data found" });
    }

    await admin.database().ref().update({
      ["users/" + uid]: pendingData,
      ["pendingUsers/" + uid]: null,
    });

    res.status(200).json({ message: "User moved to users node successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};