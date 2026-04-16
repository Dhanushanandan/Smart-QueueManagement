import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, styles } from "../../styles/nic-booking.styles";
import { pickDocumentWithType } from "../../utils/documentPicker";

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper functions
const formatMobileForDisplay = (mobile) => {
  if (!mobile) return "+94";
  if (mobile.startsWith("0")) return "+94" + mobile.substring(1);
  if (mobile.startsWith("+94")) return mobile;
  return "+94" + mobile;
};

const registrationInitialState = {
  fullName: "",
  fullNameLocal: "",
  dob: "",
  gender: "",
  mobile: "+94",
  address: "",
  district: "",
  ds: "",
  gn: "",
  birthNo: "",
  birthDate: "",
  citizenship: "",
  timeslot: "",
};

const renewalInitialState = {
  fullName: "",
  fullNameLocal: "",
  dob: "",
  gender: "",
  mobile: "+94",
  oldNicNumber: "",
  oldNicIssueDate: "",
  reason: "lost",
  policeStation: "",
  complaintNumber: "",
  complaintDate: "",
  address: "",
  district: "",
  ds: "",
  gn: "",
  birthNo: "",
  birthDate: "",
  timeslot: "",
  remarks: "",
};

// DateInput Component
const DateInput = memo(
  ({
    icon,
    label,
    value,
    onChange,
    required,
    focusedField,
    setFocusedField,
    minAge = 15,
  }) => {
    const [error, setError] = useState("");

    const formatDateInput = (text) => {
      let cleaned = text.replace(/\D/g, "");
      if (cleaned.length >= 5) {
        let day = cleaned.slice(0, 2),
          month = cleaned.slice(2, 4),
          year = cleaned.slice(4, 8);
        if (day.length === 2) {
          const dayNum = parseInt(day, 10);
          if (dayNum > 31) day = "31";
        }
        if (month.length === 2) {
          const monthNum = parseInt(month, 10);
          if (monthNum > 12) month = "12";
        }
        cleaned = day;
        if (month) cleaned += "/" + month;
        if (year) cleaned += "/" + year;
      } else if (cleaned.length >= 3) {
        let day = cleaned.slice(0, 2),
          month = cleaned.slice(2, 4);
        if (day.length === 2) {
          const dayNum = parseInt(day, 10);
          if (dayNum > 31) day = "31";
        }
        cleaned = day;
        if (month) cleaned += "/" + month;
      } else if (cleaned.length >= 2) {
        let day = cleaned.slice(0, 2);
        const dayNum = parseInt(day, 10);
        if (dayNum > 31) day = "31";
        cleaned = day;
      }
      return cleaned;
    };

    const calculateAge = (dateStr) => {
      const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return 0;
      const day = parseInt(match[1], 10),
        month = parseInt(match[2], 10),
        year = parseInt(match[3], 10);
      const birthDate = new Date(year, month - 1, day),
        today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      )
        age--;
      return age;
    };

    const validateDate = (dateStr) => {
      if (!dateStr) return true;
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateStr.match(regex);
      if (!match) {
        setError("Format: DD/MM/YYYY");
        return false;
      }
      const day = parseInt(match[1], 10),
        month = parseInt(match[2], 10),
        year = parseInt(match[3], 10);
      if (month < 1 || month > 12) {
        setError("Invalid month (1-12)");
        return false;
      }
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        setError(`Invalid day (1-${daysInMonth})`);
        return false;
      }
      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        setError("Date cannot be in future");
        return false;
      }
      const age = calculateAge(dateStr);
      if (age < minAge) {
        setError(`Must be at least ${minAge} years old (current age: ${age})`);
        return false;
      }
      if (year < 1900) {
        setError("Year must be after 1900");
        return false;
      }
      setError("");
      return true;
    };

    const handleChange = (text) => {
      const formatted = formatDateInput(text);
      onChange(formatted);
      if (formatted.length === 10) validateDate(formatted);
      else setError("");
    };

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === label && styles.inputWrapperFocused,
            error && styles.inputWrapperError,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              focusedField === label ? COLORS.primary : COLORS.textSecondary
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={COLORS.textTertiary}
            value={value}
            onChangeText={handleChange}
            keyboardType="numeric"
            onFocus={() => setFocusedField(label)}
            onBlur={() => {
              setFocusedField(null);
              if (value && value.length === 10) validateDate(value);
            }}
            maxLength={10}
          />
          {value !== "" && (
            <TouchableOpacity
              onPress={() => {
                onChange("");
                setError("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : value && value.length < 10 ? (
          <Text style={styles.hintText}>Keep typing: DD/MM/YYYY</Text>
        ) : value && value.length === 10 && !error ? (
          <Text style={[styles.hintText, { color: COLORS.success }]}>
            ✓ Valid date (Age: {calculateAge(value)})
          </Text>
        ) : (
          <Text style={styles.hintText}>Enter date as DD/MM/YYYY</Text>
        )}
      </View>
    );
  },
);

