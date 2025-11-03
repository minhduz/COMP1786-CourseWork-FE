import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStoredUser } from "../../service/api/auth";
import {
  deleteObservation,
  getObservationById,
  Observation,
} from "../../service/api/observation";

export default function ObservationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const observationId = parseInt(id as string);

  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [observationId])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await getStoredUser();
      const userId = user?.userId || null;
      setCurrentUserId(userId);

      // Load observation details
      const observationData = await getObservationById(observationId);
      setObservation(observationData);
    } catch (error: any) {
      console.log("Failed to load observation details:", error);
      if (error.error) {
        Alert.alert("Error", error.error);
      } else {
        Alert.alert("Error", "Failed to load observation details");
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [observationId]);

  const handleDeleteObservation = () => {
    Alert.alert(
      "Delete Observation",
      "Are you sure you want to delete this observation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteObservation(observationId);
              Alert.alert("Success", "Observation deleted successfully");
              router.back();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.error || "Failed to delete observation"
              );
            }
          },
        },
      ]
    );
  };

  const getObservationTypeIcon = (type?: string | null) => {
    switch (type) {
      case "Wildlife":
        return "paw";
      case "Vegetation":
        return "leaf";
      case "Weather":
        return "weather-partly-cloudy";
      case "Trail Condition":
        return "road-variant";
      case "Other":
        return "information-outline";
      default:
        return "eye-outline";
    }
  };

  const getObservationTypeColor = (type?: string | null) => {
    switch (type) {
      case "Wildlife":
        return "bg-amber-600";
      case "Vegetation":
        return "bg-green-600";
      case "Weather":
        return "bg-blue-600";
      case "Trail Condition":
        return "bg-gray-600";
      case "Other":
        return "bg-purple-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!observation) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Observation not found</Text>
      </View>
    );
  }

  // Check if current user is the owner of the observation
  const isObservationOwner =
    currentUserId !== null && currentUserId === observation.userId;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Card */}
          <View className="bg-green-600 p-6 rounded-b-3xl shadow-lg">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    {observation.userAvatar ? (
                      <Image
                        source={{
                          uri: `${process.env.EXPO_PUBLIC_BASE_URL}${observation.userAvatar}`,
                        }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="account"
                        size={24}
                        color="white"
                      />
                    )}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-white text-xl font-bold">
                      {observation.username}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      {observation.userEmail}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="white"
                  />
                  <Text className="text-white ml-2">
                    {new Date(observation.observationTime).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </View>
              </View>

              {observation.observationType && (
                <View
                  className={`${getObservationTypeColor(observation.observationType)} rounded-full px-4 py-2`}
                >
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={getObservationTypeIcon(observation.observationType)}
                      size={16}
                      color="white"
                    />
                    <Text className="text-white font-bold text-xs ml-1">
                      {observation.observationType}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Details Section */}
          <View className="p-6">
            {/* Observation Content */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2 text-base">
                Observation
              </Text>
              <Text className="text-gray-800 text-lg leading-7">
                {observation.observation}
              </Text>
            </View>

            {/* Comments */}
            {observation.comments && (
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2 text-base">
                  Comments
                </Text>
                <Text className="text-gray-600 italic leading-6">
                  {observation.comments}
                </Text>
              </View>
            )}

            {/* Photo */}
            {observation.photoUrl && (
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2 text-base">
                  Photo
                </Text>
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_BASE_URL}${observation.photoUrl}`,
                  }}
                  className="w-full h-96 rounded-xl"
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Location Info */}
            {observation.latitude && observation.longitude && (
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#2563eb"
                  />
                  <Text className="text-gray-700 font-semibold ml-2">
                    Location
                  </Text>
                </View>
                <Text className="text-blue-600 font-mono">
                  Latitude: {observation.latitude.toFixed(6)}
                </Text>
                <Text className="text-blue-600 font-mono">
                  Longitude: {observation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Additional Info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              {observation.createdAt && (
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color="#2563eb"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-500 text-xs">Created At</Text>
                    <Text className="text-gray-800 font-semibold">
                      {new Date(observation.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {observation.updatedAt &&
                observation.updatedAt !== observation.createdAt && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="update"
                      size={20}
                      color="#2563eb"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs">
                        Last Updated
                      </Text>
                      <Text className="text-gray-800 font-semibold">
                        {new Date(observation.updatedAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
            </View>

            {/* Action Buttons - Only shown to observation owner */}
            {isObservationOwner && (
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
                  onPress={() =>
                    router.push(
                      `./create-observation?id=${observationId}` as any
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">
                    Edit Observation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-600 rounded-xl py-3 flex-row items-center justify-center"
                  onPress={handleDeleteObservation}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">
                    Delete Observation
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Back to Hike Button */}
            <TouchableOpacity
              className="bg-gray-100 rounded-xl py-3 flex-row items-center justify-center"
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color="#374151"
              />
              <Text className="text-gray-700 font-bold ml-2">Back to Hike</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
