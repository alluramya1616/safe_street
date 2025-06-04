import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Icon button for password visibility toggle
const IconButton = ({ icon = "eye-off", color = "#C4C4C4", onPress }) => (
  <TextInput.Icon icon={icon} color={color} onPress={onPress} />
);

const LoginScreen = ({ navigation, setIsLoggedIn, setUserInfo }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const login = async () => {
    if (name === "" || email === "" || password === "") {
      Alert.alert("Login Failed", "Please enter your name, email, and password.");
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem("users");
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];

      const matchedUser = parsedUsers.find(
        (user) =>
          user.name === name &&
          user.email === email &&
          user.password === password
      );

      if (matchedUser) {
        setUserInfo({ name: matchedUser.name, email: matchedUser.email });
        setIsLoggedIn(true);
        Alert.alert("Login Successful", `Welcome back, ${matchedUser.name}!`);
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong during login.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require("../assets/logo.png")} />
          </View>

          {/* SAFE STREET text */}
          <View style={styles.safeStreetContainer}>
            <Text style={styles.safeStreetText}>SAFE STREET</Text>
          </View>

          {/* Login title */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Login</Text>
          </View>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={styles.textInput}
              placeholderTextColor="#aaa"
              theme={{ colors: { primary: "#000" } }}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              style={styles.textInput}
              placeholderTextColor="#aaa"
              theme={{ colors: { primary: "#000" } }}
            />
            <TextInput
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              autoCapitalize="none"
              style={styles.textInput}
              placeholderTextColor="#aaa"
              right={
                <IconButton
                  icon={showPassword ? "eye" : "eye-off"}
                  color="#C4C4C4"
                  onPress={toggleShowPassword}
                />
              }
              theme={{ colors: { primary: "#000" } }}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.linkText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: "contain",
  },
  safeStreetContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  safeStreetText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loginText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    width: "90%",
    marginBottom: 24,
    alignItems: "center",
  },
  textInput: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderColor: "#ddd",
    borderWidth: 1,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#16247d",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginBottom: 16,
  },
  linkText: {
    color: "#1E88E5",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default LoginScreen;
