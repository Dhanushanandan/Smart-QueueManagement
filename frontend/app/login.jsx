import { router } from "expo-router";
import { reload, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../constants/useTheme";
import { auth } from "../services/firebaseAuth";

export default function LoginScreen() {
  const COLORS = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL;

  const showErrorAlert = (title, message) => {
    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (loading) return;

    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (!API_URL) {
      Alert.alert(
        "Configuration Error",
        "Backend API URL is missing. Please check EXPO_PUBLIC_AUTH_API_URL in your .env file.",
      );
      return;
    }

    setLoading(true);

    try {
      console.log("Login started for:", email.trim());

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      console.log("Firebase Auth login success:", userCredential.user.email);

      await reload(userCredential.user);

      if (!userCredential.user.emailVerified) {
        Alert.alert(
          "Verify Your Email",
          "Please verify your email first using the link sent to your email.",
        );
        setLoading(false);
        return;
      }

      const token = await userCredential.user.getIdToken(true);

      const checkResponse = await fetch(`${API_URL}/check-user-node`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const checkData = await checkResponse.json();

      console.log("check-user-node status:", checkResponse.status);
      console.log("check-user-node response:", checkData);

      if (!checkResponse.ok) {
        showErrorAlert(
          "Backend Error",
          checkData.message || `Backend error: ${checkResponse.status}`,
        );
        setLoading(false);
        return;
      }

      if (checkData.inUsers) {
        Alert.alert("Success", "Login successful");
        setLoading(false);
        router.replace("/dashboard");
        return;
      }

      if (checkData.inPendingUsers) {
        const finalizeResponse = await fetch(`${API_URL}/finalize-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const finalizeData = await finalizeResponse.json();

        console.log("finalize-user status:", finalizeResponse.status);
        console.log("finalize-user response:", finalizeData);

        if (!finalizeResponse.ok) {
          showErrorAlert(
            "Finalize Error",
            finalizeData.message ||
              `Finalize failed: ${finalizeResponse.status}`,
          );
          setLoading(false);
          return;
        }

        Alert.alert("Success", "Login successful");
        setLoading(false);
        router.replace("/dashboard");
        return;
      }

      showErrorAlert(
        "User Data Not Found",
        "Your Firebase account exists, but your user profile was not found in users or pendingUsers.",
      );
      setLoading(false);
    } catch (error) {
      console.log("Firebase login error code:", error?.code);
      console.log("Firebase login error message:", error?.message);

      try {
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

        console.log("check-pending-email status:", pendingResponse.status);
        console.log("check-pending-email response:", pendingData);

        if (pendingResponse.ok && pendingData.exists) {
          Alert.alert(
            "Verify Your Email",
            "Your account is in pendingUsers. Please verify your email first.",
          );
          setLoading(false);
          return;
        }
      } catch (checkError) {
        console.log("Pending email check failed:", checkError?.message);
      }

      let errorMessage = "Invalid email or password";

      switch (error?.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email format";
          break;
        case "auth/user-not-found":
          errorMessage = "No user found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error?.message || "Login failed";
      }

      showErrorAlert("Login Error", errorMessage);
      setLoading(false);
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
    logoImage: {
      width: 200,
      height: 120,
      borderRadius: 10,
      marginBottom: 15,
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
      backgroundColor: loading ? COLORS.gray : COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 25,
      marginTop: 10,
      opacity: loading ? 0.8 : 1,
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
  });

  return (
    <ScrollView testID="loginScreen" contentContainerStyle={styles.container}>
      <Image
        testID="loginLogoImage"
        source={require("../assets/images/Logo.png")}
        style={styles.logoImage}
      />

      <Text testID="loginTitle" style={styles.title}>
        Login
      </Text>

      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        testID="loginEmailInput"
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={COLORS.gray}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        testID="loginPasswordInput"
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.gray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        testID="loginButton"
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="goToRegisterButton"
        onPress={() => router.push("/signup")}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}