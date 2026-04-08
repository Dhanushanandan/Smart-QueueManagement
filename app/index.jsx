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
      router.replace("/login"); // 🔥 use lowercase
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: COLORS.background }]}
    >
      {/* 🔵 Circular Logo */}
      <Image
        source={require("../assets/images/Logo.png")}
        style={styles.logoImage}
      />

      {/* App Name */}
      <Text style={[styles.logoText, { color: COLORS.primary }]}>
        SmartQueue
      </Text>

      {/* Loader */}
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔵 Circular Image Style
  logoImage: {
    width: 200,
    height: 120,
    borderRadius: 10, // makes it circle
    marginBottom: 15,
  },

  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
});