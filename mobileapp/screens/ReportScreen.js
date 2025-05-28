

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
  ImageBackground,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportScreen({ navigation }) {
  const scrollRef = useRef();

  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null); // raw coords
  const [locationText, setLocationText] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
  ];

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted' || locationStatus !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable camera, media, and location permissions.');
      }
    })();
  }, []);

  const handleGetLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      setLocation({ latitude, longitude });

      const latStr = latitude.toFixed(6);
      const lonStr = longitude.toFixed(6);
      setLocationText(`${latStr}, ${lonStr}`);

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const address = geocode[0];
        const area = address.suburb || address.neighborhood || address.locality || address.name || "Unknown Area";
        const cityName = address.city || address.district || "Unknown City";
        const stateName = address.region || "Unknown State";

        const formatted = `Area: ${area}
City: ${cityName}
State: ${stateName}
Latitude: ${latStr}
Longitude: ${lonStr}`;

        setFullAddress(formatted);
      }

      // Open in Google Maps
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latStr},${lonStr}`;
      Linking.openURL(mapsUrl);
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error(error);
    }
  };

  // Save report to AsyncStorage
  const saveReport = async (report) => {
    try {
      const storedReports = await AsyncStorage.getItem('reports');
      const reports = storedReports ? JSON.parse(storedReports) : [];
      reports.push(report);
      await AsyncStorage.setItem('reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || !location || !description || !city) {
      Alert.alert("Error", "Please fill all fields before uploading.");
      return;
    }

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      });
      formData.append("upload_preset", "road_report_preset");

      const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dpzswyrhn/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      const imageUrl = cloudinaryData.secure_url;

      const coordsArray = [
        location.latitude,
        location.longitude,
      ];

      // Create report object
      const newReport = {
        id: Date.now().toString(),
        coords: coordsArray,
        address: fullAddress || city,
        time: new Date().toISOString(),
        description,
        imageUrl,
        state: city,
      };

      // Save locally
      await saveReport(newReport);

      // Optionally send to server
      fetch("http://192.168.73.232:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          location: coordsArray,
        }),
      }).catch(error => {
        console.error("❌ Background server error:", error.message);
      });

      navigation.navigate("UploadSuccess");
      Alert.alert("Success", "Image uploaded and report saved locally.");

    } catch (error) {
      console.error("❌ Upload error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground source={require("../assets/pic3.jpg")} style={{ flex: 1, resizeMode: 'cover' }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 20, marginTop: 20 }}>
          Report an Incident
        </Text>

        {/* Take Picture */}
        <TouchableOpacity
          onPress={async () => {
            const result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>📷 Take Picture</Text>
        </TouchableOpacity>

        {/* Select from Gallery */}
        <TouchableOpacity
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>🖼️ Select from Gallery</Text>
        </TouchableOpacity>

        {/* Show selected image */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 250, height: 200, marginVertical: 10, borderRadius: 10 }}
          />
        )}

        {/* City/State Picker */}
        <Text style={{ marginTop: 10 }}>Select State:</Text>
        <View style={{ backgroundColor: '#ADD8E6', marginBottom: 10, borderRadius: 8, width: 250 }}>
          <Picker
            selectedValue={city}
            onValueChange={(val) => setCity(val)}
            style={{ width: '100%' }}
          >
            <Picker.Item label="-- Select State --" value="" />
            {indianStates.map((stateName) => (
              <Picker.Item key={stateName} label={stateName} value={stateName} />
            ))}
          </Picker>
        </View>

        {/* Description Input */}
        <TextInput
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: '#ADD8E6',
            width: 250,
            textAlignVertical: 'top',
          }}
        />

        {/* Get Live Location */}
        <TouchableOpacity
          onPress={handleGetLocation}
          style={{
            backgroundColor: '#FFB6C1',
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 10,
            width: 250,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>
            📍 Get Live Location
          </Text>
        </TouchableOpacity>

        {/* Show Full Address */}
        {fullAddress !== '' && (
          <Text style={{ marginBottom: 10, textAlign: 'center' }}>
            📌 Address: {"\n"}{fullAddress}
          </Text>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          onPress={handleUpload}
          style={{
            backgroundColor: '#90EE90',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 20,
            width: 250,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Upload Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = {
  button: {
    backgroundColor: '#ADD8E6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
};
