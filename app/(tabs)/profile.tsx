import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  changePassword,
  getProfile,
  GetProfileResponse,
  getUserByUsername,
  logout,
  updateProfile,
} from "../../service/api/auth";
import { clearAuthData } from "../../service/utils/auth-utils";
import { getAvatarUrl } from "../../service/utils/url";

export default function ProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username?: string }>();

  const [user, setUser] = useState<GetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Edit form state
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Reset all states when the screen is focused
      resetStates();
      loadProfile();
    }, [username])
  );

  const resetStates = () => {
    setEditMode(false);
    setShowPasswordChange(false);
    setSelectedAvatar(null);
    setEditEmail("");
    setEditPhone("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // If username is provided in params, fetch that user's profile (public view)
      if (username) {
        const profile = await getUserByUsername(username as string);
        setUser(profile);
        setIsOwnProfile(false);
      } else {
        // Otherwise, fetch the authenticated user's own profile
        const profile = await getProfile();
        setUser(profile);
        setIsOwnProfile(true);
        setEditEmail(profile.email);
        setEditPhone(profile.phone || "");
      }
    } catch (error) {
      console.log("Failed to load profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProfile().then(() => setRefreshing(false));
  }, [username]);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar({
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: `avatar-${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData: any = {
        email: editEmail,
        phone: editPhone,
      };

      if (selectedAvatar) {
        updateData.avatar = selectedAvatar;
      }

      await updateProfile(updateData);
      Alert.alert("Success", "Profile updated successfully");
      setEditMode(false);
      setSelectedAvatar(null);
      loadProfile();
    } catch (error: any) {
      console.log("Update profile error:", error);

      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors
          .map((err: any) => err.msg)
          .join("\n");
        Alert.alert("Error", errorMessages);
      }
      // Handle single error message
      else if (error.error) {
        Alert.alert("Error", error.error);
      }
      // Handle other error types
      else if (error.message) {
        Alert.alert("Error", error.message);
      }
      // Fallback error message
      else {
        Alert.alert("Error", "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      Alert.alert("Success", "Password changed successfully");
      setShowPasswordChange(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.log("Change password error:", error);

      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors
          .map((err: any) => err.msg)
          .join("\n");
        Alert.alert("Error", errorMessages);
      }
      // Handle single error message
      else if (error.error) {
        Alert.alert("Error", error.error);
      }
      // Handle other error types
      else if (error.message) {
        Alert.alert("Error", error.message);
      }
      // Fallback error message
      else {
        Alert.alert("Error", "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            await clearAuthData();
            router.replace("/(auth)/signin");
          } catch (error) {
            console.log("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  // Get the full avatar URL
  const avatarUrl = getAvatarUrl(user?.avatar);

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
        {/* Profile Header - Shown for both own and other profiles */}
        {!editMode && !showPasswordChange && (
          <>
            {/* Avatar */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={48}
                    color="#2563eb"
                  />
                )}
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {user?.username}
              </Text>
              {!isOwnProfile && (
                <Text className="text-gray-500 text-sm mt-1">
                  Public Profile
                </Text>
              )}
            </View>

            {/* Profile Info - Now shows email and phone for both own and other profiles */}
            <View className="bg-gray-50 rounded-lg p-6 mb-6">
              <View className="mb-4">
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  EMAIL
                </Text>
                <Text className="text-gray-800 text-base">{user?.email}</Text>
              </View>

              {user?.phone && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm font-semibold mb-1">
                    PHONE
                  </Text>
                  <Text className="text-gray-800 text-base">{user.phone}</Text>
                </View>
              )}

              <View>
                <Text className="text-gray-500 text-sm font-semibold mb-1">
                  JOINED
                </Text>
                <Text className="text-gray-800 text-base">
                  {new Date(user?.createdAt || "").toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons - Only show for own profile */}
            {isOwnProfile && (
              <>
                <TouchableOpacity
                  className="bg-blue-600 rounded-lg px-4 py-3 mb-3 flex-row items-center justify-center"
                  onPress={() => setEditMode(true)}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold text-base">
                    Edit Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-orange-600 rounded-lg px-4 py-3 mb-3 flex-row items-center justify-center"
                  onPress={() => setShowPasswordChange(true)}
                >
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-bold text-base">
                    Change Password
                  </Text>
                </TouchableOpacity>

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
                  <Text className="text-white font-bold text-base">Logout</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back Button - Show for other users' profiles */}
            {!isOwnProfile && (
              <TouchableOpacity
                className="bg-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-center"
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold text-base">Go Back</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Edit Mode - Only available for own profile */}
        {editMode && !showPasswordChange && isOwnProfile && (
          <>
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              Edit Profile
            </Text>

            {/* Avatar Change */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
                {selectedAvatar ? (
                  <Image
                    source={{ uri: selectedAvatar.uri }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={48}
                    color="#2563eb"
                  />
                )}
              </View>
              <TouchableOpacity
                className="bg-blue-100 rounded-lg px-4 py-2"
                onPress={handlePickAvatar}
              >
                <Text className="text-blue-600 font-semibold">
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Phone Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Phone (Optional)
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Phone number"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Save/Cancel Buttons */}
            <TouchableOpacity
              className="bg-green-600 rounded-lg px-4 py-3 mb-3"
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text className="text-white font-bold text-center">
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-400 rounded-lg px-4 py-3"
              onPress={() => {
                setEditMode(false);
                setSelectedAvatar(null);
              }}
              disabled={loading}
            >
              <Text className="text-white font-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Password Change Mode - Only available for own profile */}
        {showPasswordChange && !editMode && isOwnProfile && (
          <>
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              Change Password
            </Text>

            {/* Old Password */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Current Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="Enter current password"
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <MaterialCommunityIcons
                    name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                New Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="Enter new password (min 8 characters)"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <MaterialCommunityIcons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Confirm New Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
                <TextInput
                  className="flex-1 text-gray-800"
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Change/Cancel Buttons */}
            <TouchableOpacity
              className="bg-orange-600 rounded-lg px-4 py-3 mb-3"
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text className="text-white font-bold text-center">
                {loading ? "Changing..." : "Change Password"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-400 rounded-lg px-4 py-3"
              onPress={() => {
                setShowPasswordChange(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={loading}
            >
              <Text className="text-white font-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
