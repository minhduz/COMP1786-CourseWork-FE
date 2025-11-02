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
import { deleteHike, getHikeById, Hike } from "../../service/api/hike";
import {
  deleteObservation,
  getObservationsByHike,
  Observation,
} from "../../service/api/observation";

export default function HikeDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const hikeId = parseInt(id as string);

  const [hike, setHike] = useState<Hike | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [hikeId])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await getStoredUser();
      const userId = user?.userId || null;
      setCurrentUserId(userId);

      // Load hike details and observations in parallel
      const [hikeData, observationsData] = await Promise.all([
        getHikeById(hikeId),
        getObservationsByHike(hikeId),
      ]);

      setHike(hikeData);
      setObservations(observationsData.observations);
    } catch (error: any) {
      console.error("Failed to load hike details:", error);
      if (error.error) {
        Alert.alert("Error", error.error);
      } else {
        Alert.alert("Error", "Failed to load hike details");
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [hikeId]);

  const handleDeleteHike = () => {
    Alert.alert(
      "Delete Hike",
      "Are you sure you want to delete this hike? This will also delete all observations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHike(hikeId);
              Alert.alert("Success", "Hike deleted successfully");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.error || "Failed to delete hike");
            }
          },
        },
      ]
    );
  };

  const handleDeleteObservation = (observationId: number) => {
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
              Alert.alert("Success", "Observation deleted");
              loadData();
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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Easy":
        return "bg-green-500";
      case "Moderate":
        return "bg-yellow-500";
      case "Difficult":
        return "bg-orange-500";
      case "Expert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
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
        return "text-amber-600";
      case "Vegetation":
        return "text-green-600";
      case "Weather":
        return "text-blue-600";
      case "Trail Condition":
        return "text-gray-600";
      case "Other":
        return "text-purple-600";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!hike) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Hike not found</Text>
      </View>
    );
  }

  // Check if current user is the owner of the hike
  const isHikeOwner = currentUserId !== null && currentUserId === hike.userId;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Card */}
          <View className="bg-blue-600 p-6 rounded-b-3xl shadow-lg">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-2">
                  {hike.name}
                </Text>
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="white"
                  />
                  <Text className="text-white ml-2">{hike.location}</Text>
                </View>

                {/* Show creator info if not owner */}
                {!isHikeOwner && hike.username && (
                  <View className="flex-row items-center mt-1">
                    <MaterialCommunityIcons
                      name="account"
                      size={14}
                      color="white"
                    />
                    <Text className="text-white/80 text-sm ml-1">
                      by {hike.username}
                    </Text>
                  </View>
                )}
              </View>
              <View
                className={`${getDifficultyColor(hike.difficultyLevel)} rounded-full px-4 py-2`}
              >
                <Text className="text-white font-bold text-xs">
                  {hike.difficultyLevel}
                </Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row justify-around mt-4 bg-white/20 rounded-2xl p-4">
              <View className="items-center">
                <MaterialCommunityIcons
                  name="tape-measure"
                  size={24}
                  color="white"
                />
                <Text className="text-white font-bold mt-1">
                  {hike.length} km
                </Text>
                <Text className="text-white/80 text-xs">Distance</Text>
              </View>

              {hike.elevationGain && (
                <View className="items-center">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={24}
                    color="white"
                  />
                  <Text className="text-white font-bold mt-1">
                    {hike.elevationGain}m
                  </Text>
                  <Text className="text-white/80 text-xs">Elevation</Text>
                </View>
              )}

              {hike.estimatedDuration && (
                <View className="items-center">
                  <MaterialCommunityIcons
                    name="clock"
                    size={24}
                    color="white"
                  />
                  <Text className="text-white font-bold mt-1">
                    {hike.estimatedDuration}
                  </Text>
                  <Text className="text-white/80 text-xs">Duration</Text>
                </View>
              )}
            </View>
          </View>

          {/* Details Section */}
          <View className="p-6">
            {/* Date & Parking */}
            <View className="flex-row justify-between mb-6">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#6b7280"
                />
                <Text className="ml-2 text-gray-700">
                  {new Date(hike.hikeDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name={hike.parkingAvailable ? "parking" : "car-off"}
                  size={20}
                  color={hike.parkingAvailable ? "#16a34a" : "#dc2626"}
                />
                <Text
                  className={`ml-2 ${hike.parkingAvailable ? "text-green-600" : "text-red-600"}`}
                >
                  {hike.parkingAvailable ? "Parking Available" : "No Parking"}
                </Text>
              </View>
            </View>

            {/* Description */}
            {hike.description && (
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2 text-base">
                  Description
                </Text>
                <Text className="text-gray-600 leading-6">
                  {hike.description}
                </Text>
              </View>
            )}

            {/* Additional Details */}
            {(hike.trailType ||
              hike.equipmentNeeded ||
              hike.weatherConditions) && (
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                {hike.trailType && (
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons
                      name="hiking"
                      size={20}
                      color="#2563eb"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs">Trail Type</Text>
                      <Text className="text-gray-800 font-semibold">
                        {hike.trailType}
                      </Text>
                    </View>
                  </View>
                )}

                {hike.equipmentNeeded && (
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons
                      name="bag-personal"
                      size={20}
                      color="#2563eb"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs">Equipment</Text>
                      <Text className="text-gray-800 font-semibold">
                        {hike.equipmentNeeded}
                      </Text>
                    </View>
                  </View>
                )}

                {hike.weatherConditions && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="weather-partly-cloudy"
                      size={20}
                      color="#2563eb"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs">Weather</Text>
                      <Text className="text-gray-800 font-semibold">
                        {hike.weatherConditions}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons - Only shown to hike owner */}
            {isHikeOwner && (
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
                  onPress={() =>
                    router.push(`./create-hike?id=${hikeId}` as any)
                  }
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">Edit Hike</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-600 rounded-xl py-3 flex-row items-center justify-center"
                  onPress={handleDeleteHike}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">Delete Hike</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Observations Section */}
            <View className="border-t border-gray-200 pt-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  Observations ({observations.length})
                </Text>
                <TouchableOpacity
                  className="bg-green-600 rounded-xl px-4 py-2 flex-row items-center"
                  onPress={() =>
                    router.push(
                      `../observation/create-observation?hikeId=${hikeId}` as any
                    )
                  }
                >
                  <MaterialCommunityIcons name="plus" size={18} color="white" />
                  <Text className="text-white font-semibold ml-1">Add</Text>
                </TouchableOpacity>
              </View>

              {observations.length === 0 ? (
                <View className="bg-gray-50 rounded-xl p-8 items-center">
                  <MaterialCommunityIcons
                    name="binoculars"
                    size={48}
                    color="#d1d5db"
                  />
                  <Text className="text-gray-500 mt-4 text-center">
                    No observations yet. Be the first to add one!
                  </Text>
                  <TouchableOpacity
                    className="bg-green-600 rounded-lg px-6 py-3 mt-4"
                    onPress={() =>
                      router.push(
                        `../observation/create-observation?hikeId=${hikeId}` as any
                      )
                    }
                  >
                    <Text className="text-white font-bold">
                      Add Observation
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {observations.map((observation) => {
                    // Check if current user is the observation creator
                    const isObservationOwner =
                      currentUserId !== null &&
                      currentUserId === observation.userId;

                    return (
                      <View
                        key={observation.observationId}
                        className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                      >
                        {/* Observation Header */}
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                              {observation.userAvatar ? (
                                <Image
                                  source={{
                                    uri: `${process.env.EXPO_PUBLIC_BASE_URL}${observation.userAvatar}`,
                                  }}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <MaterialCommunityIcons
                                  name="account"
                                  size={20}
                                  color="#2563eb"
                                />
                              )}
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-gray-800 font-semibold">
                                {observation.username}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {new Date(
                                  observation.observationTime
                                ).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>

                          {observation.observationType && (
                            <View className="flex-row items-center">
                              <MaterialCommunityIcons
                                name={getObservationTypeIcon(
                                  observation.observationType
                                )}
                                size={16}
                                color="#6b7280"
                              />
                              <Text
                                className={`ml-1 text-xs font-semibold ${getObservationTypeColor(observation.observationType)}`}
                              >
                                {observation.observationType}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Observation Content */}
                        <Text className="text-gray-800 mb-3 leading-5">
                          {observation.observation}
                        </Text>

                        {observation.comments && (
                          <Text className="text-gray-600 text-sm italic mb-3">
                            {observation.comments}
                          </Text>
                        )}

                        {/* Observation Photo */}
                        {observation.photoUrl && (
                          <Image
                            source={{
                              uri: `${process.env.EXPO_PUBLIC_BASE_URL}${observation.photoUrl}`,
                            }}
                            className="w-full h-48 rounded-lg mb-3"
                            resizeMode="cover"
                          />
                        )}

                        {/* Location Info */}
                        {observation.latitude && observation.longitude && (
                          <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={16}
                              color="#2563eb"
                            />
                            <Text className="text-blue-600 text-sm ml-1">
                              {observation.latitude.toFixed(6)},{" "}
                              {observation.longitude.toFixed(6)}
                            </Text>
                          </View>
                        )}

                        {/* Action Buttons - Only shown to observation creator */}
                        {isObservationOwner && (
                          <View className="flex-row gap-2 border-t border-gray-100 pt-3">
                            <TouchableOpacity
                              className="flex-1 bg-blue-50 rounded-lg py-2 flex-row items-center justify-center"
                              onPress={() =>
                                router.push(
                                  `../observation/create-observation?id=${observation.observationId}&hideId=${hikeId}` as any
                                )
                              }
                            >
                              <MaterialCommunityIcons
                                name="pencil"
                                size={16}
                                color="#2563eb"
                              />
                              <Text className="text-blue-600 font-semibold ml-1 text-sm">
                                Edit
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              className="flex-1 bg-red-50 rounded-lg py-2 flex-row items-center justify-center"
                              onPress={() =>
                                handleDeleteObservation(
                                  observation.observationId
                                )
                              }
                            >
                              <MaterialCommunityIcons
                                name="delete"
                                size={16}
                                color="#dc2626"
                              />
                              <Text className="text-red-600 font-semibold ml-1 text-sm">
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
