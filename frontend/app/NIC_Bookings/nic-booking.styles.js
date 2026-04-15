import { Platform, StyleSheet } from "react-native";

export const COLORS = {
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
  orange: "#F97316",
  purple: "#8B5CF6",
  gradient: {
    start: "#3B82F6",
    end: "#8B5CF6",
  },
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardAvoid: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  
  // Header Styles
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: COLORS.card, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  headerButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: COLORS.borderLight, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerCenter: { alignItems: "center", flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  clearButton: { backgroundColor: '#FEE2E2' },
  
  // Service Selection Styles
  serviceContainer: { padding: 20 },
  serviceHeader: { alignItems: 'center', marginBottom: 32 },
  serviceTitle: { fontSize: 28, fontWeight: "700", color: COLORS.text, marginTop: 16, letterSpacing: -0.5 },
  serviceSubtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },
  serviceCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  serviceIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  serviceContent: { flex: 1 },
  serviceName: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  serviceDescription: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 20 },
  serviceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceBadgeText: { fontSize: 12, fontWeight: "600", color: COLORS.success },
  serviceInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.primaryLight, 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 20, 
    gap: 12 
  },
  serviceInfoText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  
  // Info/Warning Boxes
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.primaryLight, 
    padding: 14, 
    borderRadius: 14, 
    marginTop: 10, 
    gap: 10 
  },
  infoText: { flex: 1, fontSize: 14, color: COLORS.primaryDark, fontWeight: "500" },
  warningBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FEF3C7', 
    padding: 14, 
    borderRadius: 14, 
    marginBottom: 20, 
    gap: 10, 
    borderWidth: 1, 
    borderColor: COLORS.warning + '30' 
  },
  warningText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: "500" },
  
  // Progress Styles
  progressContainer: { 
    backgroundColor: COLORS.card, 
    paddingVertical: 24, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  progressSteps: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressStep: { alignItems: "center", flex: 1 },
  progressStepIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: COLORS.borderLight, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 10 
  },
  progressStepIconActive: { 
    backgroundColor: COLORS.primaryLight, 
    borderWidth: 2, 
    borderColor: COLORS.primary 
  },
  progressStepIconCompleted: { backgroundColor: COLORS.success },
  progressStepNumber: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  progressStepNumberActive: { color: COLORS.primary },
  progressStepTitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500", textAlign: "center" },
  progressStepTitleActive: { color: COLORS.text, fontWeight: "600" },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.borderLight, marginHorizontal: 8 },
  progressLineFill: { height: '100%', backgroundColor: COLORS.success },
  
  // Scroll Content
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  // Card Styles
  card: { 
    backgroundColor: COLORS.card, 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 8,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 3 
  },
  cardHeader: { flexDirection: "row", marginBottom: 28 },
  cardIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: COLORS.primaryLight, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 16 
  },
  cardHeaderText: { flex: 1, justifyContent: "center" },
  section: { fontSize: 20, fontWeight: "700", color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  sectionSubtext: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  
  // Form Styles
  formSection: { gap: 8 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  requiredStar: { color: COLORS.danger },
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.bg, 
    borderRadius: 14, 
    borderWidth: 1.5, 
    borderColor: COLORS.border, 
    paddingHorizontal: 16, 
    minHeight: 56 
  },
  inputWrapperMultiline: { alignItems: 'flex-start', minHeight: 100 },
  inputWrapperFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.card },
  inputWrapperError: { borderColor: COLORS.danger },
  inputIcon: { marginRight: 14, marginTop: 4 },
  input: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 14 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  hintText: { fontSize: 12, color: COLORS.textTertiary, marginTop: 6, marginLeft: 4 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 4, marginLeft: 4 },
  
  // Select Styles
  selectContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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
    minWidth: 100 
  },
  selectOptionActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  selectText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: "500" },
  selectTextActive: { color: COLORS.primary, fontWeight: "600" },
  checkIcon: { marginLeft: 8 },
  
  // Row Fields
  rowFields: { flexDirection: "row", gap: 14 },
  halfField: { flex: 1 },
  
  // Divider
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 14, fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  
  // AI Section Styles
  aiSection: { marginBottom: 28 },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  aiTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text, marginLeft: 10, marginRight: 10 },
  aiBadge: { backgroundColor: COLORS.warning + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  aiBadgeText: { fontSize: 12, color: COLORS.warning, fontWeight: "600" },
  aiBox: { 
    backgroundColor: COLORS.primaryLight, 
    borderRadius: 18, 
    borderWidth: 1.5, 
    borderColor: COLORS.primary + '30', 
    marginBottom: 14 
  },
  aiBoxSelected: { 
    borderColor: COLORS.success, 
    borderWidth: 2, 
    backgroundColor: COLORS.success + '10' 
  },
  aiTimeSlot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18 },
  aiTimeTitle: { fontSize: 17, fontWeight: "600", color: COLORS.text, marginBottom: 6 },
  aiTimeSubtext: { fontSize: 14, color: COLORS.textSecondary },
  
  // Manual Select
  manualSelectButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingVertical: 12 
  },
  manualSelectText: { fontSize: 15, color: COLORS.textSecondary },
  
  // Slot Picker
  slotPickerContainer: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16, 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  slotPickerHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  slotPickerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  slotList: { maxHeight: 300 },
  slotItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  slotItemSelected: { backgroundColor: COLORS.primaryLight, borderRadius: 8 },
  slotDate: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  slotTime: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  slotInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotCrowd: { fontSize: 12, fontWeight: '500' },
  noSlotsText: { textAlign: 'center', color: COLORS.textSecondary, padding: 20 },
  selectSlotButton: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  selectSlotText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  
  // Selected Slot Display
  selectedSlotDisplay: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 14, 
    padding: 14, 
    backgroundColor: COLORS.success + '10', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.success + '30' 
  },
  selectedSlotText: { fontSize: 14, color: COLORS.success, fontWeight: '500' },
  
  // Document Upload Styles
  documentSection: { marginTop: 8, marginBottom: 28 },
  uploadSection: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.bg, 
    borderRadius: 18, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderStyle: "dashed", 
    padding: 18, 
    marginBottom: 10 
  },
  uploadSectionCompleted: { 
    borderColor: COLORS.success, 
    borderStyle: 'solid', 
    backgroundColor: COLORS.success + '05' 
  },
  uploadIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: COLORS.primaryLight, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 18 
  },
  uploadContent: { flex: 1 },
  uploadTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 6 },
  uploadSubtext: { fontSize: 14, color: COLORS.textSecondary },
  directUploadButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.primary, 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    marginTop: 12, 
    gap: 10 
  },
  directUploadText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  
  // Uploaded Documents List
  uploadedDocsList: { marginTop: 16, padding: 16, backgroundColor: COLORS.bg, borderRadius: 12 },
  uploadedDocsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 14 },
  uploadedDocItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  uploadedDocInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  uploadedDocName: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  addMoreButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 14, 
    paddingVertical: 8 
  },
  addMoreText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  
  // Review Card
  reviewCard: { backgroundColor: COLORS.bg, borderRadius: 18, padding: 20, marginTop: 8 },
  reviewTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 20 },
  reviewSection: { marginBottom: 20 },
  reviewSectionTitle: { 
    fontSize: 13, 
    fontWeight: "700", 
    color: COLORS.textSecondary, 
    textTransform: "uppercase", 
    letterSpacing: 0.5, 
    marginBottom: 14 
  },
  reviewRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12,
    paddingVertical: 4,
  },
  reviewLabel: { fontSize: 15, color: COLORS.textSecondary },
  reviewValue: { fontSize: 16, color: COLORS.text, fontWeight: "600", maxWidth: '60%', textAlign: 'right' },
  reviewDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  editButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 14, 
    marginTop: 10, 
    gap: 10 
  },
  editButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: "600" },
  
  // Footer
  footer: { 
    flexDirection: "row", 
    padding: 20, 
    paddingBottom: Platform.OS === "ios" ? 34 : 20, 
    backgroundColor: COLORS.bg, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.borderLight, 
    gap: 14 
  },
  primaryBtn: { 
    flex: 1, 
    flexDirection: "row", 
    backgroundColor: COLORS.primary, 
    paddingVertical: 18, 
    paddingHorizontal: 24, 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  primaryBtnFull: { flex: 1 },
  submitBtn: { backgroundColor: COLORS.success, shadowColor: COLORS.success },
  secondaryBtn: { 
    flexDirection: "row", 
    paddingVertical: 18, 
    paddingHorizontal: 24, 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    backgroundColor: COLORS.borderLight 
  },
  primaryText: { color: "#FFF", fontWeight: "600", fontSize: 17 },
  secondaryText: { color: COLORS.text, fontWeight: "600", fontSize: 17 },
});