// store/attendanceStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraCapturedPicture } from "expo-camera";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getUserData } from "../services/UserId";
import { AudioRecording, ViewMode } from "../types/attendance";
// Hello Kritika
interface AttendanceRecord {
  date: string;
  timestamp: number;
  location: string;
  photosCount: number;
  hasAudio: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  sessionType?: "FORENOON" | "AFTERNOON";
  attendanceType?: "FULL_DAY" | "HALF_DAY";
  isCheckedOut?: boolean;
  takenLocation?: string;
  attendanceKey?: string;
}

export type PhotoPosition = "front" | "left" | "right";

interface AttendanceState {
  userId: string | null;
  isLoadingUserId: boolean;
  isInitialized: boolean;
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  currentView: ViewMode;
  uploading: boolean;
  currentPhotoIndex: number;
  retakeMode: boolean;
  selectedLocationLabel: string | null;
  TOTAL_PHOTOS: number;
  attendanceRecords: AttendanceRecord[];
  todayAttendanceMarked: boolean;
  currentSessionPhotoPosition: PhotoPosition | null;
  lastAttendanceUpdate: number;

  // Field trip related state
  userLocationType: "CAMPUS" | "FIELDTRIP" | null;
  isFieldTrip: boolean;
  fieldTripDates: { startDate: string; endDate: string }[];

  // Session & checkout
  currentSessionType: "FORENOON" | "AFTERNOON" | null;
  canCheckout: boolean;

  // Department
  department: string | null;

  // Actions
  initializeUserId: () => Promise<void>;
  setUserId: (userId: string | null) => void;
  clearUserId: () => void;
  setPhotos: (photos: CameraCapturedPicture[]) => void;
  setAudioRecording: (recording: AudioRecording | null) => void;
  setCurrentView: (view: ViewMode) => void;
  setCurrentPhotoIndex: (index: number) => void;
  setRetakeMode: (mode: boolean) => void;
  setSelectedLocationLabel: (label: string | null) => void;
  setUploading: (uploading: boolean) => void;
  markAttendanceForToday: (location: string) => void;
  checkTodayAttendance: () => boolean;
  getTodayPhotoPosition: () => PhotoPosition;
  generateNewPhotoPosition: () => PhotoPosition;
  resetAll: () => void;
  fetchTodayAttendanceFromServer: () => Promise<boolean>;
  triggerAttendanceUpdate: () => void;
  refreshAttendanceData: () => Promise<void>;
  setUserLocationType: (type: "CAMPUS" | "FIELDTRIP" | null) => void;
  checkFieldTripStatus: () => Promise<void>;
  fetchUserLocationSettings: () => Promise<void>;

  // Checkout & session helpers
  checkoutAttendance: () => Promise<boolean>;
  getCurrentSessionType: () => "FORENOON" | "AFTERNOON" | "OUTSIDE";

  // Department setter
  setDepartment: (department: string) => void;
  fetchUserDepartment: () => Promise<void>;

