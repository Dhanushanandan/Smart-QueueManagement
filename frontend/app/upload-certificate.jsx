import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../constants/useTheme";
import { auth } from "../services/firebaseAuth";

export default function UploadCertificateScreen() {
  const COLORS = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    serialNo: "",
    fatherName: "",
    motherName: "",
    placeOfBirth: "",
    district: "",
    sex: "",
    rawText: "",
  });

  // const API_URL = "http://192.168.251.40:5000/api";
  const API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setShowForm(false);
      setFormData({
        name: "",
        dateOfBirth: "",
        serialNo: "",
        fatherName: "",
        motherName: "",
        placeOfBirth: "",
        district: "",
        sex: "",
        rawText: "",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select the birth certificate image");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setLoading(true);

      const token = await auth.currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/upload-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64: selectedImage.base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Upload failed");
        return;
      }

      const d = data.certificateDetails || {};

      setFormData({
        name: d.name || "",
        dateOfBirth: d.dateOfBirth || "",
        serialNo: d.serialNo || "",
        fatherName: d.fatherName || "",
        motherName: d.motherName || "",
        placeOfBirth: d.placeOfBirth || "",
        district: d.district || "",
        sex: d.sex || "",
        rawText: d.rawText || "",
      });

      setShowForm(true);
    } catch (error) {
      Alert.alert("Error", error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setLoading(true);

      const token = await auth.currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/save-certificate-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Save failed");
        return;
      }

      Alert.alert(
        "Success",
        "Certificate details saved under pending user. Verify email and then login.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.background,
      padding: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: COLORS.text,
      marginBottom: 20,
      marginTop: 20,
    },
    text: {
      color: COLORS.text,
      marginBottom: 10,
    },
    button: {
      width: "100%",
      height: 50,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      marginTop: 15,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "bold",
    },
    image: {
      width: 250,
      height: 180,
      borderRadius: 10,
      marginTop: 20,
    },
    form: {
      width: "100%",
      marginTop: 20,
    },
    label: {
      color: COLORS.text,
      fontSize: 14,
      marginBottom: 6,
      marginTop: 12,
      fontWeight: "600",
    },
    input: {
      width: "100%",
      minHeight: 48,
      borderWidth: 1,
      borderColor: COLORS.border || "#ccc",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: COLORS.card || "#fff",
      color: COLORS.text,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
  });

  return (
    <ScrollView
      testID="uploadCertificateScreen"
      contentContainerStyle={styles.container}
    >
      <Text testID="uploadCertificateTitle" style={styles.title}>
        Upload Birth Certificate
      </Text>
      <Text style={styles.text}>Upload clear certificate image</Text>

      <TouchableOpacity
        testID="chooseImageButton"
        style={styles.button}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          testID="selectedCertificateImage"
          source={{ uri: selectedImage.uri }}
          style={styles.image}
        />
      )}

      <TouchableOpacity
        testID="uploadExtractButton"
        style={styles.button}
        onPress={handleUpload}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Upload and Extract"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View testID="certificateForm" style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            testID="certificateNameInput"
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            testID="certificateDobInput"
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(text) => handleChange("dateOfBirth", text)}
          />

          <Text style={styles.label}>Serial No</Text>
          <TextInput
            testID="certificateSerialNoInput"
            style={styles.input}
            value={formData.serialNo}
            onChangeText={(text) => handleChange("serialNo", text)}
          />

          <Text style={styles.label}>Father Name</Text>
          <TextInput
            testID="certificateFatherNameInput"
            style={styles.input}
            value={formData.fatherName}
            onChangeText={(text) => handleChange("fatherName", text)}
          />

          <Text style={styles.label}>Mother Name</Text>
          <TextInput
            testID="certificateMotherNameInput"
            style={styles.input}
            value={formData.motherName}
            onChangeText={(text) => handleChange("motherName", text)}
          />

          <Text style={styles.label}>Place of Birth</Text>
          <TextInput
            testID="certificatePlaceOfBirthInput"
            style={styles.input}
            value={formData.placeOfBirth}
            onChangeText={(text) => handleChange("placeOfBirth", text)}
          />

          <Text style={styles.label}>District</Text>
          <TextInput
            testID="certificateDistrictInput"
            style={styles.input}
            value={formData.district}
            onChangeText={(text) => handleChange("district", text)}
          />

          <Text style={styles.label}>Sex</Text>
          <TextInput
            testID="certificateSexInput"
            style={styles.input}
            value={formData.sex}
            onChangeText={(text) => handleChange("sex", text)}
          />

          <Text style={styles.label}>Raw OCR Text</Text>
          <TextInput
            testID="certificateRawTextInput"
            style={[styles.input, styles.textArea]}
            multiline
            value={formData.rawText}
            onChangeText={(text) => handleChange("rawText", text)}
          />

          <TouchableOpacity
            testID="submitCertificateButton"
            style={styles.button}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Submit and Save"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
