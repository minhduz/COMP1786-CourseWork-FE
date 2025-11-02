import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginRequest, loginUser } from "../../service/api/auth";
import { setAuthToken, setStoredUser } from "../../service/utils/auth-utils";

interface ValidationError {
  field: string;
  msg: string;
}

const SignInScreen = () => {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const getFieldError = (field: string): string | null => {
    const error = errors.find((e) => e.field === field);
    return error ? error.msg : null;
  };

  const handleSignIn = async () => {
    setErrors([]);
    setLoading(true);

    try {
      // Basic validation
      if (!emailOrUsername.trim()) {
        setErrors([
          {
            field: "emailOrUsername",
            msg: "Email or username is required",
          },
        ]);
        setLoading(false);
        return;
      }

      if (!password) {
        setErrors([
          {
            field: "password",
            msg: "Password is required",
          },
        ]);
        setLoading(false);
        return;
      }

      const loginData: LoginRequest = {
        password,
      };

      // Determine if input is email or username
      if (emailOrUsername.includes("@")) {
        loginData.email = emailOrUsername;
      } else {
        loginData.username = emailOrUsername;
      }

      const response = await loginUser(loginData);

      // Store token and user
      await setAuthToken(response.token);
      await setStoredUser(response.user);

      Alert.alert("Success", `Welcome back, ${response.user.username}!`);

      // Navigate to home screen using expo-router
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Handle different error formats
      if (error.errors && Array.isArray(error.errors)) {
        // Validation errors from backend
        setErrors(error.errors);
      } else if (error.error) {
        // Simple error message from backend
        Alert.alert("Sign In Failed", error.error);
      } else if (error.message) {
        // Network or other errors
        Alert.alert("Error", error.message);
      } else {
        // Fallback error
        Alert.alert("Error", "Sign in failed. Please try again.");
      }
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-4xl font-bold text-center text-blue-600 mb-2">
                M-Hike
              </Text>
              <Text className="text-center text-gray-600 text-base">
                Sign in to explore hiking trails
              </Text>
            </View>

            {/* Error Messages */}
            {errors.length > 0 && (
              <View className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                {errors.map((error, index) => (
                  <View key={index} className="mb-2">
                    <Text className="text-red-700 text-sm font-semibold">
                      {error.field.charAt(0).toUpperCase() +
                        error.field.slice(1)}
                    </Text>
                    <Text className="text-red-600 text-sm mt-1">
                      {error.msg}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Email/Username Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Email or Username
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                  getFieldError("emailOrUsername")
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={
                    getFieldError("emailOrUsername") ? "#ef4444" : "#9ca3af"
                  }
                />
                <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder="Email or username"
                  placeholderTextColor="#9ca3af"
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {getFieldError("emailOrUsername") && (
                <Text className="text-red-600 text-sm mt-2">
                  {getFieldError("emailOrUsername")}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-6">
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
                  placeholder="Password"
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
                <Text className="text-red-600 text-sm mt-2">
                  {getFieldError("password")}
                </Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
              <Text className="text-blue-600 text-sm font-semibold text-right">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center rounded-lg py-3.5 mb-6 ${
                loading ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
              }`}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="login"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-3 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login (Placeholder) */}
            <View className="flex-row justify-center gap-4 mb-6">
              <TouchableOpacity
                className="border-2 border-gray-300 rounded-lg p-3"
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="google"
                  size={24}
                  color="#ea4335"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="border-2 border-gray-300 rounded-lg p-3"
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="apple"
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600 text-base">
                Dont have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/signup")}
                disabled={loading}
              >
                <Text className="text-blue-600 font-bold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;
