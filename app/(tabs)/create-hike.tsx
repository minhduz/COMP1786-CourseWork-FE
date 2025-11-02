import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
  createHike,
  CreateHikeRequest,
  getHikeById,
  updateHike,
} from "../../service/api/hike";

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
  const [trailType, setTrailType] = useState("");
  const [equipmentNeeded, setEquipmentNeeded] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");

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
      setTrailType(hike.trailType || "");
      setEquipmentNeeded(hike.equipmentNeeded || "");
      setWeatherConditions(hike.weatherConditions || "");
    } catch (error: any) {
      console.error("Failed to load hike:", error);
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
        trailType: trailType.trim() || undefined,
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
      console.error("Failed to save hike:", error);
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

            {/* Location */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Location <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Nepal Himalayas"
                value={location}
                onChangeText={setLocation}
              />
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

            {/* Trail Type */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Trail Type
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Loop, Out & Back, Point to Point"
                value={trailType}
                onChangeText={setTrailType}
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

            {/* Weather Conditions */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Weather Conditions
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Sunny, 20°C"
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
    </SafeAreaView>
  );
}
