import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

interface PhotoGridProps {
  photos: CameraCapturedPicture[];
  onRetakePhoto: (index: number) => void;
  onTakePhoto: () => void;
  totalPhotos: number;
}

const brutalistColors = {
  black: "#000000",
  white: "#FFFFFF",
  lightGray: "#f4f4f5",
};

export function PhotoGrid({ photos, onRetakePhoto, onTakePhoto }: PhotoGridProps) {
  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn} style={styles.singlePhotoContainer}>
        {photos[0] ? (
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: photos[0].uri }}
              style={styles.photoPreview}
              contentFit="cover"
            />
            <Pressable
              onPress={() => onRetakePhoto(0)}
              style={({ pressed }) => [
                styles.retakeOverlay,
                pressed && styles.retakeOverlayPressed,
              ]}
            >
              <View style={styles.iconWrapper}>
                <FontAwesome6
                  name="arrow-rotate-left"
                  size={24}
                  color={brutalistColors.black}
                />
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onTakePhoto} style={styles.emptySlot}>
            <FontAwesome6
              name="camera"
              size={36}
              color={brutalistColors.black}
            />
            <Text style={styles.emptyText}>TAP TO OPEN CAMERA</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  singlePhotoContainer: {
    width: "100%",
    maxWidth: 250,
    position: "relative",
    alignSelf: 'center',
  },
  photoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: brutalistColors.black,
    backgroundColor: brutalistColors.white,
  },

  photoPreview: {
    width: "100%",
    aspectRatio: 0.75,
    backgroundColor: brutalistColors.lightGray,
  },

  retakeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: brutalistColors.lightGray,
    paddingVertical: 12,
    borderTopWidth: 4,
    borderColor: brutalistColors.black,
  },

  iconWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  retakeOverlayPressed: {
    transform: [{ translateY: 2 }],
  },

  emptySlot: {
    width: "100%",
    aspectRatio: 0.75,
    backgroundColor: brutalistColors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: brutalistColors.black,
    borderStyle: "dashed",
    minHeight: 200,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: brutalistColors.black,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});