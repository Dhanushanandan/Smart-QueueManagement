const admin = require("../firebaseAdmin");
const Tesseract = require("tesseract.js");
const { Buffer } = require("buffer");

function clean(text) {
  return (text || "").replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function normalize(text) {
  return clean(text).toLowerCase();
}

function isLabelLine(line) {
  const l = normalize(line);
  return (
    l.includes("district") ||
    l.includes("serial") ||
    l.includes("date and place of birth") ||
    l === "name" ||
    l === "sex" ||
    l.includes("father") ||
    l.includes("mother") ||
    l.includes("full name") ||
    l.includes("date of birth") ||
    l.includes("place of birth") ||
    l.includes("race") ||
    l.includes("rank or profession") ||
    l.includes("age") ||
    l.includes("were parents married")
  );
}

function getNextUsefulLine(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i++) {
    const line = clean(lines[i]);
    if (!line) continue;
    if (isLabelLine(line)) continue;
    return line;
  }
  return "";
}

function getBlockAfterLabel(lines, labelMatcher, maxLines = 8) {
  for (let i = 0; i < lines.length; i++) {
    if (labelMatcher(normalize(lines[i]))) {
      const values = [];

      for (let j = i + 1; j < lines.length && j <= i + maxLines; j++) {
        const line = clean(lines[j]);
        if (!line) continue;
        if (isLabelLine(line)) break;
        values.push(line);
      }

      return values;
    }
  }
  return [];
}

function extractSerialNo(text) {
  const matches = clean(text).match(/\b\d{4,7}\b/g);
  return matches && matches.length ? matches[0] : "";
}

function extractFields(fullText) {
  const lines = fullText
    .split("\n")
    .map((line) => clean(line))
    .filter(Boolean);

  const result = {
    name: "",
    dateOfBirth: "",
    serialNo: extractSerialNo(fullText),
    fatherName: "",
    motherName: "",
    placeOfBirth: "",
    district: "",
    sex: "",
    rawText: fullText,
  };

  const districtBlock = getBlockAfterLabel(
    lines,
    (l) => l === "district" || l.includes("district"),
    4,
  );
  if (districtBlock.length) {
    result.district = districtBlock[0];
  }

  const dobPlaceBlock = getBlockAfterLabel(
    lines,
    (l) => l.includes("date and place of birth"),
    6,
  );
  if (dobPlaceBlock.length > 0) {
    result.dateOfBirth = dobPlaceBlock[0] || "";
    result.placeOfBirth = dobPlaceBlock[1] || "";
  }

  const nameBlock = getBlockAfterLabel(lines, (l) => l === "name", 4);
  if (nameBlock.length) {
    result.name = nameBlock[0];
  }

  const sexBlock = getBlockAfterLabel(
    lines,
    (l) => l === "sex" || l.includes("sex"),
    3,
  );
  if (sexBlock.length) {
    result.sex = sexBlock[0];
  }

  for (let i = 0; i < lines.length; i++) {
    const l = normalize(lines[i]);

    if (l.includes("father")) {
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const sub = normalize(lines[j]);
        if (sub === "full name" || sub.includes("full name")) {
          result.fatherName = getNextUsefulLine(lines, j + 1);
          break;
        }
      }
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const l = normalize(lines[i]);

    if (l.includes("mother")) {
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const sub = normalize(lines[j]);
        if (sub === "full name" || sub.includes("full name")) {
          result.motherName = getNextUsefulLine(lines, j + 1);
          break;
        }
      }
      break;
    }
  }

  return result;
}

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

    await admin.database().ref(`pendingUsers/${uid}`).set({
      uid,
      nic,
      name,
      dob,
      email,
      mobile,
      createdAt: Date.now(),
      step: "basic_details_saved",
    });

    return res.status(200).json({
      success: true,
      message: "Pending user saved successfully",
    });
  } catch (error) {
    console.error("savePendingUser error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save pending user",
    });
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

    const userSnapshot = await admin
      .database()
      .ref(`users/${uid}`)
      .once("value");
    const pendingSnapshot = await admin
      .database()
      .ref(`pendingUsers/${uid}`)
      .once("value");

    return res.status(200).json({
      inUsers: userSnapshot.exists(),
      inPendingUsers: pendingSnapshot.exists(),
    });
  } catch (error) {
    console.error("checkUserNode error:", error);
    return res.status(500).json({ message: error.message });
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

    return res.status(200).json({ exists });
  } catch (error) {
    console.error("checkPendingEmail error:", error);
    return res.status(500).json({ message: error.message });
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

    const pendingRef = admin.database().ref(`pendingUsers/${uid}`);
    const snapshot = await pendingRef.once("value");
    const pendingData = snapshot.val();

    if (!pendingData) {
      return res.status(400).json({ message: "No pending user data found" });
    }

    await admin
      .database()
      .ref()
      .update({
        [`users/${uid}`]: {
          ...pendingData,
          status: "active",
          finalizedAt: Date.now(),
        },
        [`pendingUsers/${uid}`]: null,
      });

    return res.status(200).json({
      message: "User moved to users node successfully",
    });
  } catch (error) {
    console.error("finalizeUser error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.uploadCertificate = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    await admin.auth().verifyIdToken(idToken);

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    const buffer = Buffer.from(imageBase64, "base64");

    const result = await Tesseract.recognize(buffer, "eng", {
      logger: () => {},
    });

    const fullText = result.data.text || "";
    const certificateDetails = extractFields(fullText);

    return res.status(200).json({
      message: "Certificate extracted successfully",
      certificateDetails,
    });
  } catch (error) {
    console.error("uploadCertificate error:", error);
    return res.status(500).json({
      message: error.message || "Certificate extraction failed",
    });
  }
};

exports.saveCertificateDetails = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const {
      name,
      dateOfBirth,
      serialNo,
      fatherName,
      motherName,
      placeOfBirth,
      district,
      sex,
      rawText,
    } = req.body;

    const pendingRef = admin.database().ref(`pendingUsers/${uid}`);
    const snapshot = await pendingRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Pending user not found. Save signup details first.",
      });
    }

    const certificateDetails = {
      name: name || "",
      dateOfBirth: dateOfBirth || "",
      serialNo: serialNo || "",
      fatherName: fatherName || "",
      motherName: motherName || "",
      placeOfBirth: placeOfBirth || "",
      district: district || "",
      sex: sex || "",
      rawText: rawText || "",
    };

    await pendingRef.update({
      certificateDetails,
      step: "certificate_saved",
      certificateSavedAt: Date.now(),
    });

    return res.status(200).json({
      message: "Certificate details saved under pending user successfully",
    });
  } catch (error) {
    console.error("saveCertificateDetails error:", error);
    return res.status(500).json({
      message: error.message || "Failed to save certificate details",
    });
  }
};
