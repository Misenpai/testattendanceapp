// store/authStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { loginUser, signupUser } from '../services/authService';
import { clearUserData, getUserData, storeUserData } from '../services/UserId';
import { useAttendanceStore } from './attendanceStore';

interface AuthState {
  session: string | null;
  userName: string | null;
  userId: string | null; 
  userKey: string | null; 
  token: string | null;   
  tokenExpiry: number | null;
  isLoading: boolean;
  isInitialized: boolean;
  autoLogoutTimer: ReturnType<typeof setTimeout> | null;

  signIn: (username: string, password: string) => Promise<void>;
  signUp: (empCode: string, username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  checkTokenExpiry: () => boolean;
  refreshTokenTimer: () => void;
  clearAutoLogoutTimer: () => void;
  getAuthHeaders: () => { Authorization: string } | {};
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      userName: null,
      userId: null,  // Will store empCode
      userKey: null,
      token: null,
      tokenExpiry: null,
      isLoading: true,
      isInitialized: false,
      autoLogoutTimer: null,

      initializeAuth: async () => {
        try {
          const userData = await getUserData();
          const state = get();
          
          // Check if token is expired
          if (state.token && state.tokenExpiry) {
            const isExpired = Date.now() >= state.tokenExpiry;
            if (isExpired) {
              // Token expired, auto logout
              await get().signOut();
              Alert.alert('Session Expired', 'Your session has expired. Please login again.');
              set({ isLoading: false, isInitialized: true });
              return;
            }
          }

          if (userData?.isLoggedIn && state.token) {
            set({
              session: userData.userId,  // empCode
              userName: userData.name,
              userId: userData.userId,  // empCode
              userKey: userData.userKey,
              isLoading: false,
              isInitialized: true,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(userData.name);
            
            // Start auto-logout timer
            get().refreshTokenTimer();
          } else {
            set({ isLoading: false, isInitialized: true });
          }
        } catch (e) {
          set({ isLoading: false, isInitialized: true });
        }
      },

      checkTokenExpiry: () => {
        const state = get();
        if (!state.token || !state.tokenExpiry) return false;
        return Date.now() < state.tokenExpiry;
      },

      refreshTokenTimer: () => {
        const state = get();
        
        // Clear existing timer
        state.clearAutoLogoutTimer();
        
        if (state.tokenExpiry) {
          const timeUntilExpiry = state.tokenExpiry - Date.now();
          
          if (timeUntilExpiry > 0) {
            // Set timer to auto-logout when token expires
            const timer = setTimeout(async () => {
              await get().signOut();
              Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [{ text: 'OK' }]
              );
            }, timeUntilExpiry);
            
            set({ autoLogoutTimer: timer });
            
            // Warn user 2 minutes before expiry
            if (timeUntilExpiry > 120000) { // More than 2 minutes
              setTimeout(() => {
                Alert.alert(
                  'Session Expiring',
                  'Your session will expire in 2 minutes.',
                  [{ text: 'OK' }]
                );
              }, timeUntilExpiry - 120000);
            }
          }
        }
      },

      clearAutoLogoutTimer: () => {
        const state = get();
        if (state.autoLogoutTimer) {
          clearTimeout(state.autoLogoutTimer);
          set({ autoLogoutTimer: null });
        }
      },

      getAuthHeaders: () => {
        const state = get();
        if (state.token && state.checkTokenExpiry()) {
          return { Authorization: `Bearer ${state.token}` };
        }
        return {};
      },

      signIn: async (username, password) => {
        set({ isLoading: true });
        try {
          const res = await loginUser(username, password);
          
          if (res.success && res.user && res.token) {
            // Calculate token expiry (30 minutes from now)
            const tokenExpiry = Date.now() + (30 * 60 * 1000);
            
            await storeUserData({
              userId: res.user.empCode,  // Store empCode as userId
              userKey: res.user.userKey,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            
            set({
              session: res.user.empCode,
              userName: res.user.username,
              userId: res.user.empCode,
              userKey: res.user.userKey,
              token: res.token,
              tokenExpiry,
              isLoading: false,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(res.user.username);
            
            // Check and set location type if available
            if (res.user.userLocation?.locationType) {
              useAttendanceStore.getState().setUserLocationType(
                res.user.userLocation.locationType
              );
            }
            
            // Start auto-logout timer
            get().refreshTokenTimer();
            
            Alert.alert('Success', 'Logged in successfully!');
          } else {
            set({ isLoading: false });
            Alert.alert('Login Failed', res.error || 'Unknown error');
          }
        } catch {
          set({ isLoading: false });
          Alert.alert('Error', 'Unexpected error during login');
        }
      },

      signUp: async (empCode, username, email, password) => {
        set({ isLoading: true });
        try {
          const res = await signupUser(empCode, username, email, password);
          
          if (res.success && res.user && res.token) {
            // Calculate token expiry (30 minutes from now)
            const tokenExpiry = Date.now() + (30 * 60 * 1000);
            
            await storeUserData({
              userId: res.user.empCode,  // Store empCode as userId
              userKey: res.user.userKey,
              name: res.user.username,
              email: res.user.email,
              isLoggedIn: true,
            });
            
            set({
              session: res.user.empCode,
              userName: res.user.username,
              userId: res.user.empCode,
              userKey: res.user.userKey,
              token: res.token,
              tokenExpiry,
              isLoading: false,
            });
            
            // Set username for attendance store
            useAttendanceStore.getState().setUserId(res.user.username);
            
            // Start auto-logout timer
            get().refreshTokenTimer();
            
            Alert.alert('Success', 'Account created successfully!');
          } else {
            set({ isLoading: false });
            Alert.alert('Signup Failed', res.error || 'Unknown error');
          }
        } catch {
          set({ isLoading: false });
          Alert.alert('Error', 'Unexpected error during signup');
        }
      },

      signOut: async () => {
        try {
          // Clear auto-logout timer
          get().clearAutoLogoutTimer();
          
          await clearUserData();
          set({
            session: null,
            userName: null,
            userId: null,
            userKey: null,
            token: null,
            tokenExpiry: null,
            autoLogoutTimer: null,
          });
          useAttendanceStore.getState().clearUserId();
        } catch (e) {
          console.error(e);
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        userName: state.userName,
        userId: state.userId,
        userKey: state.userKey,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);