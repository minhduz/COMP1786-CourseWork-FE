import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AuthIndex() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      {/* Logo Section */}
      <View className="mb-12 items-center">
        {/* App Logo/Icon */}
        <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center mb-6">
          <MaterialCommunityIcons
            name="map-marker-multiple"
            size={48}
            color="white"
          />
        </View>

        {/* App Name */}
        <Text className="text-4xl font-bold text-gray-800 mb-2">M-Hike</Text>
        <Text className="text-gray-600 text-center text-base">
          Discover amazing hiking trails and share your adventures
        </Text>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        className="w-full bg-blue-600 rounded-lg py-4 mb-4 flex-row items-center justify-center"
        onPress={() => router.push("/(auth)/signin")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="login"
          size={20}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-bold text-lg">Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        className="w-full bg-green-600 rounded-lg py-4 flex-row items-center justify-center"
        onPress={() => router.push("/(auth)/signup")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="account-plus-outline"
          size={20}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-8 w-full">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-3 text-gray-500 text-sm">or continue with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Social Login Buttons */}
      <View className="flex-row justify-center gap-6">
        <TouchableOpacity
          className="border-2 border-gray-300 rounded-lg p-4"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="google" size={28} color="#ea4335" />
        </TouchableOpacity>
        <TouchableOpacity
          className="border-2 border-gray-300 rounded-lg p-4"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="apple" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Footer Text */}
      <View className="absolute bottom-8 px-6">
        <Text className="text-gray-500 text-xs text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
