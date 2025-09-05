// component/attendance/HolidayScreen.tsx
import { colors } from "@/constants/colors";
import { Holiday } from "@/services/attendanceCalendarService";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface HolidayScreenProps {
  holidayInfo: Holiday;
}

export function HolidayScreen({ holidayInfo }: HolidayScreenProps) {
  const isWeekend = holidayInfo.isWeekend;

  const getIcon = () => (isWeekend ? "calendar-week" : "calendar-xmark");
  const getBgColor = () => (isWeekend ? "#6366F1" : "#F59E0B");
  const getEmoji = () => (isWeekend ? "🌴" : "🎉");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={[styles.headerCard, { backgroundColor: getBgColor() }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name={getIcon()} size={48} color={"#fff"} />
          </View>
          <Text style={styles.emoji}>{getEmoji()}</Text>
          <Text style={styles.headerTitle}>
            {isWeekend ? "Weekend Time!" : "Holiday!"}
          </Text>
          <Text style={styles.headerSubtitle}>{holidayInfo.description}</Text>
        </View>
      </Animated.View>

      {/* Main Content Card */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.contentCard}
      >
        <View style={styles.messageContainer}>
          <FontAwesome6
            name="circle-info"
            size={20}
            color={isWeekend ? "#000" : "#000"}
          />
          <Text style={styles.messageTitle}>No Attendance Today</Text>
          <Text style={styles.messageText}>
            {isWeekend
              ? "It's the weekend! Enjoy your time off and recharge for the upcoming week."
              : `Today is a holiday (${holidayInfo.description}). Attendance marking is not required.`}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Today's Date */}
        <View style={styles.dateContainer}>
          <FontAwesome6 name="calendar-day" size={18} color={"#000"} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {isWeekend ? "Weekend Tips" : "Holiday Reminder"}
          </Text>
          <View style={styles.tipItem}>
            <FontAwesome6 name="clock" size={14} color={"#000"} />
            <Text style={styles.tipText}>
              {isWeekend
                ? "Working hours resume on Monday at 9:30 AM"
                : "Regular attendance will resume on the next working day"}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome6 name="bell" size={14} color={"#000"} />
            <Text style={styles.tipText}>
              You&apos;ll receive a reminder notification for the next working day
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Quote Block */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.bottomCard}
      >
        <Text style={styles.quoteText}>
          {isWeekend
            ? '"Take rest; a field that has rested gives a bountiful crop."'
            : '"A holiday is an opportunity to journey within."'}
        </Text>
        <Text style={styles.quoteAuthor}>
          {isWeekend ? "- Ovid" : "- Prabhas"}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offwhite,
    marginTop: 64,
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 0,
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#00000022",
  },
  emoji: {
    fontSize: 42,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  contentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 0,
  },
  messageContainer: {
    alignItems: "center",
    gap: 8,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
  },
  messageText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    lineHeight: 20,
  },
  divider: {
    height: 2,
    backgroundColor: "#000",
    marginVertical: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  tipsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 0,
    gap: 10,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#000",
    lineHeight: 18,
  },
  bottomCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 0,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  quoteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
});
