import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  isAuthenticated,
  getAuthToken,
  isTokenExpired,
} from "../service/utils/auth-utils";

export default function Index() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from AsyncStorage
        const token = await getAuthToken();

        if (token && !isTokenExpired(token)) {
          // Token exists and is not expired
          setIsAuth(true);
          console.log("[Index] User authenticated");
        } else {
          // No token or token expired
          setIsAuth(false);
          console.log("[Index] User not authenticated");
        }
      } catch (error) {
        console.error("[Index] Error checking authentication:", error);
        setIsAuth(false);
      } finally {
        // Hide splash screen after auth check
        await SplashScreen.hideAsync();
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (!authChecked || isAuth === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuth) {
    console.log("[Index] Redirecting to (tabs)");
    return <Redirect href="/(tabs)" />;
  } else {
    console.log("[Index] Redirecting to (auth)");
    return <Redirect href="/(auth)" />;
  }
}
