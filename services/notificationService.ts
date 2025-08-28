// services/notificationService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
const { SchedulableTriggerInputTypes } = Notifications;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// FIX: Removed unused ScheduledNotification interface

class NotificationService {
  private notificationIds: Map<string, string> = new Map();
  private hasPermission: boolean = false;

  // Session timing constants
  private readonly SESSION_TIMES = {
    FORENOON_START: { hour: 9, minute: 30 },
    FORENOON_END: { hour: 13, minute: 0 },
    AFTERNOON_START: { hour: 13, minute: 0 },
    AFTERNOON_END: { hour: 17, minute: 30 },
  };

  // Reminder times
  private readonly REMINDER_TIMES = [
    { hour: 11, minute: 0, type: "morning" },
    { hour: 13, minute: 0, type: "afternoon" },
    { hour: 16, minute: 0, type: "evening" },
  ];

  // Checkout reminder time (5:00 PM)
  private readonly CHECKOUT_REMINDER_TIME = { hour: 17, minute: 0 };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.registerForPushNotifications();
    await this.loadScheduledNotifications();

    // Listen for notification responses
    Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );
  }

  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Push notifications are required for attendance reminders. Please enable them in settings."
        );
        this.hasPermission = false;
        return false;
      }

      this.hasPermission = true;

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("attendance", {
          name: "Attendance Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("checkout", {
          name: "Checkout Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 500, 500],
          lightColor: "#FF9500",
          sound: "default",
        });
      }

      return true;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return false;
    }
  }

  private handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    const { notification } = response;
    const data = notification.request.content.data;

    // Handle different notification types
    switch (data?.type) {
      case "attendance":
        // Navigate to attendance screen
        console.log("Navigate to attendance screen");
        break;
      case "checkout":
        // Navigate to checkout screen
        console.log("Navigate to checkout screen");
        break;
    }
  };

  // Calculate remaining session time
  private calculateSessionTime(): {
    session: string;
    remainingMinutes: number;
    endTime: string;
  } {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Forenoon session: 9:30 AM - 1:00 PM
    const forenoonStart =
      this.SESSION_TIMES.FORENOON_START.hour * 60 +
      this.SESSION_TIMES.FORENOON_START.minute;
    const forenoonEnd =
      this.SESSION_TIMES.FORENOON_END.hour * 60 +
      this.SESSION_TIMES.FORENOON_END.minute;

    // Afternoon session: 1:00 PM - 5:30 PM
    const afternoonStart =
      this.SESSION_TIMES.AFTERNOON_START.hour * 60 +
      this.SESSION_TIMES.AFTERNOON_START.minute;
    const afternoonEnd =
      this.SESSION_TIMES.AFTERNOON_END.hour * 60 +
      this.SESSION_TIMES.AFTERNOON_END.minute;

    if (
      currentTimeInMinutes >= forenoonStart &&
      currentTimeInMinutes < forenoonEnd
    ) {
      const remaining = forenoonEnd - currentTimeInMinutes;
      return {
        session: "FORENOON",
        remainingMinutes: remaining,
        endTime: "1:00 PM",
      };
    } else if (
      currentTimeInMinutes >= afternoonStart &&
      currentTimeInMinutes <= afternoonEnd
    ) {
      const remaining = afternoonEnd - currentTimeInMinutes;
      return {
        session: "AFTERNOON",
        remainingMinutes: remaining,
        endTime: "5:30 PM",
      };
    } else if (currentTimeInMinutes < forenoonStart) {
      const remaining = forenoonStart - currentTimeInMinutes;
      return {
        session: "BEFORE_WORK",
        remainingMinutes: remaining,
        endTime: "9:30 AM",
      };
    } else {
      return {
        session: "AFTER_WORK",
        remainingMinutes: 0,
        endTime: "Tomorrow 9:30 AM",
      };
    }
  }

  // Format remaining time for display
  private formatRemainingTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  // Get attendance reminder message with session timer
  private getAttendanceReminderMessage(type: string): string {
    const sessionInfo = this.calculateSessionTime();
    const baseMessages = {
      morning:
        "Good morning! Don't forget to mark your attendance for today. 📷",
      afternoon:
        "Afternoon reminder: Please mark your attendance if you haven't already! ⏰",
      evening: "Last call! Mark your attendance before the day ends. 🔔",
    };

    const baseMessage =
      baseMessages[type as keyof typeof baseMessages] ||
      "Time to mark your attendance!";

    // Add session timer info if in working hours
    if (
      sessionInfo.session === "FORENOON" ||
      sessionInfo.session === "AFTERNOON"
    ) {
      const timeRemaining = this.formatRemainingTime(
        sessionInfo.remainingMinutes
      );
      return `${baseMessage}\n\n⏱️ ${sessionInfo.session} Session: ${timeRemaining} remaining (ends at ${sessionInfo.endTime})`;
    }

    return baseMessage;
  }

  // Schedule attendance reminders with session timer
  async scheduleAttendanceReminders(hasMarkedAttendance: boolean = false) {
    if (!this.hasPermission) {
      await this.registerForPushNotifications();
      if (!this.hasPermission) return;
    }

    // Cancel existing attendance reminders
    await this.cancelAttendanceReminders();

    if (hasMarkedAttendance) {
      console.log("Attendance already marked, skipping reminders");
      return;
    }

    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    for (const reminderTime of this.REMINDER_TIMES) {
      const reminderTimeInMinutes =
        reminderTime.hour * 60 + reminderTime.minute;

      // Only schedule if the reminder time hasn't passed
      if (reminderTimeInMinutes > currentTimeInMinutes) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "📸 Attendance Reminder",
            body: this.getAttendanceReminderMessage(reminderTime.type),
            data: { type: "attendance", reminderType: reminderTime.type },
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          // FIX: Use a trigger object instead of a Date object
          trigger: {
            type: SchedulableTriggerInputTypes.CALENDAR,
            hour: reminderTime.hour,
            minute: reminderTime.minute,
            repeats: false,
          },
        });

        this.notificationIds.set(
          `attendance_${reminderTime.type}`,
          notificationId
        );
        console.log(
          `Scheduled attendance reminder for ${reminderTime.hour}:${reminderTime.minute}`
        );
      }
    }

    await this.saveScheduledNotifications();
  }

  // Schedule checkout reminder with session info
  async scheduleCheckoutReminder(
    hasCheckedOut: boolean = false,
    checkInTime?: string
  ) {
    if (!this.hasPermission) {
      await this.registerForPushNotifications();
      if (!this.hasPermission) return;
    }

    // Cancel existing checkout reminder
    await this.cancelCheckoutReminder();

    if (hasCheckedOut) {
      console.log("Already checked out, skipping reminder");
      return;
    }

    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const checkoutTimeInMinutes =
      this.CHECKOUT_REMINDER_TIME.hour * 60 +
      this.CHECKOUT_REMINDER_TIME.minute;

    if (checkoutTimeInMinutes > currentTimeInMinutes && checkInTime) {
      const checkInDate = new Date(checkInTime);
      // Create a date object for checkout time to calculate duration
      const checkoutDate = new Date();
      checkoutDate.setHours(
        this.CHECKOUT_REMINDER_TIME.hour,
        this.CHECKOUT_REMINDER_TIME.minute,
        0,
        0
      );

      // Calculate worked hours
      const workedHours = Math.floor(
        (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
      );
      const workedMinutes = Math.floor(
        ((checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 60)) % 60
      );

      // Get session info
      const sessionInfo = this.calculateSessionTime();
      let sessionText = "";

      if (sessionInfo.session === "AFTERNOON") {
        const timeRemaining = this.formatRemainingTime(
          sessionInfo.remainingMinutes
        );
        sessionText = `\n⏱️ ${timeRemaining} remaining in Afternoon session`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Checkout Reminder",
          body: `Don't forget to checkout! You've been working for ${workedHours}h ${workedMinutes}min today.${sessionText}`,
          data: { type: "checkout", checkInTime },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        // FIX: Use a trigger object instead of a Date object
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          hour: this.CHECKOUT_REMINDER_TIME.hour,
          minute: this.CHECKOUT_REMINDER_TIME.minute,
          repeats: false,
        },
      });

      this.notificationIds.set("checkout", notificationId);
      console.log(
        `Scheduled checkout reminder for ${this.CHECKOUT_REMINDER_TIME.hour}:${this.CHECKOUT_REMINDER_TIME.minute}`
      );
    }

    await this.saveScheduledNotifications();
  }

  // Show session notification when user logs in
  async showLoginSessionNotification() {
    if (!this.hasPermission) return;

    const sessionInfo = this.calculateSessionTime();
    let title = "👋 Welcome!";
    let body = "";

    if (sessionInfo.session === "FORENOON") {
      const timeRemaining = this.formatRemainingTime(
        sessionInfo.remainingMinutes
      );
      title = "☀️ Good Morning!";
      body = `You have ${timeRemaining} remaining in the Forenoon session (ends at ${sessionInfo.endTime}). Don't forget to mark your attendance!`;
    } else if (sessionInfo.session === "AFTERNOON") {
      const timeRemaining = this.formatRemainingTime(
        sessionInfo.remainingMinutes
      );
      title = "🌤️ Good Afternoon!";
      body = `You have ${timeRemaining} remaining in the Afternoon session (ends at ${sessionInfo.endTime}). Remember to mark attendance if you haven't!`;
    } else if (sessionInfo.session === "BEFORE_WORK") {
      const timeUntilWork = this.formatRemainingTime(
        sessionInfo.remainingMinutes
      );
      title = "🌅 Early Bird!";
      body = `Work starts in ${timeUntilWork} at ${sessionInfo.endTime}. Have a great day ahead!`;
    } else {
      title = "🌙 After Hours";
      body = `Working hours have ended for today. See you tomorrow at 9:30 AM!`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "session", sessionInfo },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null, // Show immediately
    });
  }

  // Cancel all attendance reminders
  async cancelAttendanceReminders() {
    const reminderTypes = ["morning", "afternoon", "evening"];
    for (const type of reminderTypes) {
      const id = this.notificationIds.get(`attendance_${type}`);
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
        this.notificationIds.delete(`attendance_${type}`);
      }
    }
    await this.saveScheduledNotifications();
  }

  // Cancel checkout reminder
  async cancelCheckoutReminder() {
    const id = this.notificationIds.get("checkout");
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      this.notificationIds.delete("checkout");
    }
    await this.saveScheduledNotifications();
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.notificationIds.clear();
    await AsyncStorage.removeItem("scheduled_notifications");
  }

  // Save scheduled notifications to storage
  private async saveScheduledNotifications() {
    try {
      const notifications = Array.from(this.notificationIds.entries());
      await AsyncStorage.setItem(
        "scheduled_notifications",
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Error saving scheduled notifications:", error);
    }
  }

  // Load scheduled notifications from storage
  private async loadScheduledNotifications() {
    try {
      const stored = await AsyncStorage.getItem("scheduled_notifications");
      if (stored) {
        const notifications = JSON.parse(stored);
        this.notificationIds = new Map(notifications);
      }
    } catch (error) {
      console.error("Error loading scheduled notifications:", error);
    }
  }

  // Update notifications based on attendance status
  async updateNotificationsForAttendanceStatus(
    hasMarkedAttendance: boolean,
    hasCheckedOut: boolean,
    checkInTime?: string
  ) {
    if (hasMarkedAttendance) {
      // Cancel attendance reminders if attendance is marked
      await this.cancelAttendanceReminders();

      // Schedule checkout reminder if not checked out
      if (!hasCheckedOut && checkInTime) {
        await this.scheduleCheckoutReminder(false, checkInTime);
      }
    } else {
      // Schedule attendance reminders if not marked
      await this.scheduleAttendanceReminders(false);
    }
  }

  // Test notification (for debugging)
  async sendTestNotification() {
    const sessionInfo = this.calculateSessionTime();
    let sessionText = "";

    if (
      sessionInfo.session === "FORENOON" ||
      sessionInfo.session === "AFTERNOON"
    ) {
      const timeRemaining = this.formatRemainingTime(
        sessionInfo.remainingMinutes
      );
      sessionText = `\n⏱️ Current session: ${sessionInfo.session}\nTime remaining: ${timeRemaining}\nEnds at: ${sessionInfo.endTime}`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Test Notification",
        body: `This is a test notification from the Attendance App.${sessionText}`,
        data: { type: "test" },
        sound: "default",
      },
      trigger: null,
    });
  }
}

export const notificationService = new NotificationService();
