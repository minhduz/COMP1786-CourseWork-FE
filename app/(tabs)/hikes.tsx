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
import { getAllHikes, Hike } from "../../service/api/hike";

export default function HikesScreen() {
  const router = useRouter();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadHikes();
    }, [])
  );

  const loadHikes = async () => {
    try {
      setLoading(true);
      // Changed from getUserHikes to getAllHikes
      const response = await getAllHikes();
      setHikes(response.hikes);
    } catch (error: any) {
      console.error("Failed to load hikes:", error);

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
          {item.userAvatar ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_BASE_URL}${item.userAvatar}`,
              }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <MaterialCommunityIcons name="account" size={16} color="#2563eb" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Created by</Text>
          <Text className="text-sm font-semibold text-gray-700">
            {item.username || "Unknown User"}
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
    <View className="flex-1 bg-white">
      <View className="mb-4">
        <FlatList
          data={hikes}
          renderItem={renderHikeItem}
          keyExtractor={(item) => item.hikeId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={48}
                color="#d1d5db"
              />
              <Text className="text-gray-500 mt-4 text-center px-8">
                No hikes available yet. Be the first to create one!
              </Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-lg px-6 py-3 mt-6"
                onPress={() => router.push("./create-hike")}
              >
                <Text className="text-white font-bold">Create a Hike</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            hikes.length > 0 ? (
              <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-200">
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Community Hikes
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {hikes.length} {hikes.length === 1 ? "hike" : "hikes"}{" "}
                    available
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
                  onPress={() => router.push("./create-hike")}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="white" />
                  <Text className="text-white font-semibold ml-1">Add</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}
