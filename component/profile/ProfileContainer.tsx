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
  console.log("department",department)

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
              <FontAwesome6 name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.text}>
            <Text style={styles.usernameText}>{profile.username}</Text>
          </View>
        </View>

        {/* Attendance Calendar Toggle */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          onPress={() => setShowCalendar(!showCalendar)}
          activeOpacity={0.8}
        >
          <View style={styles.attendanceCardHeader}>
            <View style={styles.attendanceCardLeft}>
              <FontAwesome6 name="calendar-days" size={20} color="#000" />
              <View style={styles.attendanceCardTextContainer}>
                <Text style={styles.attendanceCardTitle}>ATTENDANCE TRACKER</Text>
                <Text style={styles.attendanceCardSubtitle}>
                  Tap to {showCalendar ? 'HIDE' : 'VIEW'} your attendance history
                </Text>
              </View>
            </View>
            <FontAwesome6 
              name={showCalendar ? "chevron-up" : "chevron-down"} 
              size={14} 
              color="#000" 
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
          <Text style={styles.cardTitle}>PERSONAL INFORMATION</Text>
          
          <ProfileField 
            label="USERNAME" 
            value={profile.username} 
            isReadOnly 
            icon="user"
          />
          
          <ProfileField 
            label="EMPLOYEE NUMBER" 
            value={profile.employeeNumber} 
            isReadOnly 
            icon="id-card"
          />

          <ProfileField 
            label="EMPLOYEE CLASS" 
            value={profile.empClass || 'PJ'} 
            isReadOnly 
            icon="briefcase"
          />

          <ProfileField 
            label="DEPARTMENT" 
            value={department} 
            isReadOnly 
            icon="building"
          />

          {/* Show Projects */}
          {projects.length > 0 && (
            <View style={styles.projectsSection}>
              <Text style={styles.projectsLabel}>PROJECT ID</Text>
              {projects.map((project, index) => (
                <View key={index} style={styles.projectItem}>
                  <FontAwesome6 name="folder" size={12} color="#000" />
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
    backgroundColor: colors.offwhite,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  editOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  usernameText: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '90%',
  },
  attendanceCard: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
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
    marginLeft: 12,
    flex: 1,
  },
  attendanceCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  attendanceCardSubtitle: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  calendarSection: {
    marginTop: -10,
    marginBottom: 20,
  },
  card: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  projectsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  projectsLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  projectText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
  },
  text: {
    marginTop: 10,
    alignItems: 'center',
  },
});
