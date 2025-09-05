import { colors } from "@/constants/colors";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface AvatarDisplayProps {
  avatarUrl: string;
  size?: number;
  style?: any;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  size = 120,
}) => {
  const [loading, setLoading] = useState(true);

  const borderWidth = 2;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            width: 100%;
            height: 100%;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <img src="${avatarUrl}" alt="Avatar" />
      </body>
    </html>`;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderWidth: borderWidth,
        },
      ]}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      )}
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    position: "relative",

    // ✅ Cross-platform shadow
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
    
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.offwhite,
    zIndex: 1,
  },
});
