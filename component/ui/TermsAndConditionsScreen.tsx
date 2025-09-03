// component/ui/TermsAndConditionsScreen.tsx
import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { height: screenHeight } = Dimensions.get("window");

interface TermsAndConditionsScreenProps {
  onAccept: () => void;
  isProcessing?: boolean;
}

export function TermsAndConditionsScreen({
  onAccept,
  isProcessing = false,
}: TermsAndConditionsScreenProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleContentSizeChange = (
    contentWidth: number,
    contentHeight: number
  ) => {
    const screenContentHeight = screenHeight - 300;
    setIsScrollable(contentHeight > screenContentHeight);
    if (contentHeight <= screenContentHeight) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    if (!hasScrolledToEnd && isScrollable) {
      Alert.alert(
        "PLEASE READ TERMS",
        "Scroll to the bottom and read all terms and conditions before accepting.",
        [{ text: "OK" }]
      );
      return;
    }
    onAccept();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoBox}>
            <FontAwesome6 name="shield-halved" size={40} color={colors.black} />
          </View>
          <Text style={styles.headerTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.headerSubtitle}>
            PLEASE READ AND ACCEPT OUR TERMS TO CONTINUE
          </Text>
        </View>
      </Animated.View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
        >
          {/* Privacy & Data Protection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="lock" size={20} color={colors.black} />
              <Text style={styles.sectionTitle}>PRIVACY & DATA PROTECTION</Text>
            </View>
            <Text style={styles.sectionText}>
              YOUR PRIVACY IS OUR TOP PRIORITY. THIS IS HOW WE HANDLE YOUR DATA:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletMarker}>-</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>NO MALICIOUS USE:</Text> WE NEVER
                USE YOUR DATA FOR HARMFUL PURPOSES.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletMarker}>-</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>SECURE STORAGE:</Text> ALL DATA IS
                ENCRYPTED AND SAFELY STORED.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletMarker}>-</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>NO THIRD-PARTY SHARING:</Text>{" "}
                YOUR DATA STAYS WITH US.
              </Text>
            </View>
          </View>

          {/* Data Usage */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="database" size={20} color={colors.black} />
              <Text style={styles.sectionTitle}>HOW WE USE YOUR DATA</Text>
            </View>
            <Text style={styles.sectionText}>DATA TYPES AND PURPOSES:</Text>
            <Text style={styles.dataTypeTitle}>📸 PHOTOS & IMAGES</Text>
            <Text style={styles.dataDescription}>
              USED ONLY FOR TRAINING AND IMPROVING ATTENDANCE VERIFICATION.
            </Text>
            <Text style={styles.dataTypeTitle}>🎤 AUDIO RECORDINGS</Text>
            <Text style={styles.dataDescription}>
              USED ONLY FOR VOICE VERIFICATION TRAINING.
            </Text>
            <Text style={styles.dataTypeTitle}>📍 LOCATION DATA</Text>
            <Text style={styles.dataDescription}>
              USED ONLY TO VERIFY ATTENDANCE LOCATION.
            </Text>
            <Text style={styles.dataTypeTitle}>👤 ACCOUNT INFORMATION</Text>
            <Text style={styles.dataDescription}>
              USED ONLY FOR LOGIN AND ATTENDANCE TRACKING.
            </Text>
          </View>

          {/* Agreement */}
          <View style={styles.section}>
            <Text style={styles.sectionText}>
              BY TAPPING &quot;ACCEPT TERMS & CONTINUE&quot;, YOU CONFIRM THAT
              YOU HAVE READ, UNDERSTOOD, AND AGREE TO THESE TERMS.
            </Text>
          </View>

          {/* Scroll Indicator */}
          {isScrollable && !hasScrolledToEnd && (
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>
                ⇩ SCROLL DOWN TO CONTINUE ⇩
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Accept Button */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          style={[
            styles.acceptButton,
            ((!hasScrolledToEnd && isScrollable) || isProcessing) &&
              styles.buttonDisabled,
          ]}
          onPress={handleAccept}
          disabled={(!hasScrolledToEnd && isScrollable) || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.acceptButtonText}>SETTING UP...</Text>
            </>
          ) : (
            <>
              <FontAwesome6
                name="check-circle"
                size={20}
                color={colors.black}
              />
              <Text style={styles.acceptButtonText}>
                ACCEPT TERMS & CONTINUE
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!hasScrolledToEnd && isScrollable && (
          <Text style={styles.buttonHelpText}>
            SCROLL TO THE BOTTOM TO ENABLE BUTTON
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offwhite },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderColor: colors.black,
  },
  headerContent: { alignItems: "center", marginTop: 20 },
  logoBox: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.black,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.black,
    textAlign: "center",
    marginTop: 4,
  },
  contentContainer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    borderWidth: 3,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.black,
    marginLeft: 12,
    textTransform: "uppercase",
  },
  sectionText: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletMarker: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.black,
    marginRight: 8,
  },
  bulletText: { flex: 1, fontSize: 14, color: colors.black, lineHeight: 20 },
  boldText: { fontWeight: "900", color: colors.black },
  dataTypeTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.black,
    marginTop: 12,
  },
  dataDescription: {
    fontSize: 13,
    color: colors.black,
    marginBottom: 8,
    marginLeft: 8,
  },
  scrollIndicator: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 2,
    borderColor: colors.black,
  },
  scrollIndicatorText: { fontSize: 14, color: colors.black, fontWeight: "900" },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 3,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 3,
    borderColor: colors.black,
    backgroundColor: colors.lightGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
    borderColor: colors.black,
  },
  acceptButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  buttonHelpText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.black,
    marginTop: 8,
  },
});
