import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface ProfileHeaderProps {
  username?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ username }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Title */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>
          Manage your account
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderColor: "black",
    backgroundColor: "#F8F8F8", // offwhite-like
  },
  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "black",
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginTop: 4,
  },
});
