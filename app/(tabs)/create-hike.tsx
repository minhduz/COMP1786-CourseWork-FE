import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createHike,
  CreateHikeRequest,
  getHikeById,
  updateHike,
} from "../../service/api/hike";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const WEATHER_OPTIONS = [
  { label: "Sunny", icon: "weather-sunny", color: "#FDB813" },
  { label: "Partly Cloudy", icon: "weather-partly-cloudy", color: "#90A4AE" },
  { label: "Cloudy", icon: "weather-cloudy", color: "#78909C" },
  { label: "Rainy", icon: "weather-rainy", color: "#42A5F5" },
  { label: "Stormy", icon: "weather-lightning-rainy", color: "#5C6BC0" },
  { label: "Snowy", icon: "weather-snowy", color: "#E1F5FE" },
  { label: "Windy", icon: "weather-windy", color: "#80DEEA" },
  { label: "Foggy", icon: "weather-fog", color: "#B0BEC5" },
];

const TRAIL_TYPES = ["Loop", "Out & Back", "Point to Point"] as const;
type TrailType = (typeof TRAIL_TYPES)[number];

export default function CreateHikeForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hikeId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = hikeId !== null;

  // Form state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [hikeDate, setHikeDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [length, setLength] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<
    "Easy" | "Moderate" | "Difficult" | "Expert"
  >("Easy");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [elevationGain, setElevationGain] = useState("");
  const [trailType, setTrailType] = useState<TrailType>("Loop");
  const [equipmentNeeded, setEquipmentNeeded] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [selectedWeather, setSelectedWeather] = useState<string[]>([]);
  const [temperature, setTemperature] = useState("");
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);

  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 21.0285, // Default to Hanoi
    longitude: 105.8542,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [tempMarker, setTempMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Load hike data if editing
  useEffect(() => {
    if (isEditMode && hikeId) {
      loadHikeData();
    }
  }, [hikeId]);

  const loadHikeData = async () => {
    try {
      setInitialLoading(true);
      const hike = await getHikeById(hikeId!);

      // Populate form with existing data
      setName(hike.name);
      setLocation(hike.location);
      setHikeDate(new Date(hike.hikeDate));
      setParkingAvailable(hike.parkingAvailable);
      setLength(hike.length.toString());
      setDifficultyLevel(hike.difficultyLevel);
      setDescription(hike.description || "");
      setEstimatedDuration(hike.estimatedDuration || "");
      setElevationGain(hike.elevationGain?.toString() || "");

      // Set trail type if it matches one of the options
      if (hike.trailType && TRAIL_TYPES.includes(hike.trailType as TrailType)) {
        setTrailType(hike.trailType as TrailType);
      }

      setEquipmentNeeded(hike.equipmentNeeded || "");
      setWeatherConditions(hike.weatherConditions || "");
    } catch (error: any) {
      console.log("Failed to load hike:", error);
      Alert.alert("Error", "Failed to load hike details");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setHikeDate(selectedDate);
    }
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setTempMarker(coordinate);
  };

  const confirmMapLocation = async () => {
    if (tempMarker) {
      // Here you would typically use reverse geocoding to get the address
      // For now, we'll just use coordinates
      const address = `${tempMarker.latitude.toFixed(6)}, ${tempMarker.longitude.toFixed(6)}`;

      setLocationData({
        latitude: tempMarker.latitude,
        longitude: tempMarker.longitude,
        address: address,
      });
      setLocation(address);
      setShowMapPicker(false);
      setTempMarker(null);
    } else {
      Alert.alert("Error", "Please tap on the map to select a location");
    }
  };

  const handleWeatherSelection = (weather: string) => {
    setSelectedWeather((prev) => {
      if (prev.includes(weather)) {
        return prev.filter((w) => w !== weather);
      } else {
        return [...prev, weather];
      }
    });
  };

  const confirmWeatherSelection = () => {
    let weatherText = selectedWeather.join(", ");
    if (temperature.trim()) {
      weatherText += `, ${temperature.trim()}°C`;
    }
    setWeatherConditions(weatherText);
    setShowWeatherPicker(false);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Hike name is required");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Validation Error", "Location is required");
      return false;
    }
    if (
      !length.trim() ||
      isNaN(parseFloat(length)) ||
      parseFloat(length) <= 0
    ) {
      Alert.alert("Validation Error", "Please enter a valid length");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const hikeData: CreateHikeRequest = {
        name: name.trim(),
        location: location.trim(),
        hikeDate: hikeDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
        parkingAvailable,
        length: parseFloat(length),
        difficultyLevel,
        description: description.trim() || undefined,
        estimatedDuration: estimatedDuration.trim() || undefined,
        elevationGain: elevationGain.trim()
          ? parseFloat(elevationGain)
          : undefined,
        trailType: trailType || undefined,
        equipmentNeeded: equipmentNeeded.trim() || undefined,
        weatherConditions: weatherConditions.trim() || undefined,
      };

      if (isEditMode && hikeId) {
        // Update existing hike
        await updateHike(hikeId, hikeData);
        Alert.alert("Success", "Hike updated successfully", [
          {
            text: "OK",
            onPress: () => router.push(`./${hikeId}` as any),
          },
        ]);
      } else {
        // Create new hike
        const response = await createHike(hikeData);
        Alert.alert("Success", "Hike created successfully", [
          {
            text: "OK",
            onPress: () => router.push(`./${response.hikeId}` as any),
          },
        ]);
      }
    } catch (error: any) {
      console.log("Failed to save hike:", error);
      if (error.errors) {
        const errorMessages = error.errors.map((e: any) => e.msg).join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else if (error.error) {
        Alert.alert("Error", error.error);
      } else {
        Alert.alert("Error", "Failed to save hike");
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">Loading hike details...</Text>
      </View>
    );
  }

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
        <ScrollView className="flex-1">
          <View className="p-6">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Hike" : "Create New Hike"}
              </Text>
              <Text className="text-gray-500 mt-1">
                {isEditMode
                  ? "Update your hike details"
                  : "Fill in the details for your new hike"}
              </Text>
            </View>

            {/* Hike Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Hike Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Mount Everest Base Camp"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Location with Map Option */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Location <Text className="text-red-500">*</Text>
              </Text>

              {/* Location Input Methods */}
              <View className="flex-row gap-2 mb-2">
                <TouchableOpacity
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-center bg-gray-50"
                  onPress={() => setShowMapPicker(true)}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#2563eb"
                  />
                  <Text className="text-blue-600 font-semibold ml-2 text-sm">
                    Pick from Map
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Nepal Himalayas or tap to pick from map"
                value={location}
                onChangeText={setLocation}
              />

              {locationData && (
                <View className="flex-row items-center mt-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <MaterialCommunityIcons
                    name="map-marker-check"
                    size={16}
                    color="#2563eb"
                  />
                  <Text className="text-blue-600 text-xs ml-2">
                    Location selected from map
                  </Text>
                </View>
              )}
            </View>

            {/* Hike Date */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Hike Date <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-800">
                  {hikeDate.toLocaleDateString()}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={hikeDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Length */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Length (km) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., 12.5"
                value={length}
                onChangeText={setLength}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Difficulty Level */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Difficulty Level <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(["Easy", "Moderate", "Difficult", "Expert"] as const).map(
                  (level) => (
                    <TouchableOpacity
                      key={level}
                      className={`px-4 py-2 rounded-full ${
                        difficultyLevel === level
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                      onPress={() => setDifficultyLevel(level)}
                    >
                      <Text
                        className={`font-semibold ${
                          difficultyLevel === level
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Trail Type */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Trail Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TRAIL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-2 rounded-full ${
                      trailType === type ? "bg-green-600" : "bg-gray-200"
                    }`}
                    onPress={() => setTrailType(type)}
                  >
                    <Text
                      className={`font-semibold ${
                        trailType === type ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Parking Available */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Parking Availability
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center ${
                    parkingAvailable ? "bg-green-600" : "bg-gray-200"
                  }`}
                  onPress={() => setParkingAvailable(true)}
                >
                  <MaterialCommunityIcons
                    name="parking"
                    size={20}
                    color={parkingAvailable ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      parkingAvailable ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Available
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center ${
                    !parkingAvailable ? "bg-red-600" : "bg-gray-200"
                  }`}
                  onPress={() => setParkingAvailable(false)}
                >
                  <MaterialCommunityIcons
                    name="car-off"
                    size={20}
                    color={!parkingAvailable ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      !parkingAvailable ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Not Available
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Describe the hike..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Estimated Duration */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Estimated Duration
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., 4-5 hours"
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
              />
            </View>

            {/* Elevation Gain */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Elevation Gain (meters)
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., 500"
                value={elevationGain}
                onChangeText={setElevationGain}
                keyboardType="numeric"
              />
            </View>

            {/* Equipment Needed */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Equipment Needed
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Hiking boots, water, snacks"
                value={equipmentNeeded}
                onChangeText={setEquipmentNeeded}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Weather Conditions with Picker */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Weather Conditions
              </Text>

              <View className="flex-row gap-2 mb-2">
                <TouchableOpacity
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-center bg-gray-50"
                  onPress={() => setShowWeatherPicker(true)}
                >
                  <MaterialCommunityIcons
                    name="weather-partly-cloudy"
                    size={18}
                    color="#2563eb"
                  />
                  <Text className="text-blue-600 font-semibold ml-2 text-sm">
                    Quick Select
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Sunny, 20°C or use Quick Select"
                value={weatherConditions}
                onChangeText={setWeatherConditions}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-lg py-4 items-center"
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-lg py-4 items-center flex-row justify-center ${
                  loading ? "bg-blue-400" : "bg-blue-600"
                }`}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold ml-2">
                      {isEditMode ? "Updating..." : "Creating..."}
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={isEditMode ? "check" : "plus"}
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-bold ml-2">
                      {isEditMode ? "Update Hike" : "Create Hike"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
          <View className="flex-1">
            {/* Map Header */}
            <View className="px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">
                Select Location
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Tap on the map to choose your hiking location
              </Text>
            </View>

            {/* Map View */}
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
            >
              {tempMarker && (
                <Marker
                  coordinate={tempMarker}
                  title="Selected Location"
                  pinColor="#2563eb"
                />
              )}
            </MapView>

            {/* Map Footer Actions */}
            <View className="px-4 py-4 border-t border-gray-200 bg-white">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  onPress={() => {
                    setShowMapPicker(false);
                    setTempMarker(null);
                  }}
                >
                  <Text className="text-gray-700 font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                  onPress={confirmMapLocation}
                >
                  <Text className="text-white font-bold">Confirm Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Weather Picker Modal */}
      <Modal
        visible={showWeatherPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWeatherPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: "80%" }}>
            {/* Weather Picker Header */}
            <View className="px-4 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">
                Select Weather Conditions
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Choose one or more weather conditions
              </Text>
            </View>

            <ScrollView className="px-4 py-4">
              {/* Weather Options */}
              <View className="flex-row flex-wrap gap-3 mb-4">
                {WEATHER_OPTIONS.map((weather) => {
                  const isSelected = selectedWeather.includes(weather.label);
                  return (
                    <TouchableOpacity
                      key={weather.label}
                      className={`px-4 py-3 rounded-lg flex-row items-center ${
                        isSelected
                          ? "bg-blue-100 border-2 border-blue-600"
                          : "bg-gray-100"
                      }`}
                      onPress={() => handleWeatherSelection(weather.label)}
                    >
                      <MaterialCommunityIcons
                        name={weather.icon as any}
                        size={24}
                        color={isSelected ? "#2563eb" : weather.color}
                      />
                      <Text
                        className={`ml-2 font-semibold ${
                          isSelected ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {weather.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Temperature Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Temperature (Optional)
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                  <TextInput
                    className="flex-1 text-gray-800"
                    placeholder="e.g., 20"
                    value={temperature}
                    onChangeText={setTemperature}
                    keyboardType="numeric"
                  />
                  <Text className="text-gray-500 font-semibold">°C</Text>
                </View>
              </View>
            </ScrollView>

            {/* Weather Picker Footer */}
            <View className="px-4 py-4 border-t border-gray-200">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  onPress={() => {
                    setShowWeatherPicker(false);
                    setSelectedWeather([]);
                    setTemperature("");
                  }}
                >
                  <Text className="text-gray-700 font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                  onPress={confirmWeatherSelection}
                >
                  <Text className="text-white font-bold">Apply Weather</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
