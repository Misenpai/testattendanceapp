import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatarData: { style: string; seed: string; url: string }) => void;
  currentAvatar?: { style: string; seed: string };
}

// Full DiceBear avatar styles
const AVATAR_STYLES = [
  { id: "adventurer", name: "Adventurer", description: "Cartoon-style characters" },
  { id: "avataaars", name: "Avataaars", description: "Sketch-style avatars" },
  { id: "big-ears", name: "Big Ears", description: "Characters with big ears" },
  { id: "big-smile", name: "Big Smile", description: "Happy characters" },
  { id: "bottts", name: "Bottts", description: "Robot avatars" },
  { id: "croodles", name: "Croodles", description: "Doodle-style characters" },
  { id: "fun-emoji", name: "Fun Emoji", description: "Emoji-style avatars" },
  { id: "identicon", name: "Identicon", description: "Geometric patterns" },
  { id: "lorelei", name: "Lorelei", description: "Minimalist characters" },
  { id: "micah", name: "Micah", description: "Illustrated characters" },
  { id: "miniavs", name: "Miniavs", description: "Pixel-style avatars" },
  { id: "notionists", name: "Notionists", description: "Notion-style avatars" },
  { id: "open-peeps", name: "Open Peeps", description: "Hand-drawn style" },
  { id: "personas", name: "Personas", description: "Abstract characters" },
  { id: "pixel-art", name: "Pixel Art", description: "8-bit style avatars" },
];

// Full seed options
const SEED_OPTIONS = [
  "happy",
  "cool",
  "awesome",
  "amazing",
  "wonderful",
  "fantastic",
  "brilliant",
  "excellent",
  "marvelous",
  "superb",
  "outstanding",
  "remarkable",
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  visible,
  onClose,
  onSelect,
  currentAvatar,
}) => {
  const [selectedStyle, setSelectedStyle] = useState(
    currentAvatar?.style || "adventurer"
  );

  const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(
      seed
    )}&size=120`;
  };

  const handleAvatarSelect = (style: string, seed: string) => {
    const url = generateAvatarUrl(style, seed);
    onSelect({ style, seed, url });
    onClose();
  };

  const AvatarOption = ({ style, seed }: { style: string; seed: string }) => {
    const url = generateAvatarUrl(style, seed);
    const [svgXml, setSvgXml] = useState<string | null>(null);

    useEffect(() => {
      fetch(url)
        .then((res) => res.text())
        .then(setSvgXml)
        .catch(console.error);
    }, [url]);

    const isSelected =
      currentAvatar?.style === style && currentAvatar?.seed === seed;

    return (
      <TouchableOpacity
        style={[styles.avatarOption, isSelected && styles.selectedAvatarOption]}
        onPress={() => handleAvatarSelect(style, seed)}
        activeOpacity={0.7}
      >
        {svgXml ? (
          <SvgXml xml={svgXml} width={60} height={60} />
        ) : (
          <ActivityIndicator size="small" color="#000" />
        )}

        {isSelected && (
          <View style={styles.selectedBadge}>
            <FontAwesome6 name="check" size={12} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome6 name="xmark" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CHOOSE AVATAR</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Style Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVATAR STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AVATAR_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleOption,
                    selectedStyle === style.id && styles.selectedStyleOption,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <Text
                    style={[
                      styles.styleName,
                      selectedStyle === style.id && styles.selectedStyleName,
                    ]}
                  >
                    {style.name}
                  </Text>
                  <Text style={styles.styleDescription}>{style.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Avatar Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT AVATAR</Text>
            <View style={styles.avatarGrid}>
              {SEED_OPTIONS.map((seed) => (
                <AvatarOption key={seed} style={selectedStyle} seed={seed} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offwhite,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderColor: "#000",
    backgroundColor: colors.offwhite,
  },
  closeButton: {
    padding: 8,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    marginBottom: 16,
    textTransform: "uppercase",
    borderBottomWidth: 3,
    borderColor: "#000",
    paddingBottom: 6,
  },
  styleOption: {
    borderWidth: 3,
    borderColor: "#000",
    padding: 12,
    marginRight: 12,
    backgroundColor: "#fff",
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  selectedStyleOption: {
    backgroundColor: colors.lightGreen,
  },
  styleName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textTransform: "uppercase",
  },
  selectedStyleName: {
    color: colors.black,
  },
  styleDescription: {
    fontSize: 12,
    color: "#444",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  avatarOption: {
    width: (screenWidth - 60) / 3,
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  selectedAvatarOption: {
    backgroundColor: colors.lightYellow,
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
});
