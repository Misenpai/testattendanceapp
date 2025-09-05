import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface LogoutButtonProps {
  disabled?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ disabled = false }) => {
  const { signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, disabled && styles.disabled]}
      onPress={handleLogout}
      disabled={disabled}
    >
      <FontAwesome6 name="arrow-right-from-bracket" size={18} color="#000" />
      <Text style={styles.logoutButtonText}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginLeft: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});
