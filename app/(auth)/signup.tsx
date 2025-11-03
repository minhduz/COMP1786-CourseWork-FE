import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ErrorResponse,
  RegisterRequest,
  registerUser,
} from "../../service/api/auth";
import { setAuthToken, setStoredUser } from "../../service/utils/auth-utils";

interface ValidationError {
  field: string;
  msg: string;
}

interface AvatarImage {
  uri: string;
  type: string;
  name: string;
}

const SignUpScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<AvatarImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getFieldError = (field: string): string | null => {
    const error = errors.find((e) => e.field === field);
    return error ? error.msg : null;
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAvatar({
          uri: asset.uri,
          type: "image/jpeg",
          name: `avatar-${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.log("Image picker error:", error);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!username.trim()) {
      newErrors.push({
        field: "username",
        msg: "Username is required",
      });
    } else if (username.length < 3) {
      newErrors.push({
        field: "username",
        msg: "Username must be at least 3 characters",
      });
    } else if (username.length > 50) {
      newErrors.push({
        field: "username",
        msg: "Username must be less than 50 characters",
      });
    }

    if (!email.trim()) {
      newErrors.push({
        field: "email",
        msg: "Email is required",
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push({
        field: "email",
        msg: "Please enter a valid email",
      });
    }

    if (!password) {
      newErrors.push({
        field: "password",
        msg: "Password is required",
      });
    } else if (password.length < 8) {
      newErrors.push({
        field: "password",
        msg: "Password must be at least 8 characters",
      });
    }

    if (!confirmPassword) {
      newErrors.push({
        field: "confirmPassword",
        msg: "Please confirm your password",
      });
    } else if (password !== confirmPassword) {
      newErrors.push({
        field: "confirmPassword",
        msg: "Passwords do not match",
      });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const registerData: RegisterRequest = {
        username,
        email,
        password,
        phone: phone || undefined,
      };

      if (avatar) {
        registerData.avatar = {
          uri: avatar.uri,
          type: avatar.type,
          name: avatar.name,
        };
      }

      const response = await registerUser(registerData);

      // Store token and user
      await setAuthToken(response.token);
      await setStoredUser(response.user);

      Alert.alert("Success", "Account created successfully!");

      // Navigate to home screen using expo-router
      router.replace("./signin");
    } catch (error: any) {
      const errorResponse = error as ErrorResponse;

      if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
        setErrors(errorResponse.errors);
      } else if (errorResponse.error) {
        Alert.alert("Error", errorResponse.error);
      } else {
        Alert.alert("Error", "Sign up failed. Please try again.");
      }

      console.log("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-white"
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView className="" scrollIndicatorInsets={{ right: 1 }}>
          <View className="px-6 py-8 pb-12">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-center text-blue-600 mb-2">
                M-Hike
              </Text>
              <Text className="text-center text-gray-600 text-base">
                Create your account to start exploring
              </Text>
            </View>

            {/* Error Messages */}
            {errors.length > 0 && (
              <View className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                {errors.slice(0, 3).map((error, index) => (
                  <View key={index} className="mb-2">
                    <Text className="text-red-700 text-xs font-semibold">
                      {error.field
                        .replace(/([A-Z])/g, " $1")
                        .toUpperCase()
                        .trim()}
                    </Text>
                    <Text className="text-red-600 text-xs mt-1">
                      {error.msg}
                    </Text>
                  </View>
                ))}
                {errors.length > 3 && (
                  <Text className="text-red-600 text-xs mt-2">
                    +{errors.length - 3} more errors
                  </Text>
                )}
              </View>
            )}

            {/* Avatar Upload */}
            <View className="mb-6 items-center">
              <View className="relative mb-4">
                {avatar ? (
                  <Image
                    source={{ uri: avatar.uri }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={40}
                      color="#d1d5db"
                    />
                  </View>
                )}
                {avatar && (
                  <TouchableOpacity
                    className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                    onPress={handleRemoveAvatar}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                className="bg-blue-100 rounded-lg px-4 py-2"
                onPress={handlePickAvatar}
                disabled={loading}
              >
                <Text className="text-blue-600 font-semibold">
                  {avatar ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-500 text-xs mt-2">
                (Optional) Upload a profile picture
              </Text>
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Username</Text>
              <View
                className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                  getFieldError("username")
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={getFieldError("username") ? "#ef4444" : "#9ca3af"}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Choose a username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  editable={!loading}
                  autoCapitalize="none"
                />
              </View>
              {getFieldError("username") && (
                <Text className="text-red-600 text-xs mt-1.5">
                  {getFieldError("username")}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <View
                className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                  getFieldError("email")
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={getFieldError("email") ? "#ef4444" : "#9ca3af"}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {getFieldError("email") && (
                <Text className="text-red-600 text-xs mt-1.5">
                  {getFieldError("email")}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Password</Text>
              <View
                className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                  getFieldError("password")
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={getFieldError("password") ? "#ef4444" : "#9ca3af"}
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Min 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {getFieldError("password") && (
                <Text className="text-red-600 text-xs mt-1.5">
                  {getFieldError("password")}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Confirm Password
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                  getFieldError("confirmPassword")
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={
                    getFieldError("confirmPassword") ? "#ef4444" : "#9ca3af"
                  }
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {getFieldError("confirmPassword") && (
                <Text className="text-red-600 text-xs mt-1.5">
                  {getFieldError("confirmPassword")}
                </Text>
              )}
            </View>

            {/* Phone Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Phone (Optional)
              </Text>
              <View className="flex-row items-center border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color="#9ca3af"
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Your phone number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!loading}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Terms and Conditions */}
            <View className="mb-6 flex-row">
              <Text className="text-gray-600 text-xs flex-1">
                By signing up, you agree to our{" "}
                <Text className="text-blue-600 font-semibold">Terms</Text> and{" "}
                <Text className="text-blue-600 font-semibold">
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center rounded-lg py-3.5 mb-6 ${
                loading ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
              }`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold text-lg">Sign Up</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600 text-base">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signin")}
                disabled={loading}
              >
                <Text className="text-blue-600 font-bold text-base">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
