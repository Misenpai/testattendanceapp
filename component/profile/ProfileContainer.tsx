import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { AttendanceCalendar } from './AttendanceCalendar';
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarPicker } from './AvatarPicker';
import { LogoutButton } from './LogoutButton';
import { ProfileField } from './ProfileFieldProfile';

export const ProfileContainer: React.FC = () => {
  const { profile, updating, updateAvatar } = useProfile();
  const { projects } = useAuthStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAvatarSelect = async (avatarData: {
    style: string;
    seed: string;
    url: string;
  }) => {
    await updateAvatar(avatarData);
  };

  if (!profile) {
    return null;
  }

  // Get department from projects
  const department = projects.length > 0 ? projects[0].department : 'Not Assigned';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarPicker(true)}
            disabled={updating}
          >
            {profile.avatar ? (
              <AvatarDisplay avatarUrl={profile.avatar.url} size={100} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.username.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <FontAwesome6 name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.text}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.usernameText}>{profile.username}</Text>
          </View>
        </View>

        {/* Attendance Calendar Toggle */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          onPress={() => setShowCalendar(!showCalendar)}
          activeOpacity={0.7}
        >
          <View style={styles.attendanceCardHeader}>
            <View style={styles.attendanceCardLeft}>
              <FontAwesome6 name="calendar-days" size={24} color={colors.primary[500]} />
              <View style={styles.attendanceCardTextContainer}>
                <Text style={styles.attendanceCardTitle}>Attendance Tracker</Text>
                <Text style={styles.attendanceCardSubtitle}>
                  Tap to {showCalendar ? 'hide' : 'view'} your attendance history
                </Text>
              </View>
            </View>
            <FontAwesome6 
              name={showCalendar ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.gray[500]} 
            />
          </View>
        </TouchableOpacity>

        {/* Attendance Calendar Section */}
        {showCalendar && (
          <View style={styles.calendarSection}>
            <AttendanceCalendar employeeCode={profile.employeeNumber} />
          </View>
        )}

        {/* Profile Fields Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <ProfileField 
            label="Username" 
            value={profile.username} 
            isReadOnly 
            icon="user"
          />
          
          <ProfileField 
            label="Employee Number" 
            value={profile.employeeNumber} 
            isReadOnly 
            icon="id-card"
          />

          <ProfileField 
            label="Employee Class" 
            value={profile.empClass || 'PJ'} 
            isReadOnly 
            icon="briefcase"
          />

          <ProfileField 
            label="Department" 
            value={department} 
            isReadOnly 
            icon="building"
          />

          {/* Show Projects */}
          {projects.length > 0 && (
            <View style={styles.projectsSection}>
              <Text style={styles.projectsLabel}>PROJECTS</Text>
              {projects.map((project, index) => (
                <View key={index} style={styles.projectItem}>
                  <FontAwesome6 name="folder" size={14} color={colors.gray[500]} />
                  <Text style={styles.projectText}>{project.projectCode}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <LogoutButton disabled={updating} />

        {/* Avatar Picker Modal */}
        <AvatarPicker
          visible={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
          onSelect={handleAvatarSelect}
          currentAvatar={
            profile.avatar && profile.avatar.style && profile.avatar.seed
              ? { style: profile.avatar.style, seed: profile.avatar.seed }
              : undefined
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  avatarContainer: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendanceCardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  attendanceCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  attendanceCardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  calendarSection: {
    marginTop: -10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  text: {
    marginTop: 20,
    alignItems: 'center',
  },
  projectsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  projectsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: 6,
  },
  projectText: {
    fontSize: 14,
    color: colors.gray[700],
  },
});
