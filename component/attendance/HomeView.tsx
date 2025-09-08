// component/attendance/HomeView.tsx (Add validation status display)
import { useGeofence } from "@/hooks/useGeofence";
import {
  attendanceValidation,
  ValidationResult,
} from "@/services/attendanceValidationService";
// ... (keep existing imports)
import { colors } from "@/constants/colors";
import { checkoutAttendance } from "@/services/attendanceService";
import { useAuthStore } from "@/store/authStore";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAttendanceStore } from "../../store/attendanceStore";
import { AudioRecording } from "../../types/attendance";
import { ActionButtons } from "./ActionButton";
import { AudioSection } from "./AudioSection";
import { PhotoGrid } from "./PhotoGrid";

interface HomeViewProps {
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  onTakePhotos: () => void;
  onRetakePhoto: (index: number) => void;
  onRetakeAll: () => void;
  onRecordAudio: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
  todayAttendanceMarked?: boolean;
}

const brutalistColors = {
  black: "#000000",
  white: "#FFFFFF",
  error: "#dc2626",
  errorBg: "#fecaca", // Light red for error backgrounds
  success: "#16a34a",
  warning: "#f97316",
  gray: "#a1a1aa",
  lightGray: "#f4f4f5",
};

// New Brutalist Validation Error Card Component
function ValidationErrorCard({ reason }: { reason: string }) {
  return (
    <View style={styles.validationErrorCard}>
      <FontAwesome6 name="question-circle" size={20} color={brutalistColors.error} />
      <Text style={styles.validationErrorText}>{reason}</Text>
    </View>
  );
}

