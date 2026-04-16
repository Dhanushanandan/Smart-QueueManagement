const admin = require("../firebaseAdmin");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken; // ✅ THIS IS WHAT YOU NEED

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};

module.exports = verifyToken;