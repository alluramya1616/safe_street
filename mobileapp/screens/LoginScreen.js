import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Alert
} from "react-native";
import { TextInput } from "react-native-paper";

// 👁️ Icon button for password visibility toggle
const IconButton = ({ icon = "eye-off", color = "#C4C4C4", onPress }) => (
  <TextInput.Icon icon={icon} color={color} onPress={onPress} />
);

const LoginScreen = ({ navigation, setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // login function for prototyping (you can replace with local logic or API later)
  const login = () => {
    if (email === "" || password === "") {
      Alert.alert("Login Failed", "Please enter both email and password.");
    } else {
      Alert.alert("Login Successful", `Welcome back, ${email}!`);
      // Navigate to Home or other screen if needed
      //navigation.navigate("Home");
      setIsLoggedIn(true); // 🔥 Set user as logged in
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require("../assets/logo.png")} />
      </View>

      {/* SAFE STREET text moved below logo */}
      <View style={styles.safeStreetContainer}>
        <Text style={styles.safeStreetText}>SAFE STREET</Text>
      </View>

      {/* Login text */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Login</Text>
      </View>

      {/* Email and Password Inputs */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
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
          style={styles.textInput}
          placeholder="Password"
          autoCapitalize="none"
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

      {/* Link to Register */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>Have an Account? Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, 
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: "contain",
  },
  safeStreetContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24, // Increased space after SAFE STREET text
  },
  safeStreetText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },
  textInput: {
    width: "90%",
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
    width: "90%",
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
