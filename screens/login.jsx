import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const apiUrl = "https://c1-student.vsu.edu.ph";
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const loginResponse = await fetch(`${apiUrl}/api/sessions`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const responseData = await loginResponse.text();

      let loginData;
      try {
        loginData = JSON.parse(responseData);
      } catch (e) {
        console.error("Parse error:", e);
        throw new Error("Invalid server response format");
      }

      if (!loginResponse.ok) {
        throw new Error(
          loginData?.message || `HTTP error! status: ${loginResponse.status}`
        );
      }

      if (!loginData.success) {
        throw new Error(loginData.message || "Login failed");
      }

      const token = loginData.user.api_auth_token;
      if (!token) {
        throw new Error("No auth token received");
      }

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          token,
          username: username.trim(),
        })
      );

      const settingsResponse = await fetch(`${apiUrl}/api/users/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!settingsResponse.ok) {
        throw new Error(
          `Failed to fetch user settings: ${settingsResponse.status}`
        );
      }

      const settingsData = await settingsResponse.json();
      await AsyncStorage.setItem("settings", JSON.stringify(settingsData));
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error) {
      let errorMessage = "An error occurred during login";
      if (error.message.includes("Network request failed")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("Invalid server response format")) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes("Login failed")) {
        errorMessage = "Invalid username or password";
      }

      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>VSU Cumulus</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Note Text */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.noteText}>
          This app is not authorized by VSU. I built this as my personal project
          for quick checking of my grades, providing a more convenient
          alternative to using the official website. Please use this app
          responsibly.
        </Text>
      </TouchableOpacity>

      {/* Modal for the Note */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Important Note</Text>
            <Text style={styles.modalText}>
              This app is not authorized by VSU. I built this as my personal
              project for quick checking of my grades, providing a more
              convenient alternative to using the official website. Please use
              this app responsibly.
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    fontFamily: "Poppins-Regular",
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  loginButton: {
    height: 48,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  loginButtonText: {
    fontFamily: "Poppins-Medium",
    color: "#FFFFFF",
    fontSize: 16,
  },
  noteText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 20,
    marginBottom: 5,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 10,
  },
  modalText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default LoginPage;
