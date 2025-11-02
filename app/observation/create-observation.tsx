import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  createObservation,
  CreateObservationRequest,
  getObservationById,
  updateObservation,
  UpdateObservationRequest,
} from "../../service/api/observation";

export default function CreateObservationForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hikeId = params.hikeId ? parseInt(params.hikeId as string) : null;
  const observationId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = observationId !== null;

  // Form state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [observation, setObservation] = useState("");
  const [observationTime, setObservationTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [comments, setComments] = useState("");
  const [observationType, setObservationType] = useState<
    | "Wildlife"
    | "Vegetation"
    | "Weather"
    | "Trail Condition"
    | "Other"
    | undefined
  >(undefined);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photo, setPhoto] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false); // ✅ ADDED

  // Load observation data if editing
  useEffect(() => {
    if (isEditMode && observationId) {
      loadObservationData();
    }
  }, [observationId]);

  const loadObservationData = async () => {
    try {
      setInitialLoading(true);
      const obs = await getObservationById(observationId!);

      // Populate form with existing data
      setObservation(obs.observation);
      setObservationTime(new Date(obs.observationTime));
      setComments(obs.comments || "");
      setObservationType(obs.observationType || undefined);
      setLatitude(obs.latitude?.toString() || "");
      setLongitude(obs.longitude?.toString() || "");
      setExistingPhotoUrl(obs.photoUrl || null);
    } catch (error: any) {
      console.error("Failed to load observation:", error);
      Alert.alert("Error", "Failed to load observation details");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const newDateTime = new Date(observationTime);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setObservationTime(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newDateTime = new Date(observationTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setObservationTime(newDateTime);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhoto({
          uri: asset.uri,
          type: "image/jpeg",
          name: `observation_${Date.now()}.jpg`,
        });
        // Clear existing photo URL when new photo is selected
        setExistingPhotoUrl(null);
        setShouldDeletePhoto(false); // ✅ ADDED - Reset delete flag
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhoto({
          uri: asset.uri,
          type: "image/jpeg",
          name: `observation_${Date.now()}.jpg`,
        });
        // Clear existing photo URL when new photo is taken
        setExistingPhotoUrl(null);
        setShouldDeletePhoto(false); // ✅ ADDED - Reset delete flag
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setExistingPhotoUrl(null);
    setShouldDeletePhoto(true); // ✅ ADDED - Mark for deletion
  };

  const showPhotoOptions = () => {
    Alert.alert("Add Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Library",
        onPress: pickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const validateForm = (): boolean => {
    if (!observation.trim()) {
      Alert.alert("Validation Error", "Observation is required");
      return false;
    }
    if (
      latitude &&
      (isNaN(parseFloat(latitude)) ||
        parseFloat(latitude) < -90 ||
        parseFloat(latitude) > 90)
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid latitude (-90 to 90)"
      );
      return false;
    }
    if (
      longitude &&
      (isNaN(parseFloat(longitude)) ||
        parseFloat(longitude) < -180 ||
        parseFloat(longitude) > 180)
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid longitude (-180 to 180)"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!hikeId && !isEditMode) {
      Alert.alert("Error", "Hike ID is required");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && observationId) {
        // ✅ UPDATED - Handle photo deletion logic
        console.log("📝 Updating observation...");
        console.log("  - shouldDeletePhoto:", shouldDeletePhoto);
        console.log("  - photo:", photo);
        console.log("  - existingPhotoUrl:", existingPhotoUrl);

        // Update existing observation
        const updateData: UpdateObservationRequest = {
          observation: observation.trim(),
          observationTime: observationTime.toISOString(),
          comments: comments.trim() || undefined,
          observationType: observationType,
          latitude: latitude.trim() ? parseFloat(latitude) : undefined,
          longitude: longitude.trim() ? parseFloat(longitude) : undefined,
        };

        // Handle photo logic
        if (shouldDeletePhoto && !photo) {
          // User deleted the photo and didn't add a new one
          console.log("🗑️ Marking photo for deletion");
          updateData.photo = null as any; // This signals deletion to API
        } else if (photo) {
          // User added/replaced the photo
          console.log("📸 Adding/replacing photo");
          updateData.photo = photo;
        } else {
          console.log("📷 No photo changes");
        }

        await updateObservation(observationId, updateData);
        Alert.alert("Success", "Observation updated successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Create new observation
        const observationData: CreateObservationRequest = {
          observation: observation.trim(),
          observationTime: observationTime.toISOString(),
          comments: comments.trim() || undefined,
          observationType: observationType,
          latitude: latitude.trim() ? parseFloat(latitude) : undefined,
          longitude: longitude.trim() ? parseFloat(longitude) : undefined,
          photo: photo || undefined,
        };

        await createObservation(hikeId!, observationData);
        Alert.alert("Success", "Observation created successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Failed to save observation:", error);
      if (error.errors) {
        const errorMessages = error.errors.map((e: any) => e.msg).join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else if (error.error) {
        Alert.alert("Error", error.error);
      } else {
        Alert.alert("Error", "Failed to save observation");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoPath: string | null | undefined): string | null => {
    if (!photoPath) return null;

    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

    // If photo path already starts with http, return as is
    if (photoPath.startsWith("http")) {
      return photoPath;
    }

    // Remove leading slash if present to avoid double slashes
    const path = photoPath.startsWith("/") ? photoPath.slice(1) : photoPath;

    return `${baseUrl}/${path}`;
  };

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">
          Loading observation details...
        </Text>
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
                {isEditMode ? "Edit Observation" : "Create New Observation"}
              </Text>
              <Text className="text-gray-500 mt-1">
                {isEditMode
                  ? "Update your observation details"
                  : "Record what you observed during the hike"}
              </Text>
            </View>

            {/* Observation */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Observation <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="e.g., Spotted a deer near the trail"
                value={observation}
                onChangeText={setObservation}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Observation Type */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Observation Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  [
                    "Wildlife",
                    "Vegetation",
                    "Weather",
                    "Trail Condition",
                    "Other",
                  ] as const
                ).map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-2 rounded-full ${
                      observationType === type ? "bg-blue-600" : "bg-gray-200"
                    }`}
                    onPress={() => setObservationType(type)}
                  >
                    <Text
                      className={`font-semibold ${
                        observationType === type
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {observationType && (
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => setObservationType(undefined)}
                >
                  <Text className="text-blue-600 text-sm">Clear selection</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Observation Date */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Observation Date <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-800">
                  {observationTime.toLocaleDateString()}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={observationTime}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Observation Time */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Observation Time <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className="text-gray-800">
                  {observationTime.toLocaleTimeString()}
                </Text>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={observationTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Comments */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Additional Comments
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Add any additional notes or context..."
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Location Coordinates */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Location (Optional)
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-gray-600 text-xs mb-1">Latitude</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="e.g., 40.7128"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-xs mb-1">Longitude</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="e.g., -74.0060"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                Enter coordinates to mark the exact location of your observation
              </Text>
            </View>

            {/* Photo */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Photo (Optional)
              </Text>

              {photo || existingPhotoUrl ? (
                <View className="relative">
                  <Image
                    source={{
                      uri:
                        photo?.uri ||
                        getPhotoUrl(existingPhotoUrl) ||
                        undefined,
                    }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-red-600 rounded-full p-2"
                    onPress={removePhoto}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2"
                    onPress={showPhotoOptions}
                  >
                    <MaterialCommunityIcons
                      name="camera"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="border-2 border-dashed border-gray-300 rounded-lg py-8 items-center"
                  onPress={showPhotoOptions}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={48}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-500 mt-2">Tap to add a photo</Text>
                </TouchableOpacity>
              )}
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
                      {isEditMode ? "Update Observation" : "Create Observation"}
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
