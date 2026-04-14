import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/* 🎨 MODERN COLOR PALETTE */
const COLORS = {
  bg: "#F9FAFB",
  card: "#FFFFFF",
  primary: "#3B82F6",
  primaryLight: "#EFF6FF",
  primaryDark: "#1D4ED8",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  gradient: {
    start: "#3B82F6",
    end: "#8B5CF6",
  },
};

/* 📦 STATE */
const initialState = {
  // BASIC
  fullName: "",
  fullNameLocal: "",
  dob: "",
  gender: "",
  mobile: "",

  // INTERMEDIATE
  address: "",
  district: "",
  ds: "",
  gn: "",
  birthNo: "",
  birthDate: "",
  citizenship: "",

  // ADVANCED
  timeslot: "",
};

export default function NICBooking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [focusedField, setFocusedField] = useState(null);

  const updateField = (key, value) =>
    setForm({ ...form, [key]: value });

  const clearAll = () => {
    Alert.alert("Reset Form", "Are you sure you want to clear all fields?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Clear All", 
        style: "destructive",
        onPress: () => setForm(initialState) 
      },
    ]);
  };

  const nextStep = () => setStep((p) => Math.min(p + 1, 3));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  const submit = () => {
    Alert.alert(
      "Appointment Confirmed! 🎉",
      "Your NIC appointment has been successfully booked. You will receive a confirmation SMS shortly.",
      [
        { 
          text: "View Appointments", 
          onPress: () => router.back() 
        },
        { 
          text: "Done", 
          style: "cancel" 
        },
      ]
    );
  };

  /* 🔤 MODERN INPUT COMPONENT */
  const Input = ({ icon, label, value, onChangeText, keyboardType, required }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View style={[
        styles.inputWrapper,
        focusedField === label && styles.inputWrapperFocused
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={focusedField === label ? COLORS.primary : COLORS.textSecondary} 
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
        />
        {value !== "" && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /* 🔘 MODERN SELECT COMPONENT */
  const SelectInput = ({ label, value, options, onChange, required }) => (
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
  );

  /* 📊 PROGRESS STEP INDICATOR */
  const ProgressStep = ({ stepNumber, title, isActive, isCompleted }) => (
    <View style={styles.progressStep}>
      <View style={[
        styles.progressStepIcon,
        isActive && styles.progressStepIconActive,
        isCompleted && styles.progressStepIconCompleted
      ]}>
        {isCompleted ? (
          <Ionicons name="checkmark" size={16} color="#FFF" />
        ) : (
          <Text style={[
            styles.progressStepNumber,
            isActive && styles.progressStepNumberActive
          ]}>
            {stepNumber}
          </Text>
        )}
      </View>
      <Text style={[
        styles.progressStepTitle,
        isActive && styles.progressStepTitleActive
      ]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* MODERN HEADER */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title}>NIC Registration</Text>
              <Text style={styles.subtitle}>Book your appointment</Text>
            </View>

            <TouchableOpacity 
              style={[styles.headerButton, styles.clearButton]}
              onPress={clearAll}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          {/* MODERN PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
              <ProgressStep 
                stepNumber={1}
                title="Basic Info"
                isActive={step === 1}
                isCompleted={step > 1}
              />
              <View style={styles.progressLine}>
                <View style={[
                  styles.progressLineFill,
                  { width: step > 1 ? '100%' : '0%' }
                ]} />
              </View>
              <ProgressStep 
                stepNumber={2}
                title="Verification"
                isActive={step === 2}
                isCompleted={step > 2}
              />
              <View style={styles.progressLine}>
                <View style={[
                  styles.progressLineFill,
                  { width: step > 2 ? '100%' : '0%' }
                ]} />
              </View>
              <ProgressStep 
                stepNumber={3}
                title="Confirm"
                isActive={step === 3}
                isCompleted={false}
              />
            </View>
          </View>

          {/* FORM CONTENT */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* STEP 1 - BASIC INFORMATION */}
            {step === 1 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="person" size={24} color={COLORS.primary} />
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
                  />

                  <Input
                    icon="language-outline"
                    label="Name in Sinhala/Tamil"
                    value={form.fullNameLocal}
                    onChangeText={(t) => updateField("fullNameLocal", t)}
                  />

                  <Input
                    icon="calendar-outline"
                    label="Date of Birth"
                    value={form.dob}
                    onChangeText={(t) => updateField("dob", t)}
                    required
                  />

                  <SelectInput
                    label="Gender"
                    value={form.gender}
                    onChange={(t) => updateField("gender", t)}
                    options={["Male", "Female", "Other"]}
                    required
                  />

                  <Input
                    icon="call-outline"
                    label="Mobile Number"
                    value={form.mobile}
                    onChangeText={(t) => updateField("mobile", t)}
                    keyboardType="phone-pad"
                    required
                  />
                </View>
              </View>
            )}

            {/* STEP 2 - IDENTITY VERIFICATION */}
            {step === 2 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
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
                  />

                  <View style={styles.rowFields}>
                    <View style={styles.halfField}>
                      <Input
                        icon="location-outline"
                        label="District"
                        value={form.district}
                        onChangeText={(t) => updateField("district", t)}
                        required
                      />
                    </View>
                    <View style={styles.halfField}>
                      <Input
                        icon="navigate-outline"
                        label="DS Division"
                        value={form.ds}
                        onChangeText={(t) => updateField("ds", t)}
                        required
                      />
                    </View>
                  </View>

                  <Input
                    icon="map-outline"
                    label="GN Division"
                    value={form.gn}
                    onChangeText={(t) => updateField("gn", t)}
                    required
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Birth Certificate Details</Text>
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
                      />
                    </View>
                    <View style={styles.halfField}>
                      <Input
                        icon="calendar-outline"
                        label="Issue Date"
                        value={form.birthDate}
                        onChangeText={(t) => updateField("birthDate", t)}
                        required
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

            {/* STEP 3 - APPOINTMENT & REVIEW */}
            {step === 3 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="calendar" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.section}>Appointment & Review</Text>
                    <Text style={styles.sectionSubtext}>
                      Select time slot and verify your information
                    </Text>
                  </View>
                </View>

                <View style={styles.formSection}>
                  {/* AI RECOMMENDED SLOT */}
                  <View style={styles.aiSection}>
                    <View style={styles.aiHeader}>
                      <Ionicons name="sparkles" size={20} color={COLORS.warning} />
                      <Text style={styles.aiTitle}>AI Recommended Slot</Text>
                      <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>Best Match</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.aiBox} activeOpacity={0.8}>
                      <View style={styles.aiTimeSlot}>
                        <View>
                          <Text style={styles.aiTimeTitle}>Tomorrow, 10:30 AM</Text>
                          <Text style={styles.aiTimeSubtext}>
                            Less crowded • Faster processing
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manualSelectButton}>
                      <Text style={styles.manualSelectText}>
                        Choose different time slot manually
                      </Text>
                      <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* DOCUMENT UPLOAD */}
                  <TouchableOpacity style={styles.uploadSection} activeOpacity={0.7}>
                    <View style={styles.uploadIcon}>
                      <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
                    </View>
                    <View style={styles.uploadContent}>
                      <Text style={styles.uploadTitle}>Upload Documents</Text>
                      <Text style={styles.uploadSubtext}>
                        Birth certificate, NIC (if available)
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>

                  {/* REVIEW SUMMARY */}
                  <View style={styles.reviewCard}>
                    <Text style={styles.reviewTitle}>Review Your Information</Text>
                    
                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Personal Details</Text>
                      {[
                        ["Full Name", form.fullName],
                        ["Date of Birth", form.dob],
                        ["Gender", form.gender],
                        ["Mobile", form.mobile],
                      ].map(([label, value]) => (
                        <View style={styles.reviewRow} key={label}>
                          <Text style={styles.reviewLabel}>{label}</Text>
                          <Text style={styles.reviewValue}>{value || "—"}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.reviewDivider} />

                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Address & Documents</Text>
                      {[
                        ["District", form.district],
                        ["DS Division", form.ds],
                        ["GN Division", form.gn],
                        ["Citizenship", form.citizenship],
                      ].map(([label, value]) => (
                        <View style={styles.reviewRow} key={label}>
                          <Text style={styles.reviewLabel}>{label}</Text>
                          <Text style={styles.reviewValue}>{value || "—"}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => setStep(1)}
                    >
                      <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.editButtonText}>Edit Information</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* MODERN FOOTER */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={prevStep}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
                <Text style={styles.secondaryText}>Back</Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity 
                style={[styles.primaryBtn, step === 1 && styles.primaryBtnFull]} 
                onPress={nextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryText}>Continue</Text>
                <Ionicons name="arrow-forward-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.primaryBtn, styles.submitBtn]} 
                onPress={submit}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryText}>Confirm</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* 🎨 MODERN STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.bg,
  },

  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bg,
  },

  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    width: '100%',
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    alignItems: "center",
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  clearButton: {
    backgroundColor: '#FEE2E2',
  },

  // PROGRESS
  progressContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    width: '100%',
  },

  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: '100%',
  },

  progressStep: {
    alignItems: "center",
    flex: 1,
    minWidth: 70,
  },

  progressStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  progressStepIconActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  progressStepIconCompleted: {
    backgroundColor: COLORS.success,
  },

  progressStepNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  progressStepNumberActive: {
    color: COLORS.primary,
  },

  progressStepTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },

  progressStepTitleActive: {
    color: COLORS.text,
    fontWeight: "600",
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
    position: 'relative',
  },

  progressLineFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },

  // SCROLL CONTENT
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
    width: '100%',
  },

  // CARDS
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },

  cardHeader: {
    flexDirection: "row",
    marginBottom: 28,
    width: '100%',
  },

  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  cardHeaderText: {
    flex: 1,
    justifyContent: "center",
  },

  section: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  sectionSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  formSection: {
    gap: 8,
    width: '100%',
  },

  // INPUT GROUPS
  inputGroup: {
    marginBottom: 24,
    width: '100%',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },

  requiredStar: {
    color: COLORS.danger,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
    width: '100%',
  },

  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inputIcon: {
    marginRight: 14,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 14,
  },

  // SELECT
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: '100%',
  },

  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flex: 1,
    minWidth: 100,
  },

  selectOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },

  selectText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  selectTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  checkIcon: {
    marginLeft: 8,
  },

  // ROW FIELDS
  rowFields: {
    flexDirection: "row",
    gap: 14,
    width: '100%',
  },

  halfField: {
    flex: 1,
  },

  // DIVIDER
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
    width: '100%',
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    marginHorizontal: 14,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  // AI SECTION
  aiSection: {
    marginBottom: 28,
    width: '100%',
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    width: '100%',
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 10,
    marginRight: 10,
  },

  aiBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  aiBadgeText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "600",
  },

  aiBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    marginBottom: 14,
    width: '100%',
  },

  aiTimeSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    width: '100%',
  },

  aiTimeTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },

  aiTimeSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  manualSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    width: '100%',
  },

  manualSelectText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // UPLOAD SECTION
  uploadSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 18,
    marginBottom: 28,
    width: '100%',
  },

  uploadIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  uploadContent: {
    flex: 1,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },

  uploadSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // REVIEW CARD
  reviewCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 20,
    width: '100%',
  },

  reviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },

  reviewSection: {
    marginBottom: 20,
    width: '100%',
  },

  reviewSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },

  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: '100%',
  },

  reviewLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  reviewValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
  },

  reviewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
    width: '100%',
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 10,
    gap: 10,
    width: '100%',
  },

  editButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // FOOTER
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 14,
    width: '100%',
  },

  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  primaryBtnFull: {
    flex: 1,
  },

  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
  },

  secondaryBtn: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  primaryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 17,
  },

  secondaryText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 17,
  },
});