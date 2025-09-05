// services/attendanceCalendarService.ts
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export interface AttendanceDate {
  date: string;
  present: number;
  absent: number;
  attendance?: {
    takenLocation: string | null;
    checkinTime: string | null;
    checkoutTime: string | null;
    sessionType?: 'FN' | 'AF';
    fullDay: boolean;
    halfDay: boolean;
    isCheckout: boolean;
  };
}
export interface Holiday {
  date: string;
  description: string;
  isHoliday: boolean;
  isWeekend: boolean;
}
export interface AttendanceStatistics {
  totalDays: number;
  totalFullDays: number;
  totalHalfDays: number;
  notCheckedOut: number;
  year: number;
  month?: number;
}
// Axios client with auth headers
const createApiClient = () => {
  const authHeaders = useAuthStore.getState().getAuthHeaders();
  return axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
};
// Holidays: fetch from /calendar API and cache (per month/year)
export const getCachedHolidays = async (year: number, month: number): Promise<Holiday[]> => {
  const cacheKey = `cached_holidays_${year}_${month}`;
  try {
    // 1. Try local cache first
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as Holiday[];
    // 2. Not cached → fetch from backend using /calendar?year=&month=
    const apiClient = createApiClient();
    const { data } = await apiClient.get<{ success: boolean; data: { entries: any[] } }>('/calendar', {
      params: { year, month }
    });
    // 3. Map to Holiday interface
    const holidays: Holiday[] = data.data.entries.map((entry) => ({
      date: entry.date.split('T')[0],
      description: entry.description,
      isHoliday: entry.isHoliday,
      isWeekend: entry.isWeekend,
    }));
    // 4. Persist and return
    await AsyncStorage.setItem(cacheKey, JSON.stringify(holidays));
    return holidays;
  } catch (error) {
    console.error('Error loading holidays:', error);
    return []; // No static fallback
  }
};
// Attendance calendar
export const getAttendanceCalendar = async (
  employeeNumber: string,
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: { dates: AttendanceDate[]; statistics: AttendanceStatistics }; error?: string }> => {
  try {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const apiClient = createApiClient();
    const { data } = await apiClient.get(`/attendance/calendar/${employeeNumber}`, {
      params,
    });

    return {
      success: data.success,
      data: data.data, // Backend returns { attendances, statistics }, remapped in component
    };
  } catch (error: any) {
    console.error('Get attendance calendar error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch attendance calendar',
    };
  }
};
// Marked dates helper for calendar UI

export const getMarkedDates = (
  attendanceDates: AttendanceDate[],
  holidays: Holiday[]
) => {
  const marked: { [key: string]: any } = {};
  
  // Get current hour to check if it's after 11 PM
  const currentHour = new Date().getHours();
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Attendance entries - simplified color scheme
  attendanceDates.forEach((item) => {
    const dateStr = item.date.split('T')[0];
    let dotColor = '#9CA3AF'; // Gray for absent
    let backgroundColor = '#F3F4F6';
    let textColor = '#1F2937';
    

    if (item.present === 1) {
      if (item.attendance) {
        // Special handling for today's attendance after 11 PM
        if (dateStr === today && currentHour >= 23 && !item.attendance.isCheckout) {
          // After 11 PM, show as Present even if not checked out
          dotColor = '#10B981'; // Success
          backgroundColor = '#D1FAE5';
          textColor = '#065F46';
        } else if (!item.attendance.isCheckout) {
          // Before 11 PM or other days - show as In Progress
          dotColor = '#F59E0B'; // Warning
          backgroundColor = '#FEF3C7';
          textColor = '#92400E';
        } else {
          // Present (checked out - regardless of full/half day)
          dotColor = '#10B981'; // Success
          backgroundColor = '#D1FAE5';
          textColor = '#065F46';
        }
      }
    }
    

    marked[dateStr] = {
      marked: true,
      dotColor,
      selected: false,
      selectedColor: dotColor,
      customStyles: {
        container: {
          backgroundColor,
          borderRadius: 6,
        },
        text: {
          color: textColor,
          fontWeight: 'bold',
        },
      },
    };
  });
  
  // 2. Holidays & weekends
  holidays.forEach((h) => {
    const dateStr = h.date.split('T')[0] || h.date;
    if (!marked[dateStr]) {
      marked[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: h.isWeekend ? '#E0E7FF' : '#FEF3C7',
            borderRadius: 6,
          },
          text: {
            color: h.isWeekend ? '#6366F1' : '#92400E',
            fontWeight: '500',
          },
        },
      };
    }
  });
  
  return marked;
};