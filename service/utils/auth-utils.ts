import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from "base-64"; // Install: npm install base-64

const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "user";

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Get stored auth token from AsyncStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

/**
 * Store auth token in AsyncStorage
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing auth token:", error);
    throw error;
  }
};

/**
 * Remove auth token from AsyncStorage
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token:", error);
    throw error;
  }
};

/**
 * Get stored user from AsyncStorage
 */
export const getStoredUser = async (): Promise<any | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error retrieving stored user:", error);
    return null;
  }
};

/**
 * Store user in AsyncStorage
 */
export const setStoredUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user:", error);
    throw error;
  }
};

/**
 * Remove stored user from AsyncStorage
 */
export const removeStoredUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error removing stored user:", error);
    throw error;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};

/**
 * Decode JWT token payload (React Native compatible)
 */
export const decodeToken = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Use base-64 library instead of Buffer
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired by decoding JWT
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = decodeToken(token);
    if (payload && payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
    return null;
  } catch (error) {
    console.error("Error getting token expiration time:", error);
    return null;
  }
};

/**
 * Get remaining token time in seconds
 */
export const getTokenRemainingTime = (token: string): number | null => {
  try {
    const expirationTime = getTokenExpirationTime(token);
    if (expirationTime) {
      const remainingTime = expirationTime - Date.now();
      return Math.floor(remainingTime / 1000); // Convert to seconds
    }
    return null;
  } catch (error) {
    console.error("Error getting token remaining time:", error);
    return null;
  }
};

/**
 * Initialize auth on app start
 */
export const initializeAuth = async (): Promise<{
  isAuthenticated: boolean;
  user: any | null;
}> => {
  try {
    const token = await getAuthToken();
    const user = await getStoredUser();

    if (token && !isTokenExpired(token)) {
      return {
        isAuthenticated: true,
        user,
      };
    } else {
      // Token expired or missing, clear auth data
      await clearAuthData();
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
};