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

// Brutalist Color Palette
const brutalistColors = {
  background: "#FFFFFF",
  text: "#000000",
  border: "#000000",
  primary: "#000000",
  white: "#FFFFFF",
  present: "#34D399", // A strong green
  absent: "#F87171", // A strong red
  inProgress: "#f1eabfff", // A strong yellow/amber
  holiday: "#F59E0B", // A strong orange for holidays
  weekend: "#818CF8", // A strong indigo/purple for weekends
  fieldTrip: "#F59E0B",
  disabled: "#D1D5DB",
};

interface AttendanceCalendarProps {
  employeeCode: string;
}

// A reusable wrapper for the brutalist card style
const BrutalistCard: React.FC<{ children: React.ReactNode; style?: any }> = ({
  children,
  style,
}) => (
  <View style={styles.brutalistCardWrapper}>
    <View style={[styles.brutalistCard, style]}>{children}</View>
  </View>
);

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
        <Animated.View entering={FadeInUp.duration(300)}>
          <BrutalistCard>
            <Text style={styles.selectedDateTitle}>
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {holiday ? (
              <View style={styles.noDataContainer}>
                <FontAwesome6
                  name={holiday.isWeekend ? "calendar-week" : "calendar-xmark"}
                  size={32}
                  color={holiday.isWeekend ? brutalistColors.weekend : brutalistColors.holiday}
                />
                <Text style={styles.noDataText}>{holiday.description}</Text>
                <Text style={styles.noDataSubText}>
                  {holiday.isWeekend ? "Weekend" : "Holiday"}
                </Text>
              </View>
            ) : isFieldTrip ? (
              <View style={styles.noDataContainer}>
                <FontAwesome6
                  name="route"
                  size={32}
                  color={brutalistColors.fieldTrip}
                />
                <Text style={styles.noDataText}>
                  Field Trip - No attendance marked
                </Text>
                <Text style={styles.noDataSubText}>
                  Attendance can still be marked during field trips
                </Text>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <FontAwesome6
                  name="calendar-xmark"
                  size={32}
                  color={brutalistColors.text}
                />
                <Text style={styles.noDataText}>No attendance marked</Text>
              </View>
            )}
          </BrutalistCard>
        </Animated.View>
      );
    }

    const getAttendanceStatus = () => {
      if (attendance.present === 0) {
        return {
          label: "Absent",
          color: brutalistColors.absent,
          icon: "calendar-xmark",
        };
      }

      if (!attendance.attendance) {
        return {
          label: "Present",
          color: brutalistColors.present,
          icon: "check",
        };
      }

      if (!attendance.attendance.isCheckout) {
        return {
          label: "In Progress",
          color: brutalistColors.inProgress,
          icon: "clock",
        };
      }

      // If checked out, just show as Present
      return {
        label: "Present",
        color: brutalistColors.present,
        icon: "circle-check",
      };
    };

    const status = getAttendanceStatus();

    return (
      <Animated.View entering={FadeInUp.duration(300)}>
        <BrutalistCard>
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
                  backgroundColor: status.color,
                },
              ]}
            >
              <FontAwesome6
                name={status.icon}
                size={16}
                color={brutalistColors.white}
              />
              <Text
                style={[
                  styles.attendanceBadgeText,
                  { color: brutalistColors.white },
                ]}
              >
                {status.label}
              </Text>
            </View>

            {isFieldTrip && (
              <View
                style={[
                  styles.attendanceBadge,
                  { backgroundColor: brutalistColors.fieldTrip },
                ]}
              >
                <FontAwesome6
                  name="route"
                  size={16}
                  color={brutalistColors.white}
                />
                <Text
                  style={[
                    styles.attendanceBadgeText,
                    { color: brutalistColors.white },
                  ]}
                >
                  Field Trip
                </Text>
              </View>
            )}

            {holiday && (
              <View
                style={[
                  styles.attendanceBadge,
                  {
                    backgroundColor: holiday.isWeekend ? brutalistColors.weekend : brutalistColors.holiday,
                  },
                ]}
              >
                <FontAwesome6
                  name={holiday.isWeekend ? "calendar-week" : "calendar-xmark"}
                  size={16}
                  color={brutalistColors.white}
                />
                <Text
                  style={[
                    styles.attendanceBadgeText,
                    { color: brutalistColors.white },
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
                    color={brutalistColors.text}
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
                    color={brutalistColors.text}
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
                  color={brutalistColors.text}
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
                    color={brutalistColors.text}
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
                    color={brutalistColors.text}
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
        </BrutalistCard>
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
    
    // Handle field trip dates
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
                  borderWidth: 3,
                  borderColor: brutalistColors.fieldTrip,
                },
              },
            };
          } else {
            marked[dateStr] = {
              customStyles: {
                container: {
                  backgroundColor: brutalistColors.background,
                  borderWidth: 3,
                  borderColor: brutalistColors.fieldTrip,
                },
                text: {
                  color: brutalistColors.text,
                  fontWeight: "600",
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
        selectedColor: brutalistColors.primary,
        selectedTextColor: brutalistColors.white,
      };
    }

    return marked;
  }, [markedDates, fieldTripDates, selectedDate]);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: brutalistColors.background,
      calendarBackground: brutalistColors.background,
      textSectionTitleColor: brutalistColors.text,
      selectedDayBackgroundColor: brutalistColors.primary,
      selectedDayTextColor: brutalistColors.white,
      todayTextColor: brutalistColors.primary,
      dayTextColor: brutalistColors.text,
      textDisabledColor: brutalistColors.disabled,
      dotColor: brutalistColors.present,
      selectedDotColor: brutalistColors.white,
      arrowColor: brutalistColors.primary,
      monthTextColor: brutalistColors.text,
      indicatorColor: brutalistColors.primary,
      textDayFontWeight: "600" as const,
      textMonthFontWeight: "900" as const,
      textDayHeaderFontWeight: "700" as const,
      textDayFontSize: 16,
      textMonthFontSize: 20,
      textDayHeaderFontSize: 14,
      "stylesheet.calendar.header": {
        week: {
          marginTop: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 3,
          borderColor: brutalistColors.border,
          paddingBottom: 10,
        },
      },
    }),
    []
  );

  // Simplified Statistics Card with brutalist styling
  const renderSimplifiedStatisticsCard = () => {
    return (
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <BrutalistCard>
          <View style={styles.headerContainer}>
            <Text style={styles.cardTitle}>MONTHLY SUMMARY</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="arrows-rotate"
                size={18}
                color={brutalistColors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.simpleStatsGrid}>
            <View style={styles.simpleStatItem}>
              <Text style={[styles.simpleStatValue, { color: brutalistColors.present }]}>
                {simplifiedStats.present}
              </Text>
              <Text style={styles.simpleStatLabel}>Present</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <Text style={[styles.simpleStatValue, { color: brutalistColors.absent }]}>
                {simplifiedStats.absent}
              </Text>
              <Text style={styles.simpleStatLabel}>Absent</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <Text style={[styles.simpleStatValue, { color: brutalistColors.inProgress }]}>
                {simplifiedStats.inProgress}
              </Text>
              <Text style={styles.simpleStatLabel}>In Progress</Text>
            </View>

            <View style={styles.simpleStatDivider} />

            <View style={styles.simpleStatItem}>
              <Text style={[styles.simpleStatValue, { color: brutalistColors.holiday }]}>
                {simplifiedStats.holidays}
              </Text>
              <Text style={styles.simpleStatLabel}>Holidays</Text>
            </View>
          </View>
        </BrutalistCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brutalistColors.primary} />
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
          colors={[brutalistColors.primary]}
          tintColor={brutalistColors.primary}
        />
      }
    >
      {renderSimplifiedStatisticsCard()}

      <BrutalistCard>
        <Text style={styles.cardTitle}>ATTENDANCE CALENDAR</Text>
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
        />
      </BrutalistCard>

      {renderSelectedDateInfo()}

      <BrutalistCard>
        <Text style={styles.cardTitle}>LEGEND</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: brutalistColors.present }]}
            />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: brutalistColors.absent }]}
            />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: brutalistColors.inProgress }]}
            />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: brutalistColors.weekend }]} />
            <Text style={styles.legendText}>Weekend</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: brutalistColors.holiday }]} />
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
                      backgroundColor: brutalistColors.background,
                      borderWidth: 3,
                      borderColor: brutalistColors.fieldTrip,
                    },
                  ]}
                />
                <Text style={styles.legendText}>Field Trip</Text>
              </View>
            )}
        </View>
      </BrutalistCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offwhite,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: brutalistColors.text,
  },
  // Brutalist Card Styling
  brutalistCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: brutalistColors.border,
    transform: [{ translateX: 6 }, { translateY: 6 }],
  },
  brutalistCard: {
    padding: 20,
    borderWidth: 3,
    borderColor: brutalistColors.border,
    backgroundColor: brutalistColors.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: brutalistColors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: brutalistColors.text,
    textTransform: "uppercase",
  },
  refreshButton: {
    borderWidth: 2,
    borderColor: brutalistColors.border,
    padding: 8,
  },
  simpleStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  simpleStatItem: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  simpleStatValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  simpleStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: brutalistColors.text,
    marginTop: 4,
    textTransform: "uppercase",
  },
  simpleStatDivider: {
    width: 2,
    height: 50,
    backgroundColor: brutalistColors.border,
  },
  calendar: {
    marginTop: 16,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: brutalistColors.text,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderColor: brutalistColors.border,
    paddingBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  attendanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: brutalistColors.border,
  },
  attendanceBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "700",
    color: brutalistColors.text,
    marginTop: 12,
    textAlign: "center",
  },
  noDataSubText: {
    fontSize: 14,
    fontWeight: "500",
    color: brutalistColors.text,
    marginTop: 4,
    textAlign: "center",
  },
  attendanceDetailsContainer: {
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: brutalistColors.border,
  },
  attendanceDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attendanceDetailLabel: {
    fontSize: 14,
    color: brutalistColors.text,
    fontWeight: "700",
    width: 90,
  },
  attendanceDetailValue: {
    fontSize: 14,
    color: brutalistColors.text,
    fontWeight: "500",
    flex: 1,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: brutalistColors.border,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "600",
    color: brutalistColors.text,
  },
});