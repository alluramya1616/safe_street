import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput } from "react-native-paper";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const register = () => {
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
      Alert.alert("Validation Error", "Please fill out all the fields!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    // Proceed with registration logic here

    Alert.alert(
      "Success",
      "Registration successful. Please login to continue.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login", { registeredEmail: email }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require("../assets/logo.png")}
            />
            <Text style={styles.safeStreetText}>SAFE STREET</Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.registerText}>Register</Text>
          </View>

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
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.textInput}
              placeholderTextColor="#aaa"
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye" : "eye-off"}
                  color="#C4C4C4"
                  onPress={toggleShowPassword}
                />
              }
              theme={{ colors: { primary: "#000" } }}
            />

            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              style={styles.textInput}
              placeholderTextColor="#aaa"
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye" : "eye-off"}
                  color="#C4C4C4"
                  onPress={toggleShowConfirmPassword}
                />
              }
              theme={{ colors: { primary: "#000" } }}
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={register}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>Have an Account? Login</Text>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 200,
    resizeMode: "contain",
  },
  safeStreetText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 1,
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  registerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: 10,
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
  registerButton: {
    width: "90%",
    height: 50,
    backgroundColor: "#16247d",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  registerButtonText: {
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

export default RegisterScreen;