  // Add this new action
  updateInProgressToPresent: () => Promise<void>;
  startAutoUpdateTimer: () => void;
  stopAutoUpdateTimer: () => void;
  autoUpdateTimerId: ReturnType<typeof setInterval> | null;
}

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const generateRandomPhotoPosition = (): PhotoPosition => {
  const positions: PhotoPosition[] = ["front", "left", "right"];
  return positions[Math.floor(Math.random() * positions.length)];
};

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      isLoadingUserId: false,
      isInitialized: false,
      photos: [],
      audioRecording: null,
      currentView: "home",
      uploading: false,
      currentPhotoIndex: 0,
      retakeMode: false,
      selectedLocationLabel: null,
      TOTAL_PHOTOS: 1,
      attendanceRecords: [],
      todayAttendanceMarked: false,
      currentSessionPhotoPosition: null,
      lastAttendanceUpdate: 0,

      // Field trip state
      userLocationType: null,
      isFieldTrip: false,
      fieldTripDates: [],

      // Session & checkout
      currentSessionType: null,
      canCheckout: false,

      // NEW
      department: null,
      autoUpdateTimerId: null,

      // Actions
      initializeUserId: async () => {
        try {
          set({ isLoadingUserId: true });
          const userData = await getUserData();

          if (userData?.isLoggedIn) {
            set({
              userId: userData.name,
              isLoadingUserId: false,
              isInitialized: true,
            });

            // Start the auto-update timer
            get().startAutoUpdateTimer();

            // Fetch user location settings first, then department, then attendance
            await get().fetchUserLocationSettings();
            await get().fetchUserDepartment();
            await get().fetchTodayAttendanceFromServer();
          } else {
            set({
              userId: null,
              isLoadingUserId: false,
              isInitialized: true,
              todayAttendanceMarked: false,
            });
          }
        } catch (err) {
          console.error("Error initializing user ID:", err);
          set({
            userId: null,
            isLoadingUserId: false,
            isInitialized: true,
            todayAttendanceMarked: false,
          });
        }
      },

      setUserId: (userId) => {
        set({
          userId,
          isInitialized: true,
          isLoadingUserId: false,
          todayAttendanceMarked: false,
          attendanceRecords: [],
          lastAttendanceUpdate: Date.now(),
          currentSessionType: null,
          canCheckout: false,
        });

        if (userId) {
          setTimeout(async () => {
            await get().fetchUserLocationSettings();
            await get().fetchUserDepartment();
            await get().fetchTodayAttendanceFromServer();
          }, 100);
        }
      },

      clearUserId: () => {
        get().stopAutoUpdateTimer();
        set({
          userId: null,
          photos: [],
          audioRecording: null,
          currentView: "home",
          currentPhotoIndex: 0,
          retakeMode: false,
          selectedLocationLabel: null,
          currentSessionPhotoPosition: null,
          todayAttendanceMarked: false,
          attendanceRecords: [],
          lastAttendanceUpdate: Date.now(),
          userLocationType: null,
          isFieldTrip: false,
          fieldTripDates: [],
          currentSessionType: null,
          canCheckout: false,
          department: null,
          autoUpdateTimerId: null,
        });
      },

      setPhotos: (photos) => set({ photos }),
      setAudioRecording: (recording) => set({ audioRecording: recording }),

      setCurrentView: (view) => {
        const state = get();
        if (
          view === "camera" &&
          !state.retakeMode &&
          !state.currentSessionPhotoPosition
        ) {
          set({
            currentView: view,
            currentSessionPhotoPosition: generateRandomPhotoPosition(),
          });
        } else {
          set({ currentView: view });
        }
      },

      setCurrentPhotoIndex: (i) => set({ currentPhotoIndex: i }),
      setRetakeMode: (m) => set({ retakeMode: m }),
      setSelectedLocationLabel: (label) =>
        set({ selectedLocationLabel: label }),
      setUploading: (u) => set({ uploading: u }),

      markAttendanceForToday: (location) => {
        const today = getTodayDateString();
        const state = get();
        const sessionType = state.getCurrentSessionType();
        const newRecord: AttendanceRecord = {
          date: today,
          timestamp: Date.now(),
          location,
          photosCount: state.photos.length,
          hasAudio: !!state.audioRecording,
          sessionType: sessionType === "OUTSIDE" ? undefined : sessionType,
        };
        set({
          attendanceRecords: [
            ...state.attendanceRecords.filter((r) => r.date !== today),
            newRecord,
          ],
          todayAttendanceMarked: true,
          lastAttendanceUpdate: Date.now(),
          currentSessionType: sessionType === "OUTSIDE" ? null : sessionType,
          canCheckout: sessionType !== "OUTSIDE",
        });
        setTimeout(() => get().fetchTodayAttendanceFromServer(), 2000);
      },

      fetchTodayAttendanceFromServer: async () => {
        const state = get();
        if (!state.userId) return false;

        try {
          const { useAuthStore } = await import("./authStore");
          const authHeaders = useAuthStore.getState().getAuthHeaders();

          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE}/attendance/today/${state.userId}`,
            {
              cache: "no-cache",
              headers: {
                "Content-Type": "application/json",
                ...authHeaders,
              },
            }
          );

          const data = await res.json();
          const today = getTodayDateString();

          if (data.success && data.data && data.data.attendanceType) {
            const attendanceType = data.data.attendanceType; // Access nested object

            const serverRecord: AttendanceRecord = {
              date: today,
              timestamp: new Date(attendanceType.checkinTime).getTime(), // Fixed
              location: attendanceType.takenLocation || "Unknown", // Fixed
              photosCount: data.data.photos?.length || 0,
              hasAudio: data.data.audio?.length > 0,
              checkInTime: attendanceType.checkinTime, // Fixed
              checkOutTime: attendanceType.checkoutTime, // Fixed
              sessionType:
                attendanceType.attendanceGivenTime === "FN"
                  ? "FORENOON"
                  : "AFTERNOON", // Fixed
              attendanceType: attendanceType.fullDay ? "FULL_DAY" : "HALF_DAY", // Fixed
              isCheckedOut: attendanceType.isCheckout, // Fixed
              takenLocation: attendanceType.takenLocation, // Fixed
              attendanceKey: data.data.attendanceKey,
            };

            const canCheckout =
              !attendanceType.isCheckout &&
              attendanceType.attendanceGivenTime !== undefined;

            set({
              attendanceRecords: [
                ...state.attendanceRecords.filter((r) => r.date !== today),
                serverRecord,
              ],
              todayAttendanceMarked: true,
              lastAttendanceUpdate: Date.now(),
              currentSessionType: serverRecord.sessionType || null,
              canCheckout,
            });
            return true;
          } else {
            // Handle case where no attendance data exists
            set({
              attendanceRecords: state.attendanceRecords.filter(
                (r) => r.date !== today
              ),
              todayAttendanceMarked: false,
              lastAttendanceUpdate: Date.now(),
              currentSessionType: null,
              canCheckout: false,
            });
            return false;
          }
        } catch (err) {
          console.error("Error fetching attendance:", err);
          return get().checkTodayAttendance();
        }
      },

      checkTodayAttendance: () => {
        const today = getTodayDateString();
        const hasRecord = get().attendanceRecords.some((r) => r.date === today);
        if (get().todayAttendanceMarked !== hasRecord) {
          set({
            todayAttendanceMarked: hasRecord,
            lastAttendanceUpdate: Date.now(),
          });
        }
        return hasRecord;
      },

      getTodayPhotoPosition: () => get().currentSessionPhotoPosition || "front",

      generateNewPhotoPosition: () => {
        const pos = generateRandomPhotoPosition();
        set({ currentSessionPhotoPosition: pos });
        return pos;
      },

      resetAll: () =>
        set({
          photos: [],
          audioRecording: null,
          currentPhotoIndex: 0,
          currentView: "home",
          retakeMode: false,
          selectedLocationLabel: null,
          currentSessionPhotoPosition: null,
        }),

      triggerAttendanceUpdate: () => set({ lastAttendanceUpdate: Date.now() }),

      refreshAttendanceData: async () => {
        if (!get().userId) return;
        await get().fetchUserLocationSettings();
        await get().fetchUserDepartment();
        await get().fetchTodayAttendanceFromServer();
        get().triggerAttendanceUpdate();
      },

      setUserLocationType: (type) => set({ userLocationType: type }),

      // Fetch user location settings and preserve field trip dates
      fetchUserLocationSettings: async () => {
        const state = get();
        if (!state.userId) return;

        try {
          console.log("Fetching location settings for username:", state.userId);

          // Import auth store to get headers
          const { useAuthStore } = await import("./authStore");
          const authHeaders = useAuthStore.getState().getAuthHeaders();

          // Use username endpoint instead of employeeCode
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE}/user-field-trips/username/${state.userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...authHeaders,
              },
              cache: "no-cache",
            }
          );

          const data = await res.json();
          console.log("Location settings response:", data);

          if (data.success && data.data) {
            const locationData = data.data;

            // Check if user is currently on a field trip
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for date comparison

            const isOnTrip =
              locationData.fieldTrips?.some((trip: any) => {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end && trip.isActive;
              }) || false;

            set({
              userLocationType: isOnTrip ? "FIELDTRIP" : "CAMPUS",
              // Always preserve field trip dates from server
              fieldTripDates: locationData.fieldTrips || [],
              // Set isFieldTrip true if on an active trip
              isFieldTrip: isOnTrip,
            });
            console.log("Updated location state:", {
              userLocationType: isOnTrip ? "FIELDTRIP" : "CAMPUS",
              isFieldTrip: isOnTrip,
              fieldTripsCount: locationData.fieldTrips?.length || 0,
            });
          } else {
            console.warn("Failed to fetch location settings:", data);
            // Don't clear existing field trip dates if API call fails
            const currentState = get();
            set({
              userLocationType: "CAMPUS",
              isFieldTrip: false,
              // Keep existing fieldTripDates if they exist
              fieldTripDates: currentState.fieldTripDates || [],
            });
          }
        } catch (err) {
          console.error("Error fetching user location settings:", err);
          // Don't clear existing field trip dates on error
          const currentState = get();
          set({
            userLocationType: "CAMPUS",
            isFieldTrip: false,
            // Keep existing fieldTripDates if they exist
            fieldTripDates: currentState.fieldTripDates || [],
          });
        }
      },

      // Simplified checkFieldTripStatus that uses fetchUserLocationSettings
      checkFieldTripStatus: async () => {
        await get().fetchUserLocationSettings();
      },

      fetchUserDepartment: async () => {
        try {
          // Access auth store
          const { useAuthStore } = await import("./authStore");
          const projects = useAuthStore.getState().projects;

          if (projects && projects.length > 0) {
            // Take department from the first project (same logic as ProfileContainer)
            set({ department: projects[0].department });
          } else {
            set({ department: null });
          }
        } catch (err) {
          console.error("Error setting department from auth store:", err);
          set({ department: null });
        }
      },

      // Checkout & session helpers
      getCurrentSessionType: () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        // Forenoon: 9:30 AM to 1:00 PM
        if (timeInMinutes >= 570 && timeInMinutes < 780) {
          return "FORENOON";
        }
        // Afternoon: 1:00 PM to 5:30 PM
        else if (timeInMinutes >= 780 && timeInMinutes <= 1050) {
          return "AFTERNOON";
        }
        return "OUTSIDE";
      },

      checkoutAttendance: async () => {
        const state = get();
        if (!state.userId) return false;

        try {
          const { checkoutAttendance } = await import(
            "../services/attendanceService"
          );
          const result = await checkoutAttendance(state.userId);

          if (result.success) {
            // Update local state
            await state.fetchTodayAttendanceFromServer();
            return true;
          }
          return false;
        } catch (error) {
          console.error("Checkout error:", error);
          return false;
        }
      },

      // NEW
      setDepartment: (department) => set({ department }),

      // New method to update in-progress attendance to present after 11 PM
      updateInProgressToPresent: async () => {
        const state = get();
        const now = new Date();
        const currentHour = now.getHours();

        // Only run after 11 PM (23:00)
        if (currentHour >= 23) {
          const today = getTodayDateString();
          const todayRecord = state.attendanceRecords.find(
            (r) => r.date === today
          );

          // Check if attendance is marked but not checked out
          if (
            todayRecord &&
            !todayRecord.isCheckedOut &&
            state.todayAttendanceMarked
          ) {
            // Update local state to show as present instead of in-progress
            const updatedRecord = {
              ...todayRecord,
              // Keep isCheckedOut as false and checkOutTime as null/undefined
              // This will make it appear as "Present" in the UI logic
            };

            set({
              attendanceRecords: [
                ...state.attendanceRecords.filter((r) => r.date !== today),
                updatedRecord,
              ],
              lastAttendanceUpdate: Date.now(),
            });

            console.log(
              "Auto-updated attendance from In Progress to Present after 11 PM"
            );
          }
        }
      },

      // Start the auto-update timer
      startAutoUpdateTimer: () => {
        const state = get();

        // Clear any existing timer
        if (state.autoUpdateTimerId) {
          clearInterval(state.autoUpdateTimerId);
        }

        // Check immediately
        state.updateInProgressToPresent();

        // Set up interval to check every minute
        const timerId = setInterval(() => {
          state.updateInProgressToPresent();
        }, 60000); // Check every minute

        set({ autoUpdateTimerId: timerId });
      },

      // Stop the auto-update timer
      stopAutoUpdateTimer: () => {
        const state = get();
        if (state.autoUpdateTimerId) {
          clearInterval(state.autoUpdateTimerId);
          set({ autoUpdateTimerId: null });
        }
      },
    }),
    {
      name: "attendance-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        attendanceRecords: state.attendanceRecords,
        lastAttendanceUpdate: state.lastAttendanceUpdate,
        userLocationType: state.userLocationType,
        fieldTripDates: state.fieldTripDates,
        currentSessionType: state.currentSessionType,
        canCheckout: state.canCheckout,
        department: state.department,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.lastAttendanceUpdate = Date.now();
          if (state.userId) {
            setTimeout(() => {
              state.fetchUserLocationSettings();
              state.fetchUserDepartment();
            }, 1000);
          }
        }
      },
    }
  )
);