import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStoredUser } from "../../service/api/auth";
import { getUserHikes, Hike } from "../../service/api/hike";

export default function MyHikesScreen() {
  const router = useRouter();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadHikes();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      setCurrentUser(user);
    } catch (error) {
      console.log("Failed to load user data:", error);
    }
  };

  const loadHikes = async () => {
    try {
      setLoading(true);
      // Get only current user's hikes
      const response = await getUserHikes();
      setHikes(response.hikes);
    } catch (error: any) {
      console.log("Failed to load hikes:", error);

      // Handle different error types
      if (error.error) {
        Alert.alert("Error", error.error);
      } else if (error.message) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to load hikes");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHikes().then(() => setRefreshing(false));
  }, []);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "bg-green-100";
      case "Moderate":
        return "bg-yellow-100";
      case "Difficult":
        return "bg-orange-100";
      case "Expert":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getDifficultyTextColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "text-green-700";
      case "Moderate":
        return "text-yellow-700";
      case "Difficult":
        return "text-orange-700";
      case "Expert":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderHikeItem = ({ item }: { item: Hike }) => (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-lg p-4 mt-4 mx-6 shadow-sm"
      onPress={() => router.push(`./${item.hikeId}` as any)}
    >
      {/* Header with User Info */}
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
          {currentUser?.avatar ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_BASE_URL}${currentUser.avatar}`,
              }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <MaterialCommunityIcons name="account" size={16} color="#2563eb" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Your hike</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {currentUser?.username || "You"}
          </Text>
        </View>
        <View
          className={`${getDifficultyColor(item.difficultyLevel)} rounded-full px-3 py-1`}
        >
          <Text
            className={`text-xs font-semibold ${getDifficultyTextColor(item.difficultyLevel)}`}
          >
            {item.difficultyLevel}
          </Text>
        </View>
      </View>

      {/* Hike Name */}
      <Text className="text-lg font-bold text-gray-800 mb-3">{item.name}</Text>

      {/* Hike Details */}
      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color="#6b7280"
          />
          <Text className="ml-2 text-gray-600">{item.location}</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="tape-measure"
            size={16}
            color="#6b7280"
          />
          <Text className="ml-2 text-gray-600">{item.length} km</Text>
        </View>
      </View>

      {/* Description Preview (if exists) */}
      {item.description && (
        <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Footer */}
      <View className="border-t border-gray-200 pt-3 flex-row justify-between items-center">
        <Text className="text-sm text-gray-500">
          {new Date(item.hikeDate).toLocaleDateString()}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#2563eb"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 ">
        <View className="px-4 py-3 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
            <Text className="text-gray-700 font-semibold ml-2 text-base">
              Back
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={hikes}
          renderItem={renderHikeItem}
          keyExtractor={(item) => item.hikeId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <MaterialCommunityIcons name="hiking" size={64} color="#d1d5db" />
              <Text className="text-gray-500 mt-4 text-center px-8 text-lg font-semibold">
                No hikes yet
              </Text>
              <Text className="text-gray-400 mt-2 text-center px-8">
                Create your first hike and start your adventure!
              </Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-lg px-6 py-3 mt-6 flex-row items-center"
                onPress={() => router.push("./create-hike")}
              >
                <MaterialCommunityIcons name="plus" size={20} color="white" />
                <Text className="text-white font-bold ml-2">
                  Create First Hike
                </Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            hikes.length > 0 ? (
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">
                      My Hikes
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {hikes.length} {hikes.length === 1 ? "hike" : "hikes"}{" "}
                      created
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
                    onPress={() => router.push("./create-hike")}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-semibold ml-1">New</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View className="flex-row mt-4 gap-2">
                  <View className="flex-1 bg-blue-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="trending-up"
                        size={20}
                        color="#2563eb"
                      />
                      <Text className="text-blue-600 font-bold text-lg">
                        {hikes.reduce((sum, h) => sum + h.length, 0).toFixed(1)}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">Total km</Text>
                  </View>

                  <View className="flex-1 bg-green-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="calendar-check"
                        size={20}
                        color="#16a34a"
                      />
                      <Text className="text-green-600 font-bold text-lg">
                        {
                          hikes.filter(
                            (h) => new Date(h.hikeDate) >= new Date()
                          ).length
                        }
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">Upcoming</Text>
                  </View>

                  <View className="flex-1 bg-purple-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="history"
                        size={20}
                        color="#9333ea"
                      />
                      <Text className="text-purple-600 font-bold text-lg">
                        {
                          hikes.filter((h) => new Date(h.hikeDate) < new Date())
                            .length
                        }
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">
                      Completed
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
