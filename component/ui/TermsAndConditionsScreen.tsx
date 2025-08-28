// component/ui/TermsAndConditionsScreen.tsx
import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { height: screenHeight } = Dimensions.get('window');

interface TermsAndConditionsScreenProps {
  onAccept: () => void;
  isProcessing?: boolean;
}

export function TermsAndConditionsScreen({ 
  onAccept, 
  isProcessing = false 
}: TermsAndConditionsScreenProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    const screenContentHeight = screenHeight - 300; // Account for header and button space
    setIsScrollable(contentHeight > screenContentHeight);
    
    // If content fits on screen, user doesn't need to scroll
    if (contentHeight <= screenContentHeight) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    if (!hasScrolledToEnd && isScrollable) {
      Alert.alert(
        'Please Read Terms',
        'Please scroll to the bottom and read all terms and conditions before accepting.',
        [{ text: 'OK' }]
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
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <FontAwesome6
                name="shield-halved"
                size={40}
                color={colors.white}
              />
            </View>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>
              Please read and accept our terms to continue
            </Text>
          </View>
        </LinearGradient>
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
          {/* Privacy & Data Protection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="lock" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Privacy & Data Protection</Text>
            </View>
            <Text style={styles.sectionText}>
              Your privacy is our top priority. We want to be completely transparent about how this attendance application handles your data:
            </Text>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="circle-check" size={14} color={colors.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>No Malicious Use:</Text> We do not use your personal data, including images, audio recordings, location information, or login credentials for any malicious purposes.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="circle-check" size={14} color={colors.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Secure Storage:</Text> All data is encrypted and stored securely with industry-standard security measures.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="circle-check" size={14} color={colors.success} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>No Third-Party Sharing:</Text> Your personal information is never sold, shared, or distributed to third parties without your explicit consent.
              </Text>
            </View>
          </View>

          {/* Data Usage Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="database" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>How We Use Your Data</Text>
            </View>
            
            <Text style={styles.dataTypeTitle}>📸 Photos & Images</Text>
            <Text style={styles.dataDescription}>
              Images are collected solely for training our machine learning models to improve attendance verification accuracy. Photos are processed securely and used exclusively for model training purposes - never for malicious activities.
            </Text>
            
            <Text style={styles.dataTypeTitle}>🎤 Audio Recordings</Text>
            <Text style={styles.dataDescription}>
              Voice recordings are used exclusively for training our AI models to enhance voice verification systems. Audio data is processed securely and used only for legitimate training purposes to improve service quality.
            </Text>
            
            <Text style={styles.dataTypeTitle}>📍 Location Data</Text>
            <Text style={styles.dataDescription}>
              Location information is used exclusively to verify you are at the correct attendance location and is not tracked outside of attendance sessions.
            </Text>
            
            <Text style={styles.dataTypeTitle}>👤 Account Information</Text>
            <Text style={styles.dataDescription}>
              Login credentials and profile information are used only for account management and attendance tracking.
            </Text>
          </View>

          {/* Data Training Notice */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="brain" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>AI Training & Model Improvement</Text>
            </View>
            <Text style={styles.sectionText}>
              We use collected photos and audio recordings to train and improve our artificial intelligence models:
            </Text>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="robot" size={14} color={colors.info} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Machine Learning Training:</Text> Your photos and audio help train our AI models to better recognize faces, voices, and attendance patterns.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="chart-line" size={14} color={colors.info} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Service Improvement:</Text> Training data helps us improve accuracy, reduce errors, and enhance the overall user experience.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="shield-alt" size={14} color={colors.info} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Ethical Use Only:</Text> All training data is used responsibly and ethically, never for harmful or malicious purposes.
              </Text>
            </View>
          </View>

          {/* Permissions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="key" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Required Permissions</Text>
            </View>
            <Text style={styles.sectionText}>
              After accepting these terms, the app will request the following permissions:
            </Text>
            
            <View style={styles.permissionItem}>
              <FontAwesome6 name="camera" size={16} color={colors.info} />
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Camera Access</Text>
                <Text style={styles.permissionDescription}>Required to capture attendance photos for verification and training</Text>
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <FontAwesome6 name="microphone" size={16} color={colors.info} />
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Microphone Access</Text>
                <Text style={styles.permissionDescription}>Required to record voice verification and improve AI models</Text>
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <FontAwesome6 name="location-dot" size={16} color={colors.info} />
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Location Access</Text>
                <Text style={styles.permissionDescription}>Required to verify attendance location</Text>
              </View>
            </View>
          </View>

          {/* User Rights Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="user-shield" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Your Rights</Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="eye" size={14} color={colors.accent.purple} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Data Access:</Text> You can request to view all data we have collected about you.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="trash" size={14} color={colors.accent.purple} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Data Deletion:</Text> You can request deletion of your personal data at any time.
              </Text>
            </View>
            
            <View style={styles.bulletPoint}>
              <FontAwesome6 name="ban" size={14} color={colors.accent.purple} />
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Withdraw Consent:</Text> You can revoke permissions and stop using the app at any time.
              </Text>
            </View>
          </View>

          {/* Agreement Section */}
          <View style={styles.agreementSection}>
            <Text style={styles.agreementText}>
              By tapping &quot;Accept Terms & Continue&quot;, you acknowledge that you have read, understood, and agree to these terms and conditions. You also consent to the collection and use of your data as described above for legitimate attendance tracking and AI training purposes only.
            </Text>
          </View>

          {/* Scroll Indicator */}
          {isScrollable && !hasScrolledToEnd && (
            <View style={styles.scrollIndicator}>
              <FontAwesome6 name="chevron-down" size={16} color={colors.primary[500]} />
              <Text style={styles.scrollIndicatorText}>Scroll down to continue</Text>
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
            (!hasScrolledToEnd && isScrollable) && styles.acceptButtonDisabled,
            isProcessing && styles.acceptButtonProcessing
          ]}
          onPress={handleAccept}
          disabled={(!hasScrolledToEnd && isScrollable) || isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              (!hasScrolledToEnd && isScrollable) || isProcessing
                ? [colors.gray[400], colors.gray[500]]
                : [colors.success, '#059669']
            }
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.acceptButtonText}>Setting up...</Text>
              </>
            ) : (
              <>
                <FontAwesome6 name="check-circle" size={20} color={colors.white} />
                <Text style={styles.acceptButtonText}>Accept Terms & Continue</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {(!hasScrolledToEnd && isScrollable) && (
          <Text style={styles.buttonHelpText}>
            Please scroll to the bottom to read all terms
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray[200],
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 15,
    color: colors.gray[700],
    lineHeight: 22,
    marginLeft: 12,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: colors.gray[800],
  },
  dataTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: 12,
    marginBottom: 6,
  },
  dataDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  permissionContent: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: colors.gray[600],
  },
  agreementSection: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginTop: 8,
  },
  agreementText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    fontStyle: 'italic',
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  scrollIndicatorText: {
    fontSize: 14,
    color: colors.primary[500],
    marginTop: 4,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  acceptButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  acceptButtonProcessing: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonHelpText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
  },
});