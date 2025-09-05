import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: colors.offwhite,
  },
});

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.gray.dark,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: colors.gray.medium,
  },
});

export const photoGridStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  photoContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  photoNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary[500],
    marginBottom: 10,
  },
  photoWrapper: {
    position: "relative",
  },
  photoPreview: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  emptySlot: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray.light,
    borderStyle: "dashed",
  },
  retakeButton: {
    position: "absolute",
    bottom: -25,
    alignSelf: "center",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  retakeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});

export const audioStyles = StyleSheet.create({
  // Styles for AudioPlayer & AudioControls
  preview: {
    width: "100%",
    borderWidth: 4,
    borderColor: "#000",
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
  },
  previewText: {
    marginTop: 16,
    color: "#000",
    fontSize: 16,
    lineHeight: 1.4,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  controls: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
    width: "100%",
  },
  playButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#000",
    color: "#fff",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#fff",
    color: "#000",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const cameraStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: colors.transparent.black50,
    padding: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  counterOverlay: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: colors.transparent.black70,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  controlSpacer: {
    display: 'none',
  },
  shutterBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnOuter: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: colors.white,
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    backgroundColor: colors.white,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  controlBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const audioRecorderStyles = StyleSheet.create({
  // Styles for AudioRecorder
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60, // Adjust for safe area
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderColor: "#000",
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 16,
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
  },
  datePrompt: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  waveformContainer: {
    height: 120,
    borderWidth: 4,
    borderColor: "#000",
    backgroundColor: "#fff",
    flexDirection: "row-reverse",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  waveform: {
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    gap: 3,
    alignItems: "center",
    minWidth: 50,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  durationText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#000",
  },
  recordingDot: {
    width: 12,
    height: 12,
    backgroundColor: "#FF3B30",
    marginRight: 12,
  },
  statusText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  controlsContainer: {
    padding: 20,
    borderTopWidth: 4,
    borderColor: "#000",
  },
  controlButtonBase: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderWidth: 4,
    borderColor: "#000",
  },
  recordButton: {
    backgroundColor: "#000",
  },
  stopButton: {
    backgroundColor: "#FF3B30", // Red
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "#fff",
  },
  playPauseButton: {
    flex: 1,
    backgroundColor: "#fff",
  },
  completeButton: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export const actionButtonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.black,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  subtext: {
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
});

export const permissionStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: colors.gray.dark,
  },
});


export const mapCardStyles = StyleSheet.create({
  // Brutalist login-like container
  container: {
    margin: 20,
    marginBottom: 10,
    borderWidth: 2,           // thick border
    borderColor: "#000",      // harsh black outline
    backgroundColor: "#fff",  // flat white fill
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 }, // offset shadow for brutalist effect
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  mapContainer: {
    height: 200,
    position: "relative",
    borderBottomWidth: 2,     // brutal separation
    borderColor: "#000",
  },

  expandButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#000",  // solid black
    padding: 8,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    // no rounded corners → brutalist block
  },

  recenterButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#fff",  // inverted brutalist style
    padding: 10,
    width: 44,
    height: 44,
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
});


export const expandedMapStyles = StyleSheet.create({
    recenterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 20,
    zIndex: 1000,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1001,
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
  },
});

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
});

export const locationStatusStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  inside: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  outside: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    color: "#495057",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
    flex: 1,
  },
});

export const attendanceContainerStyles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  // Field trip styles
  fieldTripContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fieldTripGradient: {
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  fieldTripTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldTripText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
    lineHeight: 24,
  },
  fieldTripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
  },
  fieldTripDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export const dropdownStyles = {
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    zIndex: 1000,
  },
  selector: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 300,
    minWidth: 250,
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f8f9ff",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "500" as const,
  },
};