// PhoneInput Component
const PhoneInput = memo(
  ({
    icon,
    label,
    value,
    onChangeText,
    required,
    focusedField,
    setFocusedField,
  }) => {
    const [error, setError] = useState("");

    const validatePhone = (phone) => {
      if (!phone) return true;
      if (!/^\+94[0-9]{9}$/.test(phone)) {
        setError("Enter exactly 9 digits after +94");
        return false;
      }
      setError("");
      return true;
    };

    const handlePhoneChange = (text) => {
      if (!text.startsWith("+94")) text = "+94";
      let afterPrefix = text.slice(3).replace(/\D/g, "");
      if (afterPrefix.length > 9) afterPrefix = afterPrefix.slice(0, 9);
      const fullNumber = "+94" + afterPrefix;
      onChangeText(fullNumber);
      if (afterPrefix.length === 9) validatePhone(fullNumber);
      else
        setError(
          afterPrefix.length > 0
            ? `${9 - afterPrefix.length} more digit(s) needed`
            : "",
        );
    };

    const digitsCount = value ? value.slice(3).length : 0;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === label && styles.inputWrapperFocused,
            error &&
              digitsCount > 0 &&
              digitsCount < 9 &&
              styles.inputWrapperError,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={
              focusedField === label ? COLORS.primary : COLORS.textSecondary
            }
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="+94 77 123 4567"
            placeholderTextColor={COLORS.textTertiary}
            value={value}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            onFocus={() => setFocusedField(label)}
            onBlur={() => {
              setFocusedField(null);
              if (value) validatePhone(value);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            maxLength={12}
          />
          {value && value.length > 3 && (
            <TouchableOpacity
              onPress={() => {
                onChangeText("+94");
                setError("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && digitsCount > 0 && digitsCount < 9 ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : digitsCount === 9 && !error ? (
          <Text style={[styles.hintText, { color: COLORS.success }]}>
            ✓ Valid phone number
          </Text>
        ) : digitsCount === 0 ? (
          <Text style={styles.hintText}>Enter 9 digits after +94</Text>
        ) : digitsCount < 9 ? (
          <Text style={styles.hintText}>{digitsCount}/9 digits entered</Text>
        ) : null}
      </View>
    );
  },
);

// Input Component
const Input = memo(
  ({
    icon,
    label,
    value,
    onChangeText,
    keyboardType,
    required,
    focusedField,
    setFocusedField,
    multiline,
    numberOfLines,
    maxLength,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          focusedField === label && styles.inputWrapperFocused,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focusedField === label ? COLORS.primary : COLORS.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />
        {value !== "" && !multiline && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ),
);

// SelectInput Component
const SelectInput = memo(({ label, value, options, onChange, required }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>
      {label}
      {required && <Text style={styles.requiredStar}> *</Text>}
    </Text>
    <View style={styles.selectContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.selectOption,
            value === option && styles.selectOptionActive,
          ]}
          onPress={() => onChange(option)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectText,
              value === option && styles.selectTextActive,
            ]}
          >
            {option}
          </Text>
          {value === option && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={COLORS.primary}
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
));

// ProgressStep Component
const ProgressStep = memo(({ stepNumber, title, isActive, isCompleted }) => (
  <View style={styles.progressStep}>
    <View
      style={[
        styles.progressStepIcon,
        isActive && styles.progressStepIconActive,
        isCompleted && styles.progressStepIconCompleted,
      ]}
    >
      {isCompleted ? (
        <Ionicons name="checkmark" size={16} color="#FFF" />
      ) : (
        <Text
          style={[
            styles.progressStepNumber,
            isActive && styles.progressStepNumberActive,
          ]}
        >
          {stepNumber}
        </Text>
      )}
    </View>
    <Text
      style={[
        styles.progressStepTitle,
        isActive && styles.progressStepTitleActive,
      ]}
      numberOfLines={1}
    >
      {title}
    </Text>
  </View>
));

// ServiceSelectionScreen Component
const ServiceSelectionScreen = memo(({ onSelect }) => (
  <View style={styles.serviceContainer}>
    <View style={styles.serviceHeader}>
      <Ionicons name="card-outline" size={48} color={COLORS.primary} />
      <Text style={styles.serviceTitle}>NIC Services</Text>
      <Text style={styles.serviceSubtitle}>Select the service you need</Text>
    </View>
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onSelect("registration")}
      activeOpacity={0.8}
    >
      <View
        style={[styles.serviceIcon, { backgroundColor: COLORS.primaryLight }]}
      >
        <Ionicons name="person-add-outline" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>New NIC Registration</Text>
        <Text style={styles.serviceDescription}>
          Apply for your first National Identity Card
        </Text>
        <View style={styles.serviceBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.success} />
          <Text style={styles.serviceBadgeText}>First time applicants</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onSelect("renewal")}
      activeOpacity={0.8}
    >
      <View style={[styles.serviceIcon, { backgroundColor: "#FEF3C7" }]}>
        <Ionicons name="sync-outline" size={32} color={COLORS.warning} />
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>NIC Renewal / Replacement</Text>
        <Text style={styles.serviceDescription}>
          Replace lost, damaged, or stolen NIC
        </Text>
        <View style={styles.serviceBadge}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={COLORS.orange}
          />
          <Text style={[styles.serviceBadgeText, { color: COLORS.orange }]}>
            Lost/Damaged/Stolen
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
    </TouchableOpacity>
    <View style={styles.serviceInfo}>
      <Ionicons
        name="information-circle-outline"
        size={20}
        color={COLORS.textSecondary}
      />
      <Text style={styles.serviceInfoText}>
        Please bring required documents to your appointment
      </Text>
    </View>
  </View>
));

// Main Component
export default function NICBooking() {
  const params = useLocalSearchParams();
  const [serviceType, setServiceType] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(registrationInitialState);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [recommendedSlot, setRecommendedSlot] = useState(null);
  const [showManualSlotPicker, setShowManualSlotPicker] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isDocumentsUploaded, setIsDocumentsUploaded] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
        else if (params.userId) {
          setUserId(params.userId);
          await AsyncStorage.setItem("userId", params.userId);
        } else {
          const tempId = `user_${Date.now()}`;
          setUserId(tempId);
          await AsyncStorage.setItem("userId", tempId);
        }
      } catch (error) {
        const tempId = `user_${Date.now()}`;
        setUserId(tempId);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (
      (serviceType === "registration" && step === 3) ||
      (serviceType === "renewal" && step === 4)
    ) {
      if (userId) {
        loadTempData();
        loadRecommendedSlot();
      }
    }
  }, [step, userId, serviceType]);

  const handleServiceSelect = (type) => {
    setServiceType(type);
    setForm(
      type === "registration"
        ? { ...registrationInitialState, mobile: "+94" }
        : { ...renewalInitialState, mobile: "+94" },
    );
  };

  const updateField = useCallback(
    (key, value) => setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const clearAll = useCallback(() => {
    Alert.alert("Reset Form", "Are you sure you want to clear all fields?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => {
          setForm(
            serviceType === "registration"
              ? { ...registrationInitialState, mobile: "+94" }
              : { ...renewalInitialState, mobile: "+94" },
          );
          setUploadedDocuments([]);
          setIsDocumentsUploaded(false);
        },
      },
    ]);
  }, [serviceType]);

  const validatePhoneNumber = (phone) => /^\+94[0-9]{9}$/.test(phone);
  const validateDateFormat = (dateStr) =>
    !dateStr || /^(\d{2})\/(\d{2})\/(\d{4})$/.test(dateStr);

  const calculateAge = (dateStr) => {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return 0;
    const day = parseInt(match[1], 10),
      month = parseInt(match[2], 10),
      year = parseInt(match[3], 10);
    const birthDate = new Date(year, month - 1, day),
      today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const convertDateForAPI = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const loadTempData = async () => {
    try {
      const endpoint =
        serviceType === "registration" ? "temp-data" : "temp-renewal-data";
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/${endpoint}/${userId}`,
      );
      const result = await response.json();
      if (result.success && result.data) {
        setForm((prev) => ({
          ...prev,
          ...result.data,
          mobile: result.data.mobile
            ? formatMobileForDisplay(result.data.mobile)
            : "+94",
        }));
        if (result.data.documents) {
          setUploadedDocuments(result.data.documents);
          setIsDocumentsUploaded(true);
        }
      }
    } catch (error) {
      console.error("Error loading temp data:", error);
    }
  };

  const loadRecommendedSlot = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/recommended-slot/${userId}`,
      );
      const result = await response.json();
      if (result.success && result.data) setRecommendedSlot(result.data);
    } catch (error) {
      console.error("Error loading recommended slot:", error);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/available-slots`,
      );
      const result = await response.json();
      if (result.success && result.data) setAvailableSlots(result.data);
    } catch (error) {
      console.error("Error loading available slots:", error);
    }
  };

  const handleManualSlotSelect = (slot) => {
    updateField("timeslot", slot.fullSlot);
    setShowManualSlotPicker(false);
    Alert.alert(
      "✅ Time Slot Selected",
      `You have selected: ${slot.time} on ${slot.date}`,
    );
  };

  const handleDocumentUpload = () => {
    Alert.alert(
      "📄 Upload Required Document",
      "Select the type of document you want to upload",
      [
        {
          text: "📋 Birth Certificate",
          onPress: () => uploadDocumentWithPicker("birth_certificate"),
        },
        {
          text: "🆔 NIC / ID Card",
          onPress: () => uploadDocumentWithPicker("nic"),
        },
        {
          text: "🚔 Police Report",
          onPress: () => uploadDocumentWithPicker("police_report"),
        },
        {
          text: "📄 Other Document",
          onPress: () => uploadDocumentWithPicker("other_document"),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const uploadDocumentWithPicker = async (docType) => {
    const pickedDoc = await pickDocumentWithType(docType);
    if (!pickedDoc) {
      Alert.alert("⚠️ Cancelled", "Document upload was cancelled.");
      return;
    }

    const newDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: docType,
      name: pickedDoc.name || `${docType}_${Date.now()}.jpg`,
      uploadDate: pickedDoc.uploadDate || new Date().toISOString(),
      uri: pickedDoc.uri,
      mimeType: pickedDoc.type,
      size: pickedDoc.size,
      status: "uploaded",
    };
    setUploadedDocuments((prev) => [...prev, newDocument]);
    setIsDocumentsUploaded(true);
    Alert.alert(
      "✅ Document Uploaded",
      `${docType.replace(/_/g, " ")} has been uploaded successfully.`,
    );
  };

  const removeDocument = (docId) => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setUploadedDocuments((prev) =>
              prev.filter((doc) => doc.id !== docId),
            );
            if (uploadedDocuments.length <= 1) setIsDocumentsUploaded(false);
          },
        },
      ],
    );
  };

  const saveRegistrationStep1 = async () => {
    if (!form.fullName || form.fullName.trim().length < 3) {
      Alert.alert(
        "Validation Error",
        "Full name must be at least 3 characters",
      );
      return false;
    }
    if (!form.dob || !validateDateFormat(form.dob)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid date in DD/MM/YYYY format",
      );
      return false;
    }
    const age = calculateAge(form.dob);
    if (age < 15) {
      Alert.alert(
        "Validation Error",
        `Applicant must be at least 15 years old`,
      );
      return false;
    }
    if (!form.gender || !validatePhoneNumber(form.mobile)) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        fullNameLocal: form.fullNameLocal?.trim() || "",
        dob: convertDateForAPI(form.dob),
        gender: form.gender,
        mobile: form.mobile,
      };

      const response = await fetch(
        `${API_BASE_URL}/nic-booking/save-personal/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error || "Failed to save");
        return false;
      }
      return result.success;
    } catch (error) {
      Alert.alert("Connection Error", "Unable to connect to server.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveRegistrationStep2 = async () => {
    if (
      !form.address ||
      !form.district ||
      !form.ds ||
      !form.gn ||
      !form.birthNo ||
      !form.birthDate ||
      !form.citizenship
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        address: form.address.trim(),
        district: form.district.trim(),
        ds: form.ds.trim(),
        gn: form.gn.trim(),
        birthNo: form.birthNo.trim(),
        birthDate: convertDateForAPI(form.birthDate),
        citizenship: form.citizenship,
      };
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/save-verification/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error || "Failed to save");
        return false;
      }
      return result.success;
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveRenewalStep1 = async () => {
    if (!form.fullName || form.fullName.trim().length < 3) {
      Alert.alert(
        "Validation Error",
        "Full name must be at least 3 characters",
      );
      return false;
    }
    if (!form.dob || !validateDateFormat(form.dob)) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid date in DD/MM/YYYY format",
      );
      return false;
    }
    if (!form.gender || !validatePhoneNumber(form.mobile)) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return false;
    }
    if (!form.oldNicNumber || !form.reason) {
      Alert.alert(
        "Validation Error",
        "Please provide old NIC number and reason for renewal",
      );
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        fullNameLocal: form.fullNameLocal?.trim() || "",
        dob: convertDateForAPI(form.dob),
        gender: form.gender,
        mobile: form.mobile,
        oldNicNumber: form.oldNicNumber.trim(),
        oldNicIssueDate: convertDateForAPI(form.oldNicIssueDate),
        reason: form.reason,
      };

      const response = await fetch(
        `${API_BASE_URL}/nic-booking/save-renewal-step1/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error || "Failed to save");
        return false;
      }
      return result.success;
    } catch (error) {
      Alert.alert("Connection Error", "Unable to connect to server.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveRenewalStep2 = async () => {
    if (
      (form.reason === "lost" || form.reason === "stolen") &&
      (!form.policeStation || !form.complaintNumber || !form.complaintDate)
    ) {
      Alert.alert(
        "Validation Error",
        "Police report details are required for lost/stolen NIC",
      );
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        policeStation: form.policeStation?.trim() || "",
        complaintNumber: form.complaintNumber?.trim() || "",
        complaintDate: convertDateForAPI(form.complaintDate),
      };
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/save-renewal-step2/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error || "Failed to save");
        return false;
      }
      return result.success;
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveRenewalStep3 = async () => {
    if (
      !form.address ||
      !form.district ||
      !form.ds ||
      !form.gn ||
      !form.birthNo ||
      !form.birthDate
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        address: form.address.trim(),
        district: form.district.trim(),
        ds: form.ds.trim(),
        gn: form.gn.trim(),
        birthNo: form.birthNo.trim(),
        birthDate: convertDateForAPI(form.birthDate),
        remarks: form.remarks?.trim() || "",
      };
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/save-renewal-step3/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.error || "Failed to save");
        return false;
      }
      return result.success;
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    Keyboard.dismiss();
    if (serviceType === "registration") {
      if (step === 1) {
        const success = await saveRegistrationStep1();
        if (success) setStep(2);
      } else if (step === 2) {
        const success = await saveRegistrationStep2();
        if (success) setStep(3);
      }
    } else if (serviceType === "renewal") {
      if (step === 1) {
        const success = await saveRenewalStep1();
        if (success) setStep(2);
      } else if (step === 2) {
        const success = await saveRenewalStep2();
        if (success) setStep(3);
      } else if (step === 3) {
        const success = await saveRenewalStep3();
        if (success) setStep(4);
      }
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const prevStep = () => {
    Keyboard.dismiss();
    setStep((p) => Math.max(p - 1, 1));
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const submit = async () => {
    Keyboard.dismiss();
    const selectedSlot = form.timeslot || recommendedSlot?.fullSlot;
    if (!selectedSlot) {
      Alert.alert("⚠️ Time Slot Required", "Please select a time slot.");
      return;
    }
    if (!isDocumentsUploaded && uploadedDocuments.length === 0) {
      Alert.alert(
        "📄 Documents Required",
        "Please upload required documents.",
        [
          { text: "Upload Now", onPress: handleDocumentUpload },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        serviceType === "registration" ? "confirm" : "confirm-renewal";
      const docsForAPI = uploadedDocuments.map(
        ({ id, type, name, uploadDate, status }) => ({
          id,
          type,
          name,
          uploadDate,
          status,
        }),
      );
      const response = await fetch(
        `${API_BASE_URL}/nic-booking/${endpoint}/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timeslot: selectedSlot,
            documents: docsForAPI,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        await saveBookingToLocal(result.data, selectedSlot, docsForAPI);
        Alert.alert(
          "✅ Appointment Confirmed!",
          `Your appointment has been booked.\n\n📋 Booking ID: ${result.data.bookingId}\n🎫 Queue: ${result.data.queueNumber}`,
          [
            {
              text: "View My Bookings",
              onPress: () => router.push("/bookings"),
            },
            { text: "Done", style: "cancel" },
          ],
        );
      } else {
        Alert.alert("Error", result.error || "Failed to confirm booking");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveBookingToLocal = async (bookingData, timeslot, documents) => {
    try {
      const existingBookings = await AsyncStorage.getItem("upcomingBookings");
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      const newBooking = {
        id: bookingData.bookingId,
        serviceType,
        queueNumber: bookingData.queueNumber,
        timeslot,
        status: "confirmed",
        personalInfo: {
          fullName: form.fullName,
          dob: form.dob,
          mobile: form.mobile,
        },
        documents: documents.length,
        confirmedAt: new Date().toISOString(),
        createdAt: Date.now(),
      };
      bookings.unshift(newBooking);
      await AsyncStorage.setItem("upcomingBookings", JSON.stringify(bookings));
    } catch (error) {
      console.error("Error saving booking locally:", error);
    }
  };

  const getProgressSteps = () => {
    if (serviceType === "registration")
      return [
        { number: 1, title: "Basic Info" },
        { number: 2, title: "Verification" },
        { number: 3, title: "Confirm" },
      ];
    return [
      { number: 1, title: "Personal" },
      { number: 2, title: "Police Report" },
      { number: 3, title: "Address" },
      { number: 4, title: "Confirm" },
    ];
  };

  const getMaxSteps = () => (serviceType === "registration" ? 3 : 4);

  if (loading)
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );

  if (!serviceType) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>NIC Services</Text>
            <Text style={styles.subtitle}>Department of Registration</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ServiceSelectionScreen onSelect={handleServiceSelect} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progressSteps = getProgressSteps();
  const maxSteps = getMaxSteps();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Keyboard.dismiss();
              if (step === 1) setServiceType(null);
              else router.back();
            }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>
              {serviceType === "registration"
                ? "New NIC Registration"
                : "NIC Renewal"}
            </Text>
            <Text style={styles.subtitle}>
              {serviceType === "registration"
                ? "First time application"
                : "Lost/Damaged replacement"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.headerButton, styles.clearButton]}
            onPress={clearAll}
          >
            <Ionicons name="refresh-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            {progressSteps.map((s, index) => (
              <React.Fragment key={s.number}>
                <ProgressStep
                  stepNumber={s.number}
                  title={s.title}
                  isActive={step === s.number}
                  isCompleted={step > s.number}
                />
                {index < progressSteps.length - 1 && (
                  <View style={styles.progressLine}>
                    <View
                      style={[
                        styles.progressLineFill,
                        { width: step > s.number ? "100%" : "0%" },
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {serviceType === "registration" && (
            <>
              {step === 1 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="person"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Personal Information</Text>
                      <Text style={styles.sectionSubtext}>
                        Please provide your basic details
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <Input
                      icon="person-outline"
                      label="Full Name"
                      value={form.fullName}
                      onChangeText={(t) => updateField("fullName", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <Input
                      icon="language-outline"
                      label="Name in Sinhala/Tamil"
                      value={form.fullNameLocal}
                      onChangeText={(t) => updateField("fullNameLocal", t)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <DateInput
                      icon="calendar-outline"
                      label="Date of Birth"
                      value={form.dob}
                      onChange={(t) => updateField("dob", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      minAge={15}
                    />
                    <SelectInput
                      label="Gender"
                      value={form.gender}
                      onChange={(t) => updateField("gender", t)}
                      options={["Male", "Female", "Other"]}
                      required
                    />
                    <PhoneInput
                      icon="call-outline"
                      label="Mobile Number"
                      value={form.mobile}
                      onChangeText={(t) => updateField("mobile", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Identity Verification</Text>
                      <Text style={styles.sectionSubtext}>
                        Enter your address and document details
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <Input
                      icon="home-outline"
                      label="Permanent Address"
                      value={form.address}
                      onChangeText={(t) => updateField("address", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <View style={styles.rowFields}>
                      <View style={styles.halfField}>
                        <Input
                          icon="location-outline"
                          label="District"
                          value={form.district}
                          onChangeText={(t) => updateField("district", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                      <View style={styles.halfField}>
                        <Input
                          icon="navigate-outline"
                          label="DS Division"
                          value={form.ds}
                          onChangeText={(t) => updateField("ds", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                    </View>
                    <Input
                      icon="map-outline"
                      label="GN Division"
                      value={form.gn}
                      onChangeText={(t) => updateField("gn", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        Birth Certificate Details
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>
                    <View style={styles.rowFields}>
                      <View style={styles.halfField}>
                        <Input
                          icon="document-text-outline"
                          label="Certificate No."
                          value={form.birthNo}
                          onChangeText={(t) => updateField("birthNo", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                      <View style={styles.halfField}>
                        <DateInput
                          icon="calendar-outline"
                          label="Issue Date"
                          value={form.birthDate}
                          onChange={(t) => updateField("birthDate", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                          minAge={0}
                        />
                      </View>
                    </View>
                    <SelectInput
                      label="Citizenship Status"
                      value={form.citizenship}
                      onChange={(t) => updateField("citizenship", t)}
                      options={[
                        "Sri Lankan by Birth",
                        "Sri Lankan by Registration",
                        "Dual Citizen",
                      ]}
                      required
                    />
                  </View>
                </View>
              )}

              {step === 3 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Appointment & Review</Text>
                      <Text style={styles.sectionSubtext}>
                        Select time slot and upload documents
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <View style={styles.aiSection}>
                      <View style={styles.aiHeader}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={COLORS.warning}
                        />
                        <Text style={styles.aiTitle}>Select Time Slot</Text>
                      </View>
                      {recommendedSlot && (
                        <TouchableOpacity
                          style={[
                            styles.aiBox,
                            form.timeslot === recommendedSlot.fullSlot &&
                              styles.aiBoxSelected,
                          ]}
                          onPress={() =>
                            updateField("timeslot", recommendedSlot.fullSlot)
                          }
                        >
                          <View style={styles.aiTimeSlot}>
                            <View>
                              <Text style={styles.aiTimeTitle}>
                                Tomorrow, {recommendedSlot.time}
                              </Text>
                              <Text style={styles.aiTimeSubtext}>
                                {recommendedSlot.crowdLevel}
                              </Text>
                            </View>
                            {form.timeslot === recommendedSlot.fullSlot ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={COLORS.success}
                              />
                            ) : (
                              <View style={styles.selectSlotButton}>
                                <Text style={styles.selectSlotText}>
                                  Select
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.manualSelectButton}
                        onPress={() => {
                          loadAvailableSlots();
                          setShowManualSlotPicker(true);
                        }}
                      >
                        <Text style={styles.manualSelectText}>
                          Choose different time slot manually
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      {showManualSlotPicker && (
                        <View style={styles.slotPickerContainer}>
                          <View style={styles.slotPickerHeader}>
                            <Text style={styles.slotPickerTitle}>
                              Available Time Slots
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowManualSlotPicker(false)}
                            >
                              <Ionicons
                                name="close"
                                size={24}
                                color={COLORS.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                          <ScrollView style={styles.slotList}>
                            {availableSlots.length > 0 ? (
                              availableSlots.map((slot, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={[
                                    styles.slotItem,
                                    form.timeslot === slot.fullSlot &&
                                      styles.slotItemSelected,
                                  ]}
                                  onPress={() => handleManualSlotSelect(slot)}
                                >
                                  <View>
                                    <Text style={styles.slotDate}>
                                      {slot.date}
                                    </Text>
                                    <Text style={styles.slotTime}>
                                      {slot.time}
                                    </Text>
                                  </View>
                                  <View style={styles.slotInfo}>
                                    <Text
                                      style={[
                                        styles.slotCrowd,
                                        {
                                          color:
                                            slot.crowdLevel === "Less crowded"
                                              ? COLORS.success
                                              : COLORS.warning,
                                        },
                                      ]}
                                    >
                                      {slot.crowdLevel}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              ))
                            ) : (
                              <Text style={styles.noSlotsText}>Loading...</Text>
                            )}
                          </ScrollView>
                        </View>
                      )}
                      {form.timeslot && (
                        <View style={styles.selectedSlotDisplay}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={COLORS.success}
                          />
                          <Text style={styles.selectedSlotText}>
                            Selected: {form.timeslot}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.documentSection}>
                      <View style={styles.aiHeader}>
                        <Ionicons
                          name="document-text-outline"
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.aiTitle}>Required Documents</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.uploadSection,
                          isDocumentsUploaded && styles.uploadSectionCompleted,
                        ]}
                        onPress={handleDocumentUpload}
                      >
                        <View style={styles.uploadIcon}>
                          <Ionicons
                            name={
                              isDocumentsUploaded
                                ? "checkmark-circle"
                                : "cloud-upload-outline"
                            }
                            size={28}
                            color={
                              isDocumentsUploaded
                                ? COLORS.success
                                : COLORS.primary
                            }
                          />
                        </View>
                        <View style={styles.uploadContent}>
                          <Text style={styles.uploadTitle}>
                            {isDocumentsUploaded
                              ? "Documents Uploaded"
                              : "Upload Documents"}
                          </Text>
                          <Text style={styles.uploadSubtext}>
                            Birth certificate, photos (required)
                          </Text>
                        </View>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={28}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      {!isDocumentsUploaded && (
                        <TouchableOpacity
                          style={styles.directUploadButton}
                          onPress={handleDocumentUpload}
                        >
                          <Ionicons
                            name="cloud-upload"
                            size={20}
                            color="#FFF"
                          />
                          <Text style={styles.directUploadText}>
                            Click to Upload Required Documents
                          </Text>
                        </TouchableOpacity>
                      )}
                      {uploadedDocuments.length > 0 && (
                        <View style={styles.uploadedDocsList}>
                          <Text style={styles.uploadedDocsTitle}>
                            Uploaded Documents ({uploadedDocuments.length})
                          </Text>
                          {uploadedDocuments.map((doc) => (
                            <View key={doc.id} style={styles.uploadedDocItem}>
                              <View style={styles.uploadedDocInfo}>
                                <Ionicons
                                  name="document-text"
                                  size={18}
                                  color={COLORS.primary}
                                />
                                <Text style={styles.uploadedDocName}>
                                  {doc.type
                                    .split("_")
                                    .map(
                                      (w) =>
                                        w.charAt(0).toUpperCase() + w.slice(1),
                                    )
                                    .join(" ")}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => removeDocument(doc.id)}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color={COLORS.danger}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewTitle}>
                        Review Your Information
                      </Text>
                      <View style={styles.reviewSection}>
                        <Text style={styles.reviewSectionTitle}>
                          Personal Details
                        </Text>
                        {[
                          ["Full Name", form.fullName],
                          ["DOB", form.dob],
                          ["Gender", form.gender],
                          ["Mobile", form.mobile],
                        ].map(([l, v]) => (
                          <View style={styles.reviewRow} key={l}>
                            <Text style={styles.reviewLabel}>{l}</Text>
                            <Text style={styles.reviewValue}>{v || "—"}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.reviewDivider} />
                      <View style={styles.reviewSection}>
                        <Text style={styles.reviewSectionTitle}>Address</Text>
                        {[
                          ["Address", form.address],
                          ["District", form.district],
                          ["DS Division", form.ds],
                          ["GN Division", form.gn],
                          ["Birth Cert No.", form.birthNo],
                          ["Issue Date", form.birthDate],
                          ["Citizenship", form.citizenship],
                        ].map(([l, v]) => (
                          <View style={styles.reviewRow} key={l}>
                            <Text style={styles.reviewLabel}>{l}</Text>
                            <Text style={styles.reviewValue}>{v || "—"}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {serviceType === "renewal" && (
            <>
              {step === 1 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="person"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Personal Information</Text>
                      <Text style={styles.sectionSubtext}>
                        Please provide your basic details
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <Input
                      icon="person-outline"
                      label="Full Name"
                      value={form.fullName}
                      onChangeText={(t) => updateField("fullName", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <Input
                      icon="language-outline"
                      label="Name in Sinhala/Tamil"
                      value={form.fullNameLocal}
                      onChangeText={(t) => updateField("fullNameLocal", t)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <DateInput
                      icon="calendar-outline"
                      label="Date of Birth"
                      value={form.dob}
                      onChange={(t) => updateField("dob", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      minAge={15}
                    />
                    <SelectInput
                      label="Gender"
                      value={form.gender}
                      onChange={(t) => updateField("gender", t)}
                      options={["Male", "Female", "Other"]}
                      required
                    />
                    <PhoneInput
                      icon="call-outline"
                      label="Mobile Number"
                      value={form.mobile}
                      onChangeText={(t) => updateField("mobile", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>Old NIC Details</Text>
                      <View style={styles.dividerLine} />
                    </View>
                    <Input
                      icon="card-outline"
                      label="Old NIC Number"
                      value={form.oldNicNumber}
                      onChangeText={(t) => updateField("oldNicNumber", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <DateInput
                      icon="calendar-outline"
                      label="Old NIC Issue Date"
                      value={form.oldNicIssueDate}
                      onChange={(t) => updateField("oldNicIssueDate", t)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      minAge={0}
                    />
                    <SelectInput
                      label="Reason for Renewal"
                      value={form.reason}
                      onChange={(t) => updateField("reason", t)}
                      options={[
                        "lost",
                        "damaged",
                        "stolen",
                        "expired",
                        "information change",
                      ]}
                      required
                    />
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="shield-checkmark"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Police Report</Text>
                      <Text style={styles.sectionSubtext}>
                        Required for lost/stolen NIC
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    {form.reason === "lost" || form.reason === "stolen" ? (
                      <>
                        <Input
                          icon="business-outline"
                          label="Police Station"
                          value={form.policeStation}
                          onChangeText={(t) => updateField("policeStation", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                        <Input
                          icon="document-text-outline"
                          label="Complaint Number"
                          value={form.complaintNumber}
                          onChangeText={(t) =>
                            updateField("complaintNumber", t)
                          }
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                        <DateInput
                          icon="calendar-outline"
                          label="Complaint Date"
                          value={form.complaintDate}
                          onChange={(t) => updateField("complaintDate", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                          minAge={0}
                        />
                      </>
                    ) : (
                      <View style={styles.infoBox}>
                        <Ionicons
                          name="information-circle-outline"
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.infoText}>
                          Police report not required for {form.reason} renewal
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {step === 3 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="home" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Address & Documents</Text>
                      <Text style={styles.sectionSubtext}>
                        Enter your address and document details
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <Input
                      icon="home-outline"
                      label="Permanent Address"
                      value={form.address}
                      onChangeText={(t) => updateField("address", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <View style={styles.rowFields}>
                      <View style={styles.halfField}>
                        <Input
                          icon="location-outline"
                          label="District"
                          value={form.district}
                          onChangeText={(t) => updateField("district", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                      <View style={styles.halfField}>
                        <Input
                          icon="navigate-outline"
                          label="DS Division"
                          value={form.ds}
                          onChangeText={(t) => updateField("ds", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                    </View>
                    <Input
                      icon="map-outline"
                      label="GN Division"
                      value={form.gn}
                      onChangeText={(t) => updateField("gn", t)}
                      required
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        Birth Certificate Details
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>
                    <View style={styles.rowFields}>
                      <View style={styles.halfField}>
                        <Input
                          icon="document-text-outline"
                          label="Certificate No."
                          value={form.birthNo}
                          onChangeText={(t) => updateField("birthNo", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                        />
                      </View>
                      <View style={styles.halfField}>
                        <DateInput
                          icon="calendar-outline"
                          label="Issue Date"
                          value={form.birthDate}
                          onChange={(t) => updateField("birthDate", t)}
                          required
                          focusedField={focusedField}
                          setFocusedField={setFocusedField}
                          minAge={0}
                        />
                      </View>
                    </View>
                    <Input
                      icon="create-outline"
                      label="Additional Remarks"
                      value={form.remarks}
                      onChangeText={(t) => updateField("remarks", t)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              )}

              {step === 4 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.section}>Appointment & Review</Text>
                      <Text style={styles.sectionSubtext}>
                        Select time slot and upload documents
                      </Text>
                    </View>
                  </View>
                  <View style={styles.formSection}>
                    <View style={styles.aiSection}>
                      <View style={styles.aiHeader}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={COLORS.warning}
                        />
                        <Text style={styles.aiTitle}>Select Time Slot</Text>
                      </View>
                      {recommendedSlot && (
                        <TouchableOpacity
                          style={[
                            styles.aiBox,
                            form.timeslot === recommendedSlot.fullSlot &&
                              styles.aiBoxSelected,
                          ]}
                          onPress={() =>
                            updateField("timeslot", recommendedSlot.fullSlot)
                          }
                        >
                          <View style={styles.aiTimeSlot}>
                            <View>
                              <Text style={styles.aiTimeTitle}>
                                Tomorrow, {recommendedSlot.time}
                              </Text>
                              <Text style={styles.aiTimeSubtext}>
                                {recommendedSlot.crowdLevel}
                              </Text>
                            </View>
                            {form.timeslot === recommendedSlot.fullSlot ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={COLORS.success}
                              />
                            ) : (
                              <View style={styles.selectSlotButton}>
                                <Text style={styles.selectSlotText}>
                                  Select
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.manualSelectButton}
                        onPress={() => {
                          loadAvailableSlots();
                          setShowManualSlotPicker(true);
                        }}
                      >
                        <Text style={styles.manualSelectText}>
                          Choose different time slot manually
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      {showManualSlotPicker && (
                        <View style={styles.slotPickerContainer}>
                          <View style={styles.slotPickerHeader}>
                            <Text style={styles.slotPickerTitle}>
                              Available Time Slots
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowManualSlotPicker(false)}
                            >
                              <Ionicons
                                name="close"
                                size={24}
                                color={COLORS.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                          <ScrollView style={styles.slotList}>
                            {availableSlots.length > 0 ? (
                              availableSlots.map((slot, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={[
                                    styles.slotItem,
                                    form.timeslot === slot.fullSlot &&
                                      styles.slotItemSelected,
                                  ]}
                                  onPress={() => handleManualSlotSelect(slot)}
                                >
                                  <View>
                                    <Text style={styles.slotDate}>
                                      {slot.date}
                                    </Text>
                                    <Text style={styles.slotTime}>
                                      {slot.time}
                                    </Text>
                                  </View>
                                  <View style={styles.slotInfo}>
                                    <Text
                                      style={[
                                        styles.slotCrowd,
                                        {
                                          color:
                                            slot.crowdLevel === "Less crowded"
                                              ? COLORS.success
                                              : COLORS.warning,
                                        },
                                      ]}
                                    >
                                      {slot.crowdLevel}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              ))
                            ) : (
                              <Text style={styles.noSlotsText}>Loading...</Text>
                            )}
                          </ScrollView>
                        </View>
                      )}
                      {form.timeslot && (
                        <View style={styles.selectedSlotDisplay}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={COLORS.success}
                          />
                          <Text style={styles.selectedSlotText}>
                            Selected: {form.timeslot}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.documentSection}>
                      <View style={styles.aiHeader}>
                        <Ionicons
                          name="document-text-outline"
                          size={20}
                          color={COLORS.primary}
                        />
                        <Text style={styles.aiTitle}>Required Documents</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.uploadSection,
                          isDocumentsUploaded && styles.uploadSectionCompleted,
                        ]}
                        onPress={handleDocumentUpload}
                      >
                        <View style={styles.uploadIcon}>
                          <Ionicons
                            name={
                              isDocumentsUploaded
                                ? "checkmark-circle"
                                : "cloud-upload-outline"
                            }
                            size={28}
                            color={
                              isDocumentsUploaded
                                ? COLORS.success
                                : COLORS.primary
                            }
                          />
                        </View>
                        <View style={styles.uploadContent}>
                          <Text style={styles.uploadTitle}>
                            {isDocumentsUploaded
                              ? "Documents Uploaded"
                              : "Upload Documents"}
                          </Text>
                          <Text style={styles.uploadSubtext}>
                            Birth certificate, police report, photos
                          </Text>
                        </View>
                        <Ionicons
                          name="cloud-upload-outline"
                          size={28}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      {!isDocumentsUploaded && (
                        <TouchableOpacity
                          style={styles.directUploadButton}
                          onPress={handleDocumentUpload}
                        >
                          <Ionicons
                            name="cloud-upload"
                            size={20}
                            color="#FFF"
                          />
                          <Text style={styles.directUploadText}>
                            Click to Upload Required Documents
                          </Text>
                        </TouchableOpacity>
                      )}
                      {uploadedDocuments.length > 0 && (
                        <View style={styles.uploadedDocsList}>
                          <Text style={styles.uploadedDocsTitle}>
                            Uploaded Documents ({uploadedDocuments.length})
                          </Text>
                          {uploadedDocuments.map((doc) => (
                            <View key={doc.id} style={styles.uploadedDocItem}>
                              <View style={styles.uploadedDocInfo}>
                                <Ionicons
                                  name="document-text"
                                  size={18}
                                  color={COLORS.primary}
                                />
                                <Text style={styles.uploadedDocName}>
                                  {doc.type
                                    .split("_")
                                    .map(
                                      (w) =>
                                        w.charAt(0).toUpperCase() + w.slice(1),
                                    )
                                    .join(" ")}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => removeDocument(doc.id)}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color={COLORS.danger}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewTitle}>
                        Review Your Information
                      </Text>
                      <View style={styles.reviewSection}>
                        <Text style={styles.reviewSectionTitle}>
                          Personal Details
                        </Text>
                        {[
                          ["Full Name", form.fullName],
                          ["DOB", form.dob],
                          ["Gender", form.gender],
                          ["Mobile", form.mobile],
                        ].map(([l, v]) => (
                          <View style={styles.reviewRow} key={l}>
                            <Text style={styles.reviewLabel}>{l}</Text>
                            <Text style={styles.reviewValue}>{v || "—"}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.reviewDivider} />
                      <View style={styles.reviewSection}>
                        <Text style={styles.reviewSectionTitle}>
                          Old NIC Details
                        </Text>
                        {[
                          ["Old NIC No.", form.oldNicNumber],
                          ["Issue Date", form.oldNicIssueDate],
                          ["Reason", form.reason],
                        ].map(([l, v]) => (
                          <View style={styles.reviewRow} key={l}>
                            <Text style={styles.reviewLabel}>{l}</Text>
                            <Text style={styles.reviewValue}>{v || "—"}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.reviewDivider} />
                      <View style={styles.reviewSection}>
                        <Text style={styles.reviewSectionTitle}>Address</Text>
                        {[
                          ["Address", form.address],
                          ["District", form.district],
                          ["DS Division", form.ds],
                          ["GN Division", form.gn],
                          ["Birth Cert No.", form.birthNo],
                          ["Issue Date", form.birthDate],
                        ].map(([l, v]) => (
                          <View style={styles.reviewRow} key={l}>
                            <Text style={styles.reviewLabel}>{l}</Text>
                            <Text style={styles.reviewValue}>{v || "—"}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={prevStep}>
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.secondaryText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < maxSteps ? (
            <TouchableOpacity
              style={[styles.primaryBtn, step === 1 && styles.primaryBtnFull]}
              onPress={nextStep}
            >
              <Text style={styles.primaryText}>Continue</Text>
              <Ionicons name="arrow-forward-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, styles.submitBtn]}
              onPress={submit}
            >
              <Text style={styles.primaryText}>Confirm Booking</Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
