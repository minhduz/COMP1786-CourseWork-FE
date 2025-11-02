import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.28.56:3000/api";

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to headers
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors properly
client.interceptors.response.use(
  (response) => {
    console.log(
      `[API Success] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error: AxiosError) => {
    // Log detailed error information
    console.error("======================");
    console.error("[API Error]:", error.config?.method?.toUpperCase(), error.config?.url);
    console.error("[Status Code]:", error.response?.status);
    console.error("[Error Data]:", error.response?.data);
    console.error("[Error Message]:", error.message);
    console.error("======================");

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");
        console.log("[Auth] Token cleared due to 401");
      } catch (err) {
        console.error("Error clearing token:", err);
      }
    }

    // Extract and return clean error data
    if (error.response?.data) {
      // Backend returned an error response
      return Promise.reject(error.response.data);
    }

    // Network error or timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({ error: "Request timeout. Please try again." });
    }

    if (error.message === "Network Error") {
      return Promise.reject({
        error: "Network error. Please check your connection.",
      });
    }

    // Generic error with message
    if (error.message) {
      return Promise.reject({ error: error.message });
    }

    // Fallback
    return Promise.reject({ error: "An unexpected error occurred" });
  }
);

export default client;