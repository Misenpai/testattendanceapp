import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AudioRecording } from "../../types/attendance";
import { AudioPlayer } from "../audio/AudioPlayer";

interface AudioSectionProps {
  audioRecording: AudioRecording | null;
  onRecordAudio: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AudioSection({
  audioRecording,
  onRecordAudio,
}: AudioSectionProps) {
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (!audioRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
      );
    } else {
      // Stop the animation when audio is recorded
      pulseScale.value = withTiming(1);
    }
  }, [audioRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      {audioRecording ? (
        <View style={styles.brutalistCard}>
          <View style={styles.brutalistCardHeader}>
            <View style={styles.brutalistCardIcon}>
              <FontAwesome6 name="circle-check" size={24} color="#fff" />
            </View>
            <Text style={styles.brutalistCardAlert}>Audio Recorded</Text>
          </View>
          <View style={styles.brutalistCardMessage}>
            <AudioPlayer audioRecording={audioRecording} />
          </View>
        </View>
      ) : (
        <AnimatedPressable
          onPress={onRecordAudio}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.brutalistCard, buttonStyle]}
        >
          <View style={styles.brutalistCardHeader}>
            <Animated.View style={[styles.brutalistCardIcon, pulseStyle]}>
              <FontAwesome6 name="microphone" size={24} color="#fff" />
            </Animated.View>
            <Text style={styles.brutalistCardAlert}>Record Audio</Text>
          </View>
          <View style={styles.brutalistCardMessage}>
            <Text style={styles.recordButtonText}>Tap to Record</Text>
            <Text style={styles.recordHintText}>
              Say today&apos;s date clearly
            </Text>
          </View>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No specific container styles needed, the card will define its own space
  },
  brutalistCard: {
    borderWidth: 4,
    borderColor: "#000",
    backgroundColor: "#fff",
    padding: 24, // 1.5rem equivalent
    borderStyle: "dashed",
  },
  brutalistCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // 1rem equivalent
    marginBottom: 16,
    borderBottomWidth: 2,
    borderColor: "#000",
    paddingBottom: 16,
  },
  brutalistCardIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 8, // 0.5rem equivalent
    width: 48,
    height: 48,
  },
  brutalistCardAlert: {
    fontWeight: "900",
    color: "#000",
    fontSize: 24, // 1.5rem equivalent
    textTransform: "uppercase",
  },
  brutalistCardMessage: {
    marginTop: 16,
    paddingBottom: 16,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#000",
    marginBottom: 4,
  },
  recordHintText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    fontWeight: "600",
  },
});