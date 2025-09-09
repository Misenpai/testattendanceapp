import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const { signIn, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    await signIn(username.trim(), password);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.offwhite }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Brand Section */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require("../../assets/images/icon-1024-1024.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.brandName}>Attendance System</Text>
            <Text style={styles.tagline}>IIT Guwahati</Text>
          </Animated.View>

          {/* Brutalist Login Form Card */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.formCard}
          >
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <FontAwesome6
                name="user"
                size={20}
                color={"#000"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={"#555"}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <FontAwesome6
                name="lock"
                size={20}
                color={"#000"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={"#555"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome6
                  name={showPassword ? "eye" : "eye-slash"}
                  size={20}
                  color={"#000"}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: colors.gray[500],
  },

  formCard: {
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#000",
    padding: 24,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginBottom: 24,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  eyeIcon: {
    padding: 4,
  },

  loginButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#dcfd00",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  loginButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
