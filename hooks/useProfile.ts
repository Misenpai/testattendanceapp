// hooks/useProfile.ts

import {
  AvatarData,
  getUserAvatar,
  saveUserAvatar,
} from "@/services/avatarStorageService";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  ProfileData as BaseProfileData,
  getUserProfileByUsername,
  updateUserLocation,
} from "../services/profileService";
import { useAuthStore } from "../store/authStore";

// Extend backend ProfileData with avatar
export type ProfileDataWithAvatar = BaseProfileData & {
  avatar?: AvatarData | null;
};

export const useProfile = () => {
  const { userName, userId } = useAuthStore();
  const [profile, setProfile] = useState<ProfileDataWithAvatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userName) {
      fetchProfile();
    }
  }, [userName]);

  const fetchProfile = async () => {
    if (!userName) return;

    try {
      setLoading(true);


      const response = await getUserProfileByUsername(userName);

      if (response.success && response.data) {
        // Load avatar from local storage
        const avatar = await getUserAvatar(response.data.empCode);
        setProfile({
          ...response.data,
          avatar,
        });
      } else {
        Alert.alert("Error", response.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (newLocation: string) => {
    if (!profile?.empCode) return false;

    try {
      setUpdating(true);
      const response = await updateUserLocation(profile.empCode, newLocation);

      if (response.success && response.data) {
        setProfile({
          ...response.data,
          avatar: profile.avatar, // keep avatar intact
        });
        Alert.alert("Success", "Location updated successfully");
        return true;
      } else {
        Alert.alert("Error", response.error || "Failed to update location");
        return false;
      }
    } catch (error) {
      console.error("Location update error:", error);
      Alert.alert("Error", "Failed to update location");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateAvatar = async (avatarData: AvatarData) => {
    if (!profile?.empCode) return false;

    try {
      setUpdating(true);
      const success = await saveUserAvatar(profile.empCode, avatarData);

      if (success) {
        setProfile((prev) => (prev ? { ...prev, avatar: avatarData } : null));
        Alert.alert("Success", "Profile picture updated successfully");
        return true;
      } else {
        Alert.alert("Error", "Failed to update profile picture");
        return false;
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      Alert.alert("Error", "Failed to update profile picture");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    updateLocation,
    updateAvatar,
    userName,
    userId,
  };
};
