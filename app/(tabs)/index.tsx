import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getProfile, GetProfileResponse, logout } from "../../service/api/auth";
import { clearAuthData } from "../../service/utils/auth-utils";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<GetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to load profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProfile().then(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            await clearAuthData();
            // Navigate to signin using expo-router
            router.replace("/(auth)/signin");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 py-8">
        {/* Welcome Card */}
        <View className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {user?.username}! 👋
          </Text>
          <Text className="text-gray-600">Ready to explore new trails?</Text>
        </View>

        {/* User Info Card */}
        <View className="bg-gray-50 rounded-lg p-6 mb-6">
          <View className="mb-4 flex-row items-center">
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#2563eb"
            />
            <Text className="ml-3 text-gray-700">{user?.email}</Text>
          </View>

          {user?.phone && (
            <View className="mb-4 flex-row items-center">
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color="#2563eb"
              />
              <Text className="ml-3 text-gray-700">{user.phone}</Text>
            </View>
          )}

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="calendar-outline"
              size={20}
              color="#2563eb"
            />
            <Text className="ml-3 text-gray-700">
              Joined {new Date(user?.createdAt || "").toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <TouchableOpacity
            className="bg-blue-600 rounded-lg px-4 py-3 mb-3 flex-row items-center"
            onPress={() => router.push("./my-hikes")}
          >
            <MaterialCommunityIcons
              name="map-marker-multiple-outline"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-bold flex-1">View My Hikes</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 rounded-lg px-4 py-3 flex-row items-center"
            onPress={() => router.push("./profile")}
          >
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-bold flex-1">Edit Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-red-600 rounded-lg px-4 py-3 flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
