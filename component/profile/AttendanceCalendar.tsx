// component/profile/AttendanceCalendar.tsx
import { colors } from "@/constants/colors";
import {
  AttendanceDate,
  AttendanceStatistics,
  getAttendanceCalendar,
  getMarkedDates,
} from "@/services/attendanceCalendarService";
import { useAttendanceStore } from "@/store/attendanceStore";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface AttendanceCalendarProps {
  empId: string;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  empId,
}) => {
  const [loading, setLoading] = useState(true);
  const [attendanceDates, setAttendanceDates] = useState<AttendanceDate[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isChangingMonth, setIsChangingMonth] = useState(false);

  const attendanceRecords = useAttendanceStore(
    (state) => state.attendanceRecords,
  );
  const todayAttendanceMarked = useAttendanceStore(
    (state) => state.todayAttendanceMarked,
  );
  const { fieldTripDates, userLocationType } = useAttendanceStore();

  const fetchAttendanceData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading && !isChangingMonth) setLoading(true);
        const response = await getAttendanceCalendar(
          empId,
          selectedYear,
          selectedMonth,
        );
        if (response.success && response.data) {
          setAttendanceDates(response.data.dates);
          setStatistics(response.data.statistics);
          setMarkedDates(getMarkedDates(response.data.dates));
        } else if (!isChangingMonth) {
          Alert.alert(
            "Error",
            response.error || "Failed to load attendance data",
          );
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        if (!isChangingMonth) {
          Alert.alert("Error", "Failed to load attendance data");
        }
      } finally {
        if (showLoading && !isChangingMonth) setLoading(false);
        setIsChangingMonth(false);
      }
    },
    [empId, selectedYear, selectedMonth, isChangingMonth],
  );

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (selectedMonth === currentMonth && selectedYear === currentYear) {
      const todayRecord = attendanceRecords.find(
        (record) => record.date === today,
      );
      if (todayRecord || todayAttendanceMarked) {
        const timeoutId = setTimeout(() => {
          fetchAttendanceData(false);
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    attendanceRecords,
    todayAttendanceMarked,
    selectedMonth,
    selectedYear,
    fetchAttendanceData,
  ]);

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceData(false);
    }, [fetchAttendanceData]),
  );

  const handleRefresh = useCallback(() => {
    fetchAttendanceData(true);
  }, [fetchAttendanceData]);

  const onDayPress = useCallback((day: any) => {
    setSelectedDate(day.dateString);
  }, []);

  const onMonthChange = useCallback((month: any) => {
    setIsChangingMonth(true);
    setSelectedMonth(month.month);
    setSelectedYear(month.year);
  }, []);

  const isFieldTripDate = useCallback(
    (dateStr: string) => {
      return fieldTripDates.some((trip) => {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= start && checkDate <= end;
      });
    },
    [fieldTripDates],
  );

  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;

    const attendance = attendanceDates.find(
      (a) => a.date.split("T")[0] === selectedDate,
    );
    const isFieldTrip = isFieldTripDate(selectedDate);

    if (!attendance) {
      return (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={styles.selectedDateCard}
        >
          <Text style={styles.selectedDateTitle}>
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          {isFieldTrip ? (
            <View style={styles.fieldTripNoAttendanceContainer}>
              <FontAwesome6 name="route" size={32} color={colors.warning} />
              <Text style={styles.fieldTripNoAttendanceText}>
                Field Trip - No attendance marked
              </Text>
              <Text style={styles.fieldTripSubText}>
                Attendance can still be marked during field trips
              </Text>
            </View>
          ) : (
            <View style={styles.noAttendanceContainer}>
              <FontAwesome6
                name="calendar-xmark"
                size={32}
                color={colors.gray[400]}
              />
              <Text style={styles.noAttendanceText}>No attendance marked</Text>
            </View>
          )}
        </Animated.View>
      );
    }

    const getAttendanceStatus = () => {
      if (!attendance.attendance.isCheckedOut) {
        return {
          label: "In Progress",
          color: colors.warning,
          icon: "clock",
          backgroundColor: colors.warning + "20",
        };
      }
      if (attendance.attendance.attendanceType === "FULL_DAY") {
        return {
          label: "Full Day",
          color: colors.success,
          icon: "circle-check",
          backgroundColor: colors.success + "20",
        };
      }
      return {
        label: "Half Day",
        color: colors.info,
        icon: "circle-half-stroke",
        backgroundColor: colors.info + "20",
      };
    };

    const status = getAttendanceStatus();

    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={styles.selectedDateCard}
      >
        <Text style={styles.selectedDateTitle}>
          {new Date(attendance.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.attendanceBadge,
              {
                backgroundColor: status.backgroundColor,
                borderColor: status.color,
              },
            ]}
          >
            <FontAwesome6 name={status.icon} size={18} color={status.color} />
            <Text style={[styles.attendanceBadgeText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>

          {isFieldTrip && (
            <View
              style={[
                styles.fieldTripBadge,
                { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" },
              ]}
            >
              <FontAwesome6 name="route" size={16} color="#F59E0B" />
              <Text style={[styles.fieldTripBadgeText, { color: "#F59E0B" }]}>
                Field Trip
              </Text>
            </View>
          )}
        </View>

        <View style={styles.attendanceDetailsContainer}>
          {attendance.attendance.sessionType && (
            <View style={styles.attendanceDetailRow}>
              <FontAwesome6
                name="business-time"
                size={16}
                color={colors.primary[500]}
              />
              <Text style={styles.attendanceDetailLabel}>Session:</Text>
              <Text style={styles.attendanceDetailValue}>
                {attendance.attendance.sessionType}
              </Text>
            </View>
          )}

          <View style={styles.attendanceDetailRow}>
            <FontAwesome6
              name="location-dot"
              size={16}
              color={colors.primary[500]}
            />
            <Text style={styles.attendanceDetailLabel}>Location:</Text>
            <Text style={styles.attendanceDetailValue}>
              {attendance.attendance.takenLocation || "Not specified"}
            </Text>
          </View>

          <View style={styles.attendanceDetailRow}>
            <FontAwesome6
              name="right-to-bracket"
              size={16}
              color={colors.primary[500]}
            />
            <Text style={styles.attendanceDetailLabel}>Check-in:</Text>
            <Text style={styles.attendanceDetailValue}>
              {new Date(attendance.attendance.checkInTime).toLocaleTimeString()}
            </Text>
          </View>

          {attendance.attendance.checkOutTime && (
            <View style={styles.attendanceDetailRow}>
              <FontAwesome6
                name="right-from-bracket"
                size={16}
                color={colors.primary[500]}
              />
              <Text style={styles.attendanceDetailLabel}>Check-out:</Text>
              <Text style={styles.attendanceDetailValue}>
                {new Date(
                  attendance.attendance.checkOutTime,
                ).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {isFieldTrip && (
            <View style={styles.attendanceDetailRow}>
              <FontAwesome6
                name="info-circle"
                size={16}
                color={colors.info}
              />
              <Text style={styles.attendanceDetailLabel}>Note:</Text>
              <Text style={styles.attendanceDetailValue}>
                Attendance marked during field trip
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const enhancedMarkedDates = useMemo(() => {
    const marked = { ...markedDates };

    if (fieldTripDates.length > 0) {
      fieldTripDates.forEach((trip) => {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];

          if (marked[dateStr]) {
            marked[dateStr] = {
              ...marked[dateStr],
              customStyles: {
                ...marked[dateStr].customStyles,
                container: {
                  ...marked[dateStr].customStyles?.container,
                  borderWidth: 2,
                  borderColor: "#F59E0B",
                },
              },
            };
          } else {
            marked[dateStr] = {
              customStyles: {
                container: {
                  backgroundColor: "#FEF3C7",
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#F59E0B",
                },
                text: {
                  color: "#92400E",
                  fontWeight: "500",
                },
              },
            };
          }
        }
      });
    }

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary[500],
      };
    }

    return marked;
  }, [markedDates, fieldTripDates, selectedDate]);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: colors.white,
      calendarBackground: colors.white,
      textSectionTitleColor: colors.gray[600],
      selectedDayBackgroundColor: colors.primary[500],
      selectedDayTextColor: colors.white,
      todayTextColor: colors.primary[500],
      dayTextColor: colors.gray[800],
      textDisabledColor: colors.gray[300],
      dotColor: colors.success,
      selectedDotColor: colors.white,
      arrowColor: colors.primary[500],
      monthTextColor: colors.gray[800],
      indicatorColor: colors.primary[500],
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "bold" as const,
      textDayHeaderFontWeight: "600" as const,
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 14,
    }),
    [],
  );

  const renderStatisticsCard = () => {
    if (!statistics) return null;

    return (
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.statisticsCard}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statisticsHeader}>
            <Text style={styles.statisticsTitle}>Attendance Overview</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="arrows-rotate"
                size={16}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6
                  name="calendar-check"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.statValue}>
                {statistics.totalDays.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6 name="star" size={24} color={colors.white} />
              </View>
              <Text style={styles.statValue}>
                {statistics.totalFullDays || 0}
              </Text>
              <Text style={styles.statLabel}>Full Days</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6
                  name="star-half-stroke"
                  size={24}
                  color={colors.white}
                />
              </View>
              <Text style={styles.statValue}>
                {statistics.totalHalfDays || 0}
              </Text>
              <Text style={styles.statLabel}>Half Days</Text>
            </View>
          </View>

          {statistics.lastAttendance && (
            <View style={styles.lastAttendanceContainer}>
              <FontAwesome6 name="clock" size={14} color={colors.gray[200]} />
              <Text style={styles.lastAttendanceText}>
                Last attendance:{" "}
                {new Date(statistics.lastAttendance).toLocaleDateString()}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          colors={[colors.primary[500]]}
          tintColor={colors.primary[500]}
        />
      }
    >
      {renderStatisticsCard()}

      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>Attendance Calendar</Text>

        <Calendar
          current={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markingType="custom"
          markedDates={enhancedMarkedDates}
          theme={calendarTheme}
          style={styles.calendar}
          enableSwipeMonths={true}
          hideExtraDays={false}
          disableMonthChange={false}
          dayComponent={undefined}
        />
      </View>

      {renderSelectedDateInfo()}

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.success }]}
            />
            <Text style={styles.legendText}>Full Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.info }]}
            />
            <Text style={styles.legendText}>Half Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          {fieldTripDates.length > 0 && (
            <>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#F59E0B",
                      borderWidth: 2,
                      borderColor: "#92400E",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Field Trip + Attendance</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#FEF3C7",
                      borderWidth: 1,
                      borderColor: "#F59E0B",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Field Trip (No Attendance)</Text>
              </View>
            </>
          )}
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.gray[300] }]}
            />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray[600],
  },
  statisticsCard: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientContainer: {
    padding: 20,
  },
  statisticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[200],
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  lastAttendanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  lastAttendanceText: {
    fontSize: 14,
    color: colors.gray[200],
    marginLeft: 8,
  },
  calendarCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray[800],
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 12,
  },
  selectedDateCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 16,
  },
  attendanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  attendanceBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  noAttendanceContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAttendanceText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 12,
  },
  attendanceDetailsContainer: {
    gap: 12,
  },
  attendanceDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attendanceDetailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: "500",
  },
  attendanceDetailValue: {
    fontSize: 14,
    color: colors.gray[800],
    flex: 1,
  },
  legendCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: "25%",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.gray[600],
  },

  badgeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  fieldTripBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  fieldTripBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldTripNoAttendanceContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  fieldTripNoAttendanceText: {
    fontSize: 16,
    color: "#92400E",
    fontWeight: "600",
    marginTop: 12,
  },
  fieldTripSubText: {
    fontSize: 14,
    color: "#A16207",
    marginTop: 4,
    textAlign: "center",
  },
});