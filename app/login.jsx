import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { signInWithEmailAndPassword, reload } from "firebase/auth";
import { auth } from "../services/firebaseAuth";
import { router } from "expo-router";
import { useTheme } from "../constants/useTheme";

export default function LoginScreen() {
  const COLORS = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = "http://192.168.1.65:5000/api/auth";

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await reload(userCredential.user);

      if (!userCredential.user.emailVerified) {
        Alert.alert(
          "Verify Your Email",
          "Please verify your email first using the link sent to your email.",
        );
        return;
      }

      const token = await userCredential.user.getIdToken(true);

      // check if user already exists in users node
      const checkResponse = await fetch(`${API_URL}/check-user-node`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        Alert.alert("Error", checkData.message || "Something went wrong");
        return;
      }

      // already in users node
      if (checkData.inUsers) {
        Alert.alert("Success", "Login successful");
        router.push("/dashboard");
        return;
      }

      // still in pendingUsers node, so move it to users
      if (checkData.inPendingUsers) {
        const finalizeResponse = await fetch(`${API_URL}/finalize-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const finalizeData = await finalizeResponse.json();

        if (!finalizeResponse.ok) {
          Alert.alert("Error", finalizeData.message || "Failed to move user");
          return;
        }

        Alert.alert("Success", "Login successful");
        router.push("/dashboard");
        return;
      }

      Alert.alert("Error", "User data not found");
    } catch (error) {
      try {
        // auth failed -> check if email exists in pendingUsers
        const pendingResponse = await fetch(`${API_URL}/check-pending-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        });

        const pendingData = await pendingResponse.json();

        if (pendingResponse.ok && pendingData.exists) {
          Alert.alert(
            "Verify Your Email",
            "Your account is in pendingUsers. Please verify your email first.",
          );
        } else {
          Alert.alert("Login Error", "Invalid email or password");
        }
      } catch (checkError) {
        Alert.alert("Login Error", "Invalid email or password");
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    // 🔵 Circular Image Style
    logoImage: {
      width: 200,
      height: 120,
      borderRadius: 10, 
      marginBottom: 15,
    },
    logo: {
      fontSize: 26,
      fontWeight: "bold",
      color: COLORS.primary,
      marginBottom: 10,
    },
    title: {
      fontSize: 36,
      fontWeight: "bold",
      color: COLORS.text,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.gray,
      marginBottom: 25,
    },
    input: {
      width: "100%",
      height: 52,
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      color: COLORS.text,
    },
    button: {
      width: "100%",
      height: 52,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 25,
      marginTop: 10,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "bold",
    },
    linkText: {
      marginTop: 20,
      color: COLORS.secondary,
      fontSize: 14,
    },
    noteText: {
      marginTop: 15,
      color: COLORS.gray,
      fontSize: 13,
      textAlign: "center",
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/images/Logo.png")}
        style={styles.logoImage}
      />
      {/* <Text style={styles.logo}>SmartQueue</Text> */}
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={COLORS.gray}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.gray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.linkText}>Don’t have an account? Register</Text>
      </TouchableOpacity>

      <Text style={styles.noteText}>
        After clicking the verification link in your email, come back and login.
      </Text>
    </ScrollView>
  );
}
