import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStoredUser } from "../../service/api/auth";
import { getMyObservations, Observation } from "../../service/api/observation";

export default function MyObservationsScreen() {
  const router = useRouter();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadObservations();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadObservations = async () => {
    try {
      setLoading(true);
      const response = await getMyObservations();
      setObservations(response.observations);
    } catch (error: any) {
      console.log("Failed to load observations:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadObservations().then(() => setRefreshing(false));
  }, []);

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
        return "bg-amber-100";
      case "Vegetation":
        return "bg-green-100";
      case "Weather":
        return "bg-blue-100";
      case "Trail Condition":
        return "bg-gray-100";
      case "Other":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  const getObservationTypeTextColor = (type?: string | null) => {
    switch (type) {
      case "Wildlife":
        return "text-amber-700";
      case "Vegetation":
        return "text-green-700";
      case "Weather":
        return "text-blue-700";
      case "Trail Condition":
        return "text-gray-700";
      case "Other":
        return "text-purple-700";
      default:
        return "text-gray-700";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const renderObservationItem = ({ item }: { item: Observation }) => (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-lg p-4 mt-4 mx-6 shadow-sm"
      onPress={() => router.push(`../observation/${item.observationId}` as any)}
    >
      {/* Header with User Info and Type */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-2">
            {currentUser?.avatar ? (
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_BASE_URL}${currentUser.avatar}`,
                }}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <MaterialCommunityIcons
                name="account"
                size={16}
                color="#16a34a"
              />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Your observation</Text>
            <Text className="text-sm font-semibold text-gray-700">
              {currentUser?.username || "You"}
            </Text>
          </View>
        </View>
        {item.observationType && (
          <View
            className={`${getObservationTypeColor(item.observationType)} rounded-full px-3 py-1 flex-row items-center`}
          >
            <MaterialCommunityIcons
              name={getObservationTypeIcon(item.observationType)}
              size={12}
              color={getObservationTypeTextColor(item.observationType).replace(
                "text-",
                "#"
              )}
            />
            <Text
              className={`text-xs font-semibold ml-1 ${getObservationTypeTextColor(item.observationType)}`}
            >
              {item.observationType}
            </Text>
          </View>
        )}
      </View>

      {/* Observation Text */}
      <Text className="text-base text-gray-800 mb-3" numberOfLines={3}>
        {item.observation}
      </Text>

      {/* Comments Preview (if exists) */}
      {item.comments && (
        <Text className="text-gray-600 text-sm italic mb-3" numberOfLines={2}>
          {item.comments}
        </Text>
      )}

      {/* Photo Preview */}
      {item.photoUrl && (
        <Image
          source={{
            uri: `${process.env.EXPO_PUBLIC_BASE_URL}${item.photoUrl}`,
          }}
          className="w-full h-48 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}

      {/* Hike Details */}
      {item.hikeName && (
        <View className="bg-blue-50 rounded-lg p-3 mb-3">
          <View className="flex-row items-center mb-1">
            <MaterialCommunityIcons name="hiking" size={16} color="#2563eb" />
            <Text className="ml-2 text-blue-700 font-semibold">
              {item.hikeName}
            </Text>
          </View>
          {item.hikeLocation && (
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#6b7280"
              />
              <Text className="ml-2 text-gray-600 text-sm">
                {item.hikeLocation}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Location Info */}
      {item.latitude && item.longitude && (
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color="#6b7280"
          />
          <Text className="ml-2 text-gray-600 text-xs">
            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="border-t border-gray-200 pt-3 flex-row justify-between items-center">
        <Text className="text-sm text-gray-500">
          {new Date(item.observationTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#16a34a"
        />
      </View>
    </TouchableOpacity>
  );

  // Calculate statistics
  const typeBreakdown = observations.reduce(
    (acc, obs) => {
      const type = obs.observationType || "Unspecified";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const withPhotos = observations.filter((obs) => obs.photoUrl).length;
  const withLocation = observations.filter(
    (obs) => obs.latitude && obs.longitude
  ).length;

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
          data={observations}
          renderItem={renderObservationItem}
          keyExtractor={(item) => item.observationId.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <MaterialCommunityIcons
                name="binoculars"
                size={64}
                color="#d1d5db"
              />
              <Text className="text-gray-500 mt-4 text-center px-8 text-lg font-semibold">
                No observations yet
              </Text>
              <Text className="text-gray-400 mt-2 text-center px-8">
                Start exploring and document your findings!
              </Text>
              <TouchableOpacity
                className="bg-green-600 rounded-lg px-6 py-3 mt-6 flex-row items-center"
                onPress={() => router.push("../(tabs)/hikes")}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="white"
                />
                <Text className="text-white font-bold ml-2">Explore Hikes</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            observations.length > 0 ? (
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">
                      My Observations
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {observations.length}{" "}
                      {observations.length === 1
                        ? "observation"
                        : "observations"}{" "}
                      recorded
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-green-600 rounded-lg px-4 py-2 flex-row items-center"
                    onPress={() => router.push("../hike")}
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
                  <View className="flex-1 bg-green-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="image-outline"
                        size={20}
                        color="#16a34a"
                      />
                      <Text className="text-green-600 font-bold text-lg">
                        {withPhotos}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">
                      With Photos
                    </Text>
                  </View>

                  <View className="flex-1 bg-blue-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color="#2563eb"
                      />
                      <Text className="text-blue-600 font-bold text-lg">
                        {withLocation}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">
                      With Location
                    </Text>
                  </View>

                  <View className="flex-1 bg-purple-50 rounded-lg p-3">
                    <View className="flex-row items-center justify-between">
                      <MaterialCommunityIcons
                        name="format-list-bulleted-type"
                        size={20}
                        color="#9333ea"
                      />
                      <Text className="text-purple-600 font-bold text-lg">
                        {Object.keys(typeBreakdown).length}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-xs mt-1">Types</Text>
                  </View>
                </View>

                {/* Type Breakdown */}
                {Object.keys(typeBreakdown).length > 0 && (
                  <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Observation Types
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {Object.entries(typeBreakdown).map(([type, count]) => (
                        <View
                          key={type}
                          className={`${getObservationTypeColor(type === "Unspecified" ? null : type)} rounded-full px-3 py-1 flex-row items-center`}
                        >
                          <MaterialCommunityIcons
                            name={getObservationTypeIcon(
                              type === "Unspecified" ? null : type
                            )}
                            size={14}
                            color="#6b7280"
                          />
                          <Text className="text-xs text-gray-700 ml-1">
                            {type}: {count}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
