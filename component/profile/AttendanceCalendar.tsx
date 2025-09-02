// component/profile/AttendanceCalendar.tsx
import { colors } from "@/constants/colors";
import {
  AttendanceDate,
  AttendanceStatistics,
  getAttendanceCalendar,
  getCachedHolidays,
  getMarkedDates,
  Holiday,
} from "@/services/attendanceCalendarService";
import { useAttendanceStore } from "@/store/attendanceStore";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";
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
  employeeCode: string;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  employeeCode,
}) => {
  const [loading, setLoading] = useState(true);
  const [attendanceDates, setAttendanceDates] = useState<AttendanceDate[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState<any>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const attendanceRecords = useAttendanceStore(
    (state) => state.attendanceRecords
  );
  const todayAttendanceMarked = useAttendanceStore(
    (state) => state.todayAttendanceMarked
  );
  const { fieldTripDates } = useAttendanceStore();

  // Load holidays using the /api/calendar endpoint
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const cachedHolidays = await getCachedHolidays(
          selectedYear,
          selectedMonth
        );
        setHolidays(cachedHolidays);
      } catch (error) {
        console.error("Error loading holidays:", error);
        setHolidays([]);
      }
    };
    loadHolidays();
  }, [selectedYear, selectedMonth]);

  const fetchAttendanceData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading && !isChangingMonth) setLoading(true);
        const response = await getAttendanceCalendar(
          employeeCode,
          selectedYear,
          selectedMonth
        );
        if (response.success && response.data) {
          // Map backend 'attendances' to frontend 'AttendanceDate' structure
          const mappedDates: AttendanceDate[] = response.data.attendances.map(
            (a: any) => ({
              date: a.attendanceCalendar.day.split("T")[0],
              present: a.attendanceCalendar.present,
              absent: a.attendanceCalendar.absent,
              attendance: {
                takenLocation: a.attendanceType.takenLocation || null,
                checkinTime: a.attendanceType.checkinTime || null,
                checkoutTime: a.attendanceType.checkoutTime || null,
                sessionType: a.attendanceType.attendanceGivenTime,
                fullDay: a.attendanceType.fullDay,
                halfDay: a.attendanceType.halfDay,
                isCheckout: a.attendanceType.isCheckout,
              },
            })
          );
          setAttendanceDates(mappedDates);
          setStatistics(response.data.statistics);
          // Get marked dates with holidays
          const marked = getMarkedDates(mappedDates, holidays);
          setMarkedDates(marked);
        } else if (!isChangingMonth) {
          Alert.alert(
            "Error",
            response.error || "Failed to load attendance data"
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
    [employeeCode, selectedYear, selectedMonth, holidays, isChangingMonth]
  );

  useEffect(() => {
    if (holidays.length > 0) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, holidays]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    if (selectedMonth === currentMonth && selectedYear === currentYear) {
      const todayRecord = attendanceRecords.find(
        (record) => record.date === today
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
      if (holidays.length > 0) {
        fetchAttendanceData(false);
      }
    }, [fetchAttendanceData, holidays])
  );

  const isFieldTrip = useMemo(() => {
    if (!selectedDate || !fieldTripDates || !Array.isArray(fieldTripDates))
      return false;
    return fieldTripDates.some((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const checkDate = new Date(selectedDate);
      return checkDate >= start && checkDate <= end;
    });
  }, [selectedDate, fieldTripDates]);

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

  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;
    const attendance = attendanceDates.find((a) => a.date === selectedDate);
    const holiday = holidays.find((h) => h.date === selectedDate);

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

          {holiday ? (
            <View style={styles.holidayContainer}>
              <FontAwesome6
                name={holiday.isWeekend ? "calendar-week" : "calendar-xmark"}
                size={32}
                color={colors.warning}
              />
              <Text style={styles.holidayText}>{holiday.description}</Text>
              <Text style={styles.holidaySubText}>
                {holiday.isWeekend ? "Weekend" : "Holiday"}
              </Text>
            </View>
          ) : isFieldTrip ? (
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
      if (attendance.present === 0) {
        return {
          label: "Absent",
          color: colors.error,
          icon: "calendar-xmark",
          backgroundColor: colors.error + "20",
        };
      }

      if (!attendance.attendance) {
        return {
          label: "Present",
          color: colors.success,
          icon: "check",
          backgroundColor: colors.success + "20",
        };
      }

      if (!attendance.attendance.isCheckout) {
        return {
          label: "In Progress",
          color: colors.warning,
          icon: "clock",
          backgroundColor: colors.warning + "20",
        };
      }

      // If checked out, just show as Present (details will show full/half day)
      return {
        label: "Present",
        color: colors.success,
        icon: "circle-check",
        backgroundColor: colors.success + "20",
      };
    };

    const status = getAttendanceStatus();

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

          {holiday && (
            <View
              style={[
                styles.holidayBadge,
                {
                  backgroundColor: holiday.isWeekend ? "#E0E7FF" : "#FEF3C7",
                  borderColor: holiday.isWeekend ? "#6366F1" : "#F59E0B",
                },
              ]}
            >
              <FontAwesome6
                name={holiday.isWeekend ? "calendar-week" : "calendar-xmark"}
                size={16}
                color={holiday.isWeekend ? "#6366F1" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.holidayBadgeText,
                  { color: holiday.isWeekend ? "#6366F1" : "#F59E0B" },
                ]}
              >
                {holiday.description}
              </Text>
            </View>
          )}
        </View>

        {attendance.attendance && attendance.present === 1 && (
          <View style={styles.attendanceDetailsContainer}>
            {/* Show Full Day or Half Day status for present days */}
            {attendance.attendance.isCheckout && (
              <View style={styles.attendanceDetailRow}>
                <FontAwesome6
                  name="calendar-day"
                  size={16}
                  color={colors.primary[500]}
                />
                <Text style={styles.attendanceDetailLabel}>Day Type:</Text>
                <Text style={styles.attendanceDetailValue}>
                  {attendance.attendance.fullDay ? "Full Day" : "Half Day"}
                </Text>
              </View>
            )}

            {attendance.attendance.sessionType && (
              <View style={styles.attendanceDetailRow}>
                <FontAwesome6
                  name="business-time"
                  size={16}
                  color={colors.primary[500]}
                />
                <Text style={styles.attendanceDetailLabel}>Session:</Text>
                <Text style={styles.attendanceDetailValue}>
                  {attendance.attendance.sessionType === "FN"
                    ? "Forenoon"
                    : "Afternoon"}
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

            {attendance.attendance.checkinTime && (
              <View style={styles.attendanceDetailRow}>
                <FontAwesome6
                  name="right-to-bracket"
                  size={16}
                  color={colors.primary[500]}
                />
                <Text style={styles.attendanceDetailLabel}>Check-in:</Text>
                <Text style={styles.attendanceDetailValue}>
                  {new Date(
                    attendance.attendance.checkinTime
                  ).toLocaleTimeString()}
                </Text>
              </View>
            )}

            {attendance.attendance.checkoutTime && (
              <View style={styles.attendanceDetailRow}>
                <FontAwesome6
                  name="right-from-bracket"
                  size={16}
                  color={colors.primary[500]}
                />
                <Text style={styles.attendanceDetailLabel}>Check-out:</Text>
                <Text style={styles.attendanceDetailValue}>
                  {new Date(
                    attendance.attendance.checkoutTime
                  ).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  // Calculate simplified statistics
  const getSimplifiedStatistics = () => {
    if (!attendanceDates || attendanceDates.length === 0) {
      return { present: 0, absent: 0, inProgress: 0, holidays: holidays.length };
    }

    const present = attendanceDates.filter(
      (a) => a.present === 1 && a.attendance?.isCheckout
    ).length;
    const inProgress = attendanceDates.filter(
      (a) => a.present === 1 && !a.attendance?.isCheckout
    ).length;
    const absent = attendanceDates.filter((a) => a.present === 0).length;

    return {
      present,
      absent,
      inProgress,
      holidays: holidays.length,
    };
  };

  const simplifiedStats = getSimplifiedStatistics();

  const enhancedMarkedDates = useMemo(() => {
    const marked = { ...markedDates };
    // Handle field trip dates - add proper null/undefined checks
    if (
      fieldTripDates &&
      Array.isArray(fieldTripDates) &&
      fieldTripDates.length > 0
    ) {
      fieldTripDates.forEach((trip) => {
        if (!trip || !trip.startDate || !trip.endDate) return;

        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

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
    []
  );

  // Simplified Statistics Card
  const renderSimplifiedStatisticsCard = () => {
    return (
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.statisticsCard}
      >
        <View style={styles.simpleStatsContainer}>
          <View style={styles.simpleStatHeader}>
            <Text style={styles.simpleStatTitle}>Monthly Summary</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="arrows-rotate"
                size={16}
                color={colors.gray[700]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.simpleStatsGrid}>
            <View style={styles.simpleStatItem}>
              <View
                style={[
                  styles.simpleStatIcon,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <FontAwesome6
                  name="circle-check"
                  size={20}
                  color={colors.success}
                />
              </View>
              <Text style={styles.simpleStatValue}>{simplifiedStats.present}</Text>
              <Text style={styles.simpleStatLabel}>Present</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <View
                style={[
                  styles.simpleStatIcon,
                  { backgroundColor: colors.error + "20" },
                ]}
              >
                <FontAwesome6 name="circle-xmark" size={20} color={colors.error} />
              </View>
              <Text style={styles.simpleStatValue}>{simplifiedStats.absent}</Text>
              <Text style={styles.simpleStatLabel}>Absent</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <View
                style={[
                  styles.simpleStatIcon,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
                <FontAwesome6 name="clock" size={20} color={colors.warning} />
              </View>
              <Text style={styles.simpleStatValue}>
                {simplifiedStats.inProgress}
              </Text>
              <Text style={styles.simpleStatLabel}>In Progress</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <View
                style={[
                  styles.simpleStatIcon,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <FontAwesome6
                  name="calendar-week"
                  size={20}
                  color={colors.info}
                />
              </View>
              <Text style={styles.simpleStatValue}>
                {simplifiedStats.holidays}
              </Text>
              <Text style={styles.simpleStatLabel}>Holidays</Text>
            </View>
          </View>
        </View>
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
      {renderSimplifiedStatisticsCard()}

      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>Attendance Calendar</Text>

        <Calendar
          current={`${selectedYear}-${String(selectedMonth).padStart(
            2,
            "0"
          )}-01`}
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
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.error }]}
            />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E0E7FF" }]} />
            <Text style={styles.legendText}>Weekend</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FEF3C7" }]} />
            <Text style={styles.legendText}>Holiday</Text>
          </View>
          {fieldTripDates &&
            Array.isArray(fieldTripDates) &&
            fieldTripDates.length > 0 && (
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#FEF3C7",
                      borderWidth: 2,
                      borderColor: "#F59E0B",
                    },
                  ]}
                />
                <Text style={styles.legendText}>Field Trip</Text>
              </View>
            )}
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
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleStatsContainer: {
    padding: 20,
  },
  simpleStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  simpleStatTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.gray[800],
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  simpleStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  simpleStatItem: {
    flex: 1,
    alignItems: "center",
  },
  simpleStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  simpleStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray[800],
    marginBottom: 4,
  },
  simpleStatLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  simpleStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.gray[200],
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
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
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
  holidayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  holidayBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  holidayContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  holidayText: {
    fontSize: 16,
    color: "#92400E",
    fontWeight: "600",
    marginTop: 12,
  },
  holidaySubText: {
    fontSize: 14,
    color: "#A16207",
    marginTop: 4,
    textAlign: "center",
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