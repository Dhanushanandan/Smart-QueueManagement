import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../constants/useTheme";
import { auth } from "../services/firebaseAuth";

export default function SignupScreen() {
  const COLORS = useTheme();

  const [nic, setNic] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://192.168.251.40:5000/api/auth";

  const handleSignup = async () => {
    if (
      nic.trim() === "" ||
      name.trim() === "" ||
      dob.trim() === "" ||
      email.trim() === "" ||
      mobile.trim() === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await sendEmailVerification(userCredential.user);

      const token = await userCredential.user.getIdToken(true);

      const response = await fetch(`${API_URL}/save-pending-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nic: nic.trim(),
          name: name.trim(),
          dob: dob.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to save pending user");
        return;
      }

      Alert.alert(
        "Success",
        "Account created successfully. Now upload the birth certificate.",
        [
          {
            text: "OK",
            onPress: () => router.push("/upload-certificate"),
          },
        ],
      );
    } catch (error) {
      console.log("Signup error:", error);
      Alert.alert("Signup Error", error.message || "Network request failed");
    } finally {
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
    linkText: {
      marginTop: 20,
      color: COLORS.secondary,
      fontSize: 14,
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
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>SmartQueue</Text>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="NIC Number"
        placeholderTextColor={COLORS.gray}
        value={nic}
        onChangeText={setNic}
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={COLORS.gray}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth"
        placeholderTextColor={COLORS.gray}
        value={dob}
        onChangeText={setDob}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={COLORS.gray}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        placeholderTextColor={COLORS.gray}
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.gray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor={COLORS.gray}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
