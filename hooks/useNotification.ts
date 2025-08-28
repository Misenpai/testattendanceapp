// hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationService } from '../services/notificationService';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const { session, userName } = useAuthStore();
  const { 
    todayAttendanceMarked, 
    attendanceRecords,
    fetchTodayAttendanceFromServer 
  } = useAttendanceStore();
  
  const appState = useRef(AppState.currentState);
  const notificationUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasShownLoginNotification = useRef(false);

  // Get today's attendance record
  const getTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(record => record.date === today);
  };

  // Setup notifications when user logs in
  useEffect(() => {
    if (session && userName) {
      console.log('Setting up notifications for user:', userName);
      setupNotifications();
      
      // Show session timer notification on login (only once)
      if (!hasShownLoginNotification.current) {
        notificationService.showLoginSessionNotification();
        hasShownLoginNotification.current = true;
      }
      
      // Set up periodic check for notification updates (every 30 minutes)
      notificationUpdateInterval.current = setInterval(() => {
        updateNotificationSchedules();
      }, 30 * 60 * 1000); // 30 minutes

      return () => {
        if (notificationUpdateInterval.current) {
          clearInterval(notificationUpdateInterval.current);
        }
      };
    } else {
      // Clear notifications when user logs out
      notificationService.cancelAllNotifications();
      hasShownLoginNotification.current = false;
    }
  }, [session, userName]);

  // Update notifications when attendance status changes
  useEffect(() => {
    if (session) {
      updateNotificationSchedules();
    }
  }, [todayAttendanceMarked, attendanceRecords]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground
      console.log('App came to foreground, checking attendance status');
      
      if (session) {
        // Refresh attendance data
        await fetchTodayAttendanceFromServer();
        
        // Update notifications based on current status
        updateNotificationSchedules();
      }
    }
    appState.current = nextAppState;
  };

  const setupNotifications = async () => {
    try {
      // Request permissions if not already granted
      await notificationService.registerForPushNotifications();
      
      // Update notification schedules based on current status
      await updateNotificationSchedules();
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const updateNotificationSchedules = async () => {
    const todayRecord = getTodayRecord();
    const hasMarkedAttendance = !!todayRecord;
    const hasCheckedOut = todayRecord?.isCheckedOut || false;
    const checkInTime = todayRecord?.checkInTime;
    
    console.log('Updating notification schedules:', {
      hasMarkedAttendance,
      hasCheckedOut,
      checkInTime,
    });

    // Update notifications based on attendance status
    await notificationService.updateNotificationsForAttendanceStatus(
      hasMarkedAttendance,
      hasCheckedOut,
      checkInTime
    );
  };

  // Public methods to manually trigger notifications
  const scheduleAttendanceReminders = async () => {
    const todayRecord = getTodayRecord();
    await notificationService.scheduleAttendanceReminders(!todayRecord);
  };

  const scheduleCheckoutReminder = async () => {
    const todayRecord = getTodayRecord();
    if (todayRecord && !todayRecord.isCheckedOut) {
      await notificationService.scheduleCheckoutReminder(false, todayRecord.checkInTime);
    }
  };

  const cancelAllNotifications = async () => {
    await notificationService.cancelAllNotifications();
  };

  const sendTestNotification = async () => {
    await notificationService.sendTestNotification();
  };

  return {
    scheduleAttendanceReminders,
    scheduleCheckoutReminder,
    cancelAllNotifications,
    sendTestNotification,
    updateNotificationSchedules,
  };
}