const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

function getText(textAnchor, fullText) {
  if (!textAnchor || !textAnchor.textSegments || !textAnchor.textSegments.length) {
    return "";
  }

  return textAnchor.textSegments
    .map((segment) => {
      const startIndex = segment.startIndex ? parseInt(segment.startIndex, 10) : 0;
      const endIndex = parseInt(segment.endIndex, 10);
      return fullText.substring(startIndex, endIndex);
    })
    .join("")
    .trim();
}

function normalizeEntityType(type) {
  const t = (type || "").toLowerCase();

  if (t.includes("name") && !t.includes("father") && !t.includes("mother")) {
    return "name";
  }
  if (t.includes("dateofbirth") || t.includes("date_of_birth") || t === "dob") {
    return "dateOfBirth";
  }
  if (t.includes("serial")) {
    return "serialNo";
  }
  if (t.includes("father")) {
    return "fatherName";
  }
  if (t.includes("mother")) {
    return "motherName";
  }
  if (t.includes("placeofbirth") || t.includes("place_of_birth")) {
    return "placeOfBirth";
  }
  if (t.includes("district")) {
    return "district";
  }
  if (t.includes("sex") || t.includes("gender")) {
    return "sex";
  }

  return null;
}

async function extractCertificateDetailsFromDocumentAI(base64Image) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.DOCUMENT_AI_LOCATION;
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

  if (!projectId || !location || !processorId) {
    throw new Error("Missing Document AI environment variables");
  }

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const request = {
    name,
    rawDocument: {
      content: base64Image,
      mimeType: "image/jpeg",
    },
    // Optional: reduce response size if desired
    // fieldMask: "text,entities"
  };

  const [result] = await client.processDocument(request);
  const document = result.document;
  const fullText = document.text || "";

  const certificateDetails = {
    name: "",
    dateOfBirth: "",
    serialNo: "",
    fatherName: "",
    motherName: "",
    placeOfBirth: "",
    district: "",
    sex: "",
    rawText: fullText,
  };

  const entities = document.entities || [];

  for (const entity of entities) {
    const key = normalizeEntityType(entity.type);
    if (!key) continue;

    const value =
      entity.mentionText?.trim() ||
      getText(entity.textAnchor, fullText);

    if (value && !certificateDetails[key]) {
      certificateDetails[key] = value;
    }
  }

  return certificateDetails;
}

module.exports = {
  extractCertificateDetailsFromDocumentAI,
};