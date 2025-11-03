import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../clients";
import { normalizeFileForUploadSimple } from "../utils/file-utils";

// ============ INTERFACES ============

// User type
export interface User {
  userId: number;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

// Register Request
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: {
    uri: string;
    type: string;
    name: string;
  };
}

// Register Response
export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

// Login Request
export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// Get Profile Response
export interface GetProfileResponse {
  userId: number;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

// Get User By Username Response
export interface GetUserByUsernameResponse {
  userId: number;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

// Update Profile Request
export interface UpdateProfileRequest {
  email?: string;
  phone?: string;
  avatar?: {
    uri: string;
    type: string;
    name: string;
  };
}

// Update Profile Response
export interface UpdateProfileResponse {
  message: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Change Password Response
export interface ChangePasswordResponse {
  message: string;
}

// Upload Avatar Request
export interface UploadAvatarRequest {
  avatar: {
    uri: string;
    type: string;
    name: string;
  };
}

// Upload Avatar Response
export interface UploadAvatarResponse {
  message: string;
  avatarUrl: string;
}

// Error Response
export interface ErrorResponse {
  error?: string;
  errors?: {
    field: string;
    msg: string;
  }[];
}

// ============ API FUNCTIONS ============

/**
 * Register a new user
 */
export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    
    if (data.phone) {
      formData.append("phone", data.phone);
    }
    
    if (data.avatar) {
      // Normalize the file for upload
      const normalizedFile = normalizeFileForUploadSimple(
        data.avatar.uri,
        data.avatar.name
      );
      
      formData.append("avatar", {
        uri: normalizedFile.uri,
        type: normalizedFile.type,
        name: normalizedFile.name,
      } as any);
    }

    const response = await client.post<RegisterResponse>(
      "/auth/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Store token
    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Login user with email or username
 */
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await client.post<LoginResponse>("/auth/login", {
      email: data.email,
      username: data.username,
      password: data.password,
    });

    // Store token
    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<GetProfileResponse> => {
  try {
    const response = await client.get<GetProfileResponse>("/auth/profile");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get user profile by username (public)
 */
export const getUserByUsername = async (
  username: string
): Promise<GetUserByUsernameResponse> => {
  try {
    const response = await client.get<GetUserByUsernameResponse>(
      `/auth/users/${username}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update user profile (email, phone, avatar)
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const formData = new FormData();
    
    if (data.email) {
      formData.append("email", data.email);
    }
    
    if (data.phone) {
      formData.append("phone", data.phone);
    }
    
    if (data.avatar) {
      // Normalize the file for upload
      const normalizedFile = normalizeFileForUploadSimple(
        data.avatar.uri,
        data.avatar.name
      );
      
      formData.append("avatar", {
        uri: normalizedFile.uri,
        type: normalizedFile.type,
        name: normalizedFile.name,
      } as any);
    }

    const response = await client.put<UpdateProfileResponse>(
      "/auth/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    const response = await client.post<ChangePasswordResponse>(
      "/auth/change-password",
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (
  data: UploadAvatarRequest
): Promise<UploadAvatarResponse> => {
  try {
    const formData = new FormData();
    
    // Normalize the file for upload
    const normalizedFile = normalizeFileForUploadSimple(
      data.avatar.uri,
      data.avatar.name
    );
    
    formData.append("avatar", {
      uri: normalizedFile.uri,
      type: normalizedFile.type,
      name: normalizedFile.name,
    } as any);

    const response = await client.post<UploadAvatarResponse>(
      "/auth/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

/**
 * Get stored auth token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Get stored user
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getStoredToken();
  return !!token;
};