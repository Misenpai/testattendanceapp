import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProfileFieldProps {
  label: string;
  value: string;
  isReadOnly?: boolean;
  icon?: string;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  isReadOnly = true,
  icon,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.input}>
        <View style={styles.inputContent}>
          {icon && (
            <FontAwesome6
              name={icon}
              size={18}
              color="black"
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "black",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
    padding: 16,
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
    flex: 1,
  },
});
