
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { TextInput } from "react-native-paper";

const RegisterScreen = ({ navigation, setIsLoggedIn }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneInput, setPhoneInput] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //controls visibity of the password(swichting b/w 2 states i.e show and hide)
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const register = () => {
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
      Alert.alert("Validation Error", "Please fill out all the fields!");
    } else if (phoneNumber !== "" && !phoneInput?.isValidNumber(phoneNumber)) {
      Alert.alert("Validation Error", "Invalid Phone Number");
    } else if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
    } else {
      console.log("User Registered:", {
        name,
        phoneNumber,
        email,
        password,
      });
      Alert.alert("Success", `Welcome, ${name}! Registration successful.`);
      setIsLoggedIn(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo and SAFE STREET text */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require("../assets/logo.png")} />
        <Text style={styles.safeStreetText}>SAFE STREET</Text>
      </View>

      {/* Register Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.registerText}>Register</Text>
      </View>

      {/* Input Fields */}
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
        <PhoneInput
          ref={(input) => setPhoneInput(input)}
          defaultCode="IN"
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeFormattedText={(text) => {
            console.log("Formatted Phone Number:", text);
            setPhoneNumber(text);
          }}
          containerStyle={styles.phoneInputContainer}
          textContainerStyle={styles.phoneInputTextContainer}
          textInputStyle={styles.phoneInputText}
          codeTextStyle={{ color: "#000" }}
          textInputProps={{
            placeholderTextColor: "#aaa",
            style: { color: "#000" },
          }}
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

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={register}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Link to Login */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Have an Account? Login</Text>
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
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  phoneInputContainer: {
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    height: 50,
  },
  phoneInputTextContainer: {
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  phoneInputText: {
    color: "#000",
    fontSize: 16,
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
