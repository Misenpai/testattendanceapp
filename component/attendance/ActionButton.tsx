import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AudioRecording } from "../../types/attendance"; // Add this import

interface ActionButtonsProps {
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null; // Add this prop
  onTakePhotos: () => void;
  onRetakeAll: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionButtons({
  photos,
  audioRecording, // Add this parameter
  onTakePhotos,
  onRetakeAll,
  onUpload,
  uploading,
  totalPhotos,
}: ActionButtonsProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Update the completion check to include audio
  const isComplete = photos.length === totalPhotos && audioRecording !== null;

  return (
    <View style={styles.container}>
      {photos.length > 0 && (
        <View style={styles.buttonGroup}>
          <AnimatedPressable
            onPress={onUpload}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.primaryButton,
              animatedStyle,
              !isComplete && styles.buttonDisabled,
            ]}
            disabled={!isComplete || uploading}
          >
            <LinearGradient
              colors={
                isComplete
                  ? [colors.success, "#059669"]
                  : [colors.gray[400], colors.gray[500]]
              }
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <FontAwesome6
                name={uploading ? "spinner" : "cloud-arrow-up"}
                size={20}
                color={colors.white}
              />
              <Text style={styles.primaryButtonText}>
                {uploading ? "Uploading..." : "Submit Attendance"}
              </Text>
            </LinearGradient>
          </AnimatedPressable>

          <Pressable onPress={onRetakeAll} style={styles.secondaryButton}>
            <FontAwesome6
              name="arrow-rotate-left"
              size={18}
              color={colors.error}
            />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
        </View>
      )}


    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.error,
  },
  secondaryButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warning + "15",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning + "30",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
  },
});