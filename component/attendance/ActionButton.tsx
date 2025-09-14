import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AudioRecording } from "../../types/attendance";

interface ActionButtonsProps {
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  onTakePhotos: () => void;
  onRetakeAll: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
  canSubmit: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionButtons({
  photos,
  audioRecording,
  onRetakeAll,
  onUpload,
  uploading,
  totalPhotos,
  canSubmit,
}: ActionButtonsProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isComplete = photos.length === totalPhotos && audioRecording !== null;
  const isButtonDisabled = !isComplete || uploading || !canSubmit;

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
              isButtonDisabled && styles.buttonDisabled,
            ]}
            disabled={isButtonDisabled}
          >
            <View
              style={[
                styles.brutalistButton,
                !isButtonDisabled
                  ? styles.successButton
                  : styles.disabledButton,
              ]}
            >
              <FontAwesome6
                name={uploading ? "spinner" : "cloud-arrow-up"}
                size={20}
                color={colors.white}
              />
              <Text style={styles.brutalistButtonText}>
                {uploading ? "Uploading..." : "Submit Attendance"}
              </Text>
            </View>
          </AnimatedPressable>

          <Pressable onPress={onRetakeAll} style={styles.secondaryButton}>
            <FontAwesome6
              name="arrow-rotate-left"
              size={18}
              color={colors.black}
            />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 16,
  },
  buttonGroup: {
    gap: 16,
    alignItems: 'stretch',
  },
  primaryButton: {
    borderWidth: 4,
    borderColor: colors.black,
    backgroundColor: colors.black,
    shadowColor: colors.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    alignSelf: 'stretch',
  },
  brutalistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  brutalistButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  successButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.gray[500],
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 4,
    borderColor: colors.black,
    shadowColor: colors.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    alignSelf: 'stretch',
  },
  secondaryButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});