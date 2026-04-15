const admin = require("../firebaseAdmin");

const db = admin.database();

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

// ==============================
// SAVE PENDING USER
// ==============================
exports.savePendingUser = async (req, res) => {
  try {
    const { email, userId, uid, nic, name, dob, mobile } = req.body;
    const userUid = userId || uid;

    if (!email || !userUid) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and userId/uid are required" 
      });
    }

    // Check if already exists
    const existingSnapshot = await db.ref(`pendingUsers/${userUid}`).once("value");
    if (existingSnapshot.exists()) {
      return res.json({ 
        success: true, 
        message: "User already in pending" 
      });
    }

    // Save with all available data
    await db.ref(`pendingUsers/${userUid}`).set({
      uid: userUid,
      email: email.toLowerCase().trim(),
      userId: userUid,
      nic: nic || "",
      name: name || "",
      dob: dob || "",
      mobile: mobile || "",
      createdAt: Date.now(),
      step: "basic_details_saved",
    });

    return res.status(200).json({ 
      success: true, 
      message: "User saved to pending" 
    });
  } catch (err) {
    console.error("Error in savePendingUser:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// FINALIZE USER
// ==============================
exports.finalizeUser = async (req, res) => {
  try {
    // Get user from Firebase Auth token (set by middleware)
    const uid = req.user?.uid;
    const email = req.user?.email;
    
    console.log("Finalizing user:", uid, email);
    
    if (!uid || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing user data" 
      });
    }

    // Get pending user data
    const pendingRef = db.ref(`pendingUsers/${uid}`);
    const pendingSnapshot = await pendingRef.once("value");
    const pendingData = pendingSnapshot.val();
    
    if (!pendingData) {
      // Check if user already exists in users
      const userSnapshot = await db.ref(`users/${uid}`).once("value");
      if (userSnapshot.exists()) {
        return res.json({ 
          success: true, 
          message: "User already exists" 
        });
      }
      
      return res.status(404).json({ 
        success: false, 
        message: "User not found in pending" 
      });
    }

    // Move to users collection with all pending data
    await db.ref().update({
      [`users/${uid}`]: {
        ...pendingData,
        status: "active",
        finalizedAt: Date.now(),
      },
      [`pendingUsers/${uid}`]: null,
    });

    console.log("User finalized successfully:", uid);
    
    return res.json({ 
      success: true, 
      message: "User finalized successfully" 
    });
  } catch (err) {
    console.error("Error in finalizeUser:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK USER NODE
// ==============================
exports.checkUserNode = async (req, res) => {
  try {
    const uid = req.user?.uid;
    
    console.log("Checking user node for UID:", uid);
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No user ID" 
      });
    }

    // Check if user exists in users collection
    const userSnapshot = await db.ref(`users/${uid}`).once("value");
    const inUsers = userSnapshot.exists();
    
    // Check if user exists in pendingUsers collection
    const pendingSnapshot = await db.ref(`pendingUsers/${uid}`).once("value");
    const inPendingUsers = pendingSnapshot.exists();

    console.log("User check result:", { inUsers, inPendingUsers });

    return res.status(200).json({
      success: true,
      inUsers: inUsers,
      inPendingUsers: inPendingUsers
    });
  } catch (err) {
    console.error("Error in checkUserNode:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK PENDING EMAIL
// ==============================
exports.checkPendingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    console.log("Checking pending email:", email);

    const snapshot = await db
      .ref("pendingUsers")
      .orderByChild("email")
      .equalTo(email.toLowerCase().trim())
      .once("value");

    const exists = snapshot.exists();
    console.log("Pending email exists:", exists);

    return res.status(200).json({
      success: true,
      exists: exists,
    });
  } catch (err) {
    console.error("Error in checkPendingEmail:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// CHECK USER STATUS
// ==============================
exports.checkUserStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const snapshot = await db
      .ref("users")
      .orderByChild("email")
      .equalTo(email.toLowerCase().trim())
      .once("value");

    return res.status(200).json({
      success: true,
      exists: snapshot.exists(),
    });
  } catch (err) {
    console.error("Error in checkUserStatus:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// ==============================
// UPLOAD CERTIFICATE (OCR)
// ==============================
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

// ==============================
// SAVE CERTIFICATE DETAILS
// ==============================
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

    const pendingRef = db.ref(`pendingUsers/${uid}`);
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

// ==============================
// HEALTH CHECK
// ==============================
exports.healthCheck = (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
};