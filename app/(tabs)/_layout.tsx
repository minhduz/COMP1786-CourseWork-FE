import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { isAuthenticated } from "../../service/utils/auth-utils";

/**
 * Main App Tabs Layout
 * Protected screens - only shown when user is authenticated
 * Contains Home, Hikes, Profile, etc.
 */
export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        // User not authenticated, redirect to signin
        router.replace("/(auth)/signin");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "M-Hike",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hikes Tab */}
      <Tabs.Screen
        name="hikes"
        options={{
          title: "Hikes",
          headerTitle: "Hikes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker-multiple-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create-hike"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen name="[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="my-hikes"
        options={{ href: null, title: "Hikes", headerTitle: "My Hikes" }}
      />
    </Tabs>
  );
}
