import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "../constants/useTheme";

export default function SplashScreen() {
  const COLORS = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      testID="splashScreen"
      style={[styles.container, { backgroundColor: COLORS.background }]}
    >
      <Image
        testID="splashLogoImage"
        source={require("../assets/images/Logo.png")}
        style={styles.logoImage}
      />

      <Text testID="splashLogo" style={[styles.logoText, { color: COLORS.primary }]}>
        SmartQueue
      </Text>

      <ActivityIndicator
        testID="splashLoader"
        size="large"
        color={COLORS.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },

  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
});