// New Brutalist Location Status Card Component
function LocationStatusCard({
  details,
  department,
  userLocationType,
}: {
  details: ValidationResult["details"];
  department: string | null;
  userLocationType: "CAMPUS" | "FIELDTRIP" | null;
}) {
  if (!details) return null;

  return (
    <View style={styles.locationStatusCard}>
      {/* Session Status */}
      <View style={styles.statusRow}>
        <FontAwesome6
          name="clock"
          size={16}
          color={
            details.isWithinWorkingHours
              ? brutalistColors.black
              : brutalistColors.error
          }
        />
        <Text
          style={[
            styles.statusText,
            !details.isWithinWorkingHours && { color: brutalistColors.error },
          ]}
        >
          {details.currentSession === "OUTSIDE"
            ? "Outside Working Hours"
            : `${details.currentSession} Session`}
        </Text>
      </View>

      {/* Campus & Department Status (only for CAMPUS user) */}
      {userLocationType === "CAMPUS" && (
        <>
          <View style={styles.statusRow}>
            <FontAwesome6
              name="university"
              size={16}
              color={details.isInsideIIT ? brutalistColors.black : brutalistColors.error}
            />
            <Text
              style={[
                styles.statusText,
                !details.isInsideIIT && { color: brutalistColors.error },
              ]}
            >
              {details.isInsideIIT
                ? "Inside IIT Guwahati"
                : "Outside IIT Guwahati"}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <FontAwesome6
              name="building"
              size={16}
              color={
                details.isInsideDepartment
                  ? brutalistColors.black
                  : brutalistColors.error
              }
            />
            <Text
              style={[
                styles.statusText,
                !details.isInsideDepartment && { color: brutalistColors.error },
              ]}
            >
              {details.isInsideDepartment
                ? `Inside ${department}`
                : `Outside ${department}`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

function SessionTimeIndicator() {
  const [currentSession, setCurrentSession] = useState<
    "FORENOON" | "AFTERNOON" | "OUTSIDE"
  >("OUTSIDE");

  useEffect(() => {
    const updateSession = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      if (timeInMinutes >= 570 && timeInMinutes < 780) {
        setCurrentSession("FORENOON");
      } else if (timeInMinutes >= 780 && timeInMinutes <= 1050) {
        setCurrentSession("AFTERNOON");
      } else {
        setCurrentSession("OUTSIDE");
      }
    };

    updateSession();
    const interval = setInterval(updateSession, 60000);

    return () => clearInterval(interval);
  }, []);

  const getSessionColor = () => {
    switch (currentSession) {
      case "FORENOON":
        return brutalistColors.black;
      case "AFTERNOON":
        return brutalistColors.black;
      default:
        return colors.black;
    }
  };

  const getSessionText = () => {
    switch (currentSession) {
      case "FORENOON":
        return "Forenoon Session";
      case "AFTERNOON":
        return "Afternoon Session";
      default:
        return "Outside Working Hours";
    }
  };

  return (
    <View style={[styles.sessionIndicator, { borderColor: getSessionColor() }]}>
      <FontAwesome6 name="clock" size={14} color={getSessionColor()} />
      <Text style={[styles.sessionText, { color: getSessionColor() }]}>
        {getSessionText()}
      </Text>
    </View>
  );
}

function CheckoutButton({
  onCheckout,
  disabled,
  isCheckedOut = false,
}: {
  onCheckout: () => void;
  disabled: boolean;
  isCheckedOut?: boolean;
}) {
  const currentHour = new Date().getHours();
  const isAfter11PM = currentHour >= 23;

  const isButtonDisabled = isCheckedOut || isAfter11PM || disabled;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.checkoutButton,
        isButtonDisabled && styles.buttonDisabled,
        {
          transform:
            pressed && !isButtonDisabled
              ? [{ translateX: 5 }, { translateY: 5 }]
              : [],
          shadowColor: isButtonDisabled
            ? brutalistColors.gray
            : brutalistColors.error,
        },
      ]}
      onPress={onCheckout}
      disabled={isButtonDisabled}
    >
      <FontAwesome6
        name={isButtonDisabled ? "check" : "right-from-bracket"}
        size={20}
        color={isButtonDisabled ? brutalistColors.gray : brutalistColors.error}
      />
      <Text
        style={[
          styles.checkoutButtonText,
          {
            color: isButtonDisabled
              ? brutalistColors.gray
              : brutalistColors.error,
          },
        ]}
      >
        {isCheckedOut ? "Done" : isAfter11PM ? "Auto-completed" : "Checkout"}
      </Text>
    </Pressable>
  );
}

function AttendanceStatusCard({ attendance }: { attendance: any }) {
  const currentHour = new Date().getHours();
  const shouldShowAsPresent = currentHour >= 23 && !attendance.isCheckedOut;

  const getAttendanceTypeColor = () => {
    if (!attendance.isCheckedOut && !shouldShowAsPresent)
      return brutalistColors.warning;
    return attendance.attendanceType === "FULL_DAY"
      ? brutalistColors.success
      : brutalistColors.black;
  };

  const getStatusText = () => {
    if (!attendance.isCheckedOut && !shouldShowAsPresent) {
      const sessionText =
        attendance.sessionType === "FORENOON"
          ? "Forenoon"
          : attendance.sessionType === "AFTERNOON"
          ? "Afternoon"
          : "Unknown";
      return `Checked in - ${sessionText} Session`;
    }

    if (shouldShowAsPresent && !attendance.isCheckedOut) {
      return "Present (Auto-completed at 11 PM)";
    }

    return `${
      attendance.attendanceType === "FULL_DAY" ? "Full Day" : "Half Day"
    } Completed`;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Invalid Date";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <View
      style={[styles.statusCard, { borderColor: getAttendanceTypeColor() }]}
    >
      <View style={styles.statusHeader}>
        <FontAwesome6
          name={
            attendance.isCheckedOut || shouldShowAsPresent
              ? "check-circle"
              : "clock"
          }
          size={20}
          color={getAttendanceTypeColor()}
        />
        <Text style={[styles.statusTitle, { color: getAttendanceTypeColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      <View style={styles.statusDetails}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Check-in:</Text>
          <Text style={styles.statusValue}>
            {formatTime(attendance.checkInTime)}
          </Text>
        </View>
        {attendance.checkOutTime && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Check-out:</Text>
            <Text style={styles.statusValue}>
              {formatTime(attendance.checkOutTime)}
            </Text>
          </View>
        )}
        {shouldShowAsPresent && !attendance.checkOutTime && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Auto-completed:</Text>
            <Text style={styles.statusValue}>11:00 PM</Text>
          </View>
        )}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Location:</Text>
          <Text style={styles.statusValue}>
            {attendance.takenLocation || "N/A"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AttendanceMarkedCard({
  todayRecord,
  onCheckout,
}: {
  todayRecord: any;
  onCheckout: () => void;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(150).springify()}
      style={styles.attendanceMarkedCard}
    >
      <View style={styles.attendanceMarkedContent}>
        <View style={styles.attendanceMarkedIcon}>
          <FontAwesome6
            name="circle-check"
            size={32}
            color={brutalistColors.black}
          />
        </View>
        <View style={styles.attendanceMarkedText}>
          <Text style={styles.attendanceMarkedTitle}>ATTENDANCE MARKED!</Text>
          <Text style={styles.attendanceMarkedSubtitle}>
            You&apos;ve already marked your attendance for today
          </Text>
          <Text style={styles.attendanceMarkedTime}>
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Session Time Indicator */}
      <SessionTimeIndicator />

      {/* Attendance Status */}
      {todayRecord && <AttendanceStatusCard attendance={todayRecord} />}

      {/* Checkout Button */}
      {todayRecord && (
        <CheckoutButton
          onCheckout={onCheckout}
          disabled={false}
          isCheckedOut={todayRecord.isCheckedOut}
        />
      )}
    </Animated.View>
  );
}

export function HomeView({
  photos,
  audioRecording,
  onTakePhotos,
  onRetakePhoto,
  onRetakeAll,
  onRecordAudio,
  onUpload,
  uploading,
  totalPhotos,
  todayAttendanceMarked = false,
}: HomeViewProps) {
  const { userLocationType, department } = useAttendanceStore();
  const geofence = useGeofence(userLocationType);
  const [validationStatus, setValidationStatus] =
    useState<ValidationResult | null>(null);

  // Check validation status periodically
  useEffect(() => {
    const checkValidation = () => {
      if (geofence.userPos && department) {
        const validation = attendanceValidation.validateAttendance(
          geofence.userPos,
          department,
          userLocationType
        );
        setValidationStatus(validation);
      }
    };

    checkValidation();
    const interval = setInterval(checkValidation, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [geofence.userPos, department, userLocationType]);

  const attendanceRecords = useAttendanceStore(
    (state) => state.attendanceRecords
  );

  const todayDateString = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceRecords.find(
    (record) => record.date === todayDateString
  );

  useEffect(() => {
    const refreshAttendanceStatus = async () => {
      if (useAttendanceStore.getState().userId) {
        await useAttendanceStore.getState().fetchTodayAttendanceFromServer();
      }
    };
    refreshAttendanceStatus();
  }, []);

  // In component/attendance/HomeView.tsx, update handleCheckout:
  const handleCheckout = async () => {
    Alert.alert(
      "CHECKOUT CONFIRMATION",
      "Are you sure you want to checkout? This will complete your attendance for today.",
      [
        { text: "CANCEL", style: "cancel" },
        {
          text: "CHECKOUT",
          onPress: async () => {
            try {
              const { employeeNumber } = useAuthStore.getState(); // Changed from userName
              if (!employeeNumber) {
                Alert.alert("Error", "Please login to checkout");
                return;
              }
              const result = await checkoutAttendance(employeeNumber); // Pass employeeNumber
              if (result.success) {
                Alert.alert("Success", "Checkout successful!");
                await useAttendanceStore
                  .getState()
                  .fetchTodayAttendanceFromServer();
              } else {
                Alert.alert("Error", result.error || "Checkout failed");
              }
            } catch (error) {
              console.error("Checkout failed:", error);
              Alert.alert("Error", "Failed to checkout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Invalid Date";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (todayAttendanceMarked && todayRecord) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.headerCard}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>GOOD {getTimeOfDay()}!</Text>
              <Text style={styles.headerTitle}>ATTENDANCE STATUS</Text>
              <Text style={styles.headerSubtitle}>
                {userLocationType === "FIELDTRIP"
                  ? "📍 OUTSIDE IIT (FIELD TRIP)"
                  : "📍 IIT GUWAHATI - DEPARTMENT BUILDING"}
              </Text>
              <View style={styles.locationTypeBadge}>
                <Text style={styles.locationTypeText}>
                  MODE:{" "}
                  {userLocationType === "FIELDTRIP" ? "FIELD TRIP" : "ABSOLUTE"}
                </Text>
              </View>
            </View>
            <View style={styles.headerIcon}>
              <FontAwesome6
                name="calendar-check"
                size={40}
                color={brutalistColors.black}
              />
            </View>
          </View>
        </Animated.View>

        <AttendanceMarkedCard
          todayRecord={todayRecord}
          onCheckout={handleCheckout}
        />

        {todayRecord.isCheckedOut && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.sectionCard}
          >
            <View style={styles.sectionHeader}>
              <FontAwesome6
                name="circle-info"
                size={20}
                color={brutalistColors.black}
              />
              <Text style={styles.sectionTitle}>TODAY&apos;S SUMMARY</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Your attendance has been successfully recorded and completed for
              today.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <FontAwesome6
                  name="clock"
                  size={16}
                  color={brutalistColors.gray}
                />
                <Text style={styles.summaryText}>
                  Checked in at {formatTime(todayRecord.checkInTime ?? null)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <FontAwesome6
                  name="clock"
                  size={16}
                  color={brutalistColors.gray}
                />
                <Text style={styles.summaryText}>
                  Checked out at {formatTime(todayRecord.checkOutTime ?? null)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <FontAwesome6
                  name="location-dot"
                  size={16}
                  color={brutalistColors.gray}
                />
                <Text style={styles.summaryText}>
                  {todayRecord.takenLocation || "Location not recorded"}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <FontAwesome6
                  name="calendar"
                  size={16}
                  color={brutalistColors.gray}
                />
                <Text style={styles.summaryText}>
                  {todayRecord.attendanceType === "FULL_DAY"
                    ? "Full Day"
                    : "Half Day"}{" "}
                  attendance
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.headerCard}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>GOOD {getTimeOfDay()}!</Text>
            <Text style={styles.headerTitle}>MARK YOUR ATTENDANCE</Text>
          </View>
          <View style={styles.headerIcon}>
            <FontAwesome6
              name="calendar-check"
              size={40}
              color={brutalistColors.black}
            />
          </View>
        </View>

        {/* Validation Status Display */}
        {validationStatus?.details && (
          <>
            {!validationStatus.isValid && (
              <View style={styles.cannotMarkBanner}>
                <FontAwesome6 name="exclamation-triangle" size={16} color={brutalistColors.black}/>
                <Text style={styles.cannotMarkBannerText}>
                  CANNOT MARK ATTENDANCE
                </Text>
              </View>
            )}

            <LocationStatusCard
              details={validationStatus.details}
              department={department}
              userLocationType={userLocationType}
            />
          </>
        )}

        {/* Brutalist Warning Message */}
        {validationStatus && !validationStatus.isValid && validationStatus.reason && (
          <ValidationErrorCard reason={validationStatus.reason} />
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {photos.length}/{totalPhotos}
            </Text>
            <Text style={styles.statLabel}>PHOTO</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{audioRecording ? "✓" : "−"}</Text>
            <Text style={styles.statLabel}>AUDIO</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{new Date().getDate()}</Text>
            <Text style={styles.statLabel}>
              {new Date()
                .toLocaleDateString("en", { month: "short" })
                .toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.sectionCard}
      >
        <View style={styles.sectionHeader}>
          <FontAwesome6 name="camera" size={20} color={brutalistColors.black} />
          <Text style={styles.sectionTitle}>PHOTO VERIFICATION</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Capture today&apos;s required photo for attendance verification
        </Text>
        <PhotoGrid
          photos={photos}
          onRetakePhoto={onRetakePhoto}
          onTakePhoto={onTakePhotos}
          totalPhotos={totalPhotos}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionCard}
      >
        <View style={styles.sectionHeader}>
          <FontAwesome6
            name="microphone"
            size={20}
            color={brutalistColors.black}
          />
          <Text style={styles.sectionTitle}>VOICE VERIFICATION</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Record your voice saying today&apos;s date
        </Text>
        <AudioSection
          audioRecording={audioRecording}
          onRecordAudio={onRecordAudio}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.actionSection}
      >
        <ActionButtons
          photos={photos}
          audioRecording={audioRecording}
          onTakePhotos={onTakePhotos}
          onRetakeAll={onRetakeAll}
          onUpload={onUpload}
          uploading={uploading}
          totalPhotos={totalPhotos}
          canSubmit={validationStatus?.isValid || false}
        />
      </Animated.View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offwhite,
  },
  brutalistCard: {
    borderWidth: 4,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.white,
    padding: 20,
    margin: 16,
    shadowColor: brutalistColors.black,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  headerCard: {
    margin: 16,
    borderWidth: 4,
    borderColor: brutalistColors.black,
    backgroundColor: colors.lightGreen,
    padding: 20,
    shadowColor: brutalistColors.black,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: brutalistColors.black,
    marginBottom: 4,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: brutalistColors.black,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 14,
    color: brutalistColors.black,
    textTransform: "uppercase",
  },
  headerIcon: {
    marginLeft: 16,
  },
  statsRow: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: brutalistColors.black,
    padding: 16,
    marginTop: 20,
    backgroundColor: brutalistColors.white,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: brutalistColors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: brutalistColors.black,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 2,
    backgroundColor: brutalistColors.black,
  },
  sectionCard: {
    borderWidth: 4,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: brutalistColors.black,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 2,
    borderColor: brutalistColors.black,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: brutalistColors.black,
    marginLeft: 8,
    textTransform: "uppercase",
  },
  sectionDescription: {
    fontSize: 14,
    color: brutalistColors.black,
    marginBottom: 16,
    fontWeight: "600",
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  attendanceMarkedCard: {
    borderWidth: 4,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: brutalistColors.black,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  attendanceMarkedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceMarkedIcon: {
    marginRight: 16,
  },
  attendanceMarkedText: {
    flex: 1,
  },
  attendanceMarkedTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: brutalistColors.black,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  attendanceMarkedSubtitle: {
    fontSize: 14,
    color: brutalistColors.black,
    marginBottom: 8,
    fontWeight: "600",
  },
  attendanceMarkedTime: {
    fontSize: 12,
    color: brutalistColors.gray,
  },
  summaryRow: {
    gap: 12,
    marginTop: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: brutalistColors.black,
    fontWeight: "600",
  },
  sessionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  sessionText: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  checkoutButton: {
    marginTop: 16,
    borderWidth: 3,
    backgroundColor: brutalistColors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: brutalistColors.error,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  buttonDisabled: {
    backgroundColor: brutalistColors.lightGray,
    borderColor: brutalistColors.gray,
    shadowColor: brutalistColors.gray,
  },
  statusCard: {
    backgroundColor: brutalistColors.white,
    borderWidth: 2,
    padding: 16,
    marginTop: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: brutalistColors.gray,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: brutalistColors.black,
  },
  locationTypeBadge: {
    backgroundColor: brutalistColors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  locationTypeText: {
    fontSize: 12,
    color: brutalistColors.black,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: brutalistColors.black,
  },
  // New styles for Brutalist validation
  cannotMarkBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: brutalistColors.errorBg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: brutalistColors.black,
  },
  cannotMarkBannerText: {
    color: brutalistColors.black,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  locationStatusCard: {
    borderWidth: 2,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.white,
    padding: 16,
    marginTop: -2, // Overlap the banner slightly
    gap: 12,
  },
  validationErrorCard: {
    borderWidth: 2,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.errorBg,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  validationErrorText: {
    color: brutalistColors.black,
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    lineHeight: 20,
  },
});