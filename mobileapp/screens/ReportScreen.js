
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function ReportScreen({ navigation }) {
  const scrollRef = useRef();

  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [uploading, setUploading] = useState(false);

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

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latStr},${lonStr}`;
      Linking.openURL(mapsUrl);
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error(error);
    }
  };

  const saveReportLocally = async (report) => {
    try {
      const existing = await AsyncStorage.getItem('reports');
      let reports = existing ? JSON.parse(existing) : [];
      reports.push(report);
      await AsyncStorage.setItem('reports', JSON.stringify(reports));
      console.log("✅ Report saved locally");
    } catch (err) {
      console.error("❌ Failed to save report locally:", err);
    }
  };

  // Clear form fields helper
  const clearForm = () => {
    setImageUri(null);
    setDescription('');
    setCity('');
    setLocation(null);
    setLocationText('');
    setFullAddress('');
  };
const handleUpload = async () => {
  if (!imageUri || !location) {
    Alert.alert("Error", "Please provide image and full location.");
    return;
  }

  setUploading(true);

  try {
    // Prepare form data for Cloudinary upload
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    formData.append("upload_preset", "road_report_preset");

    // Upload image to Cloudinary
    const cloudinaryRes = await fetch(
      "https://api.cloudinary.com/v1_1/dpzswyrhn/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryData.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    const imageUrl = cloudinaryData.secure_url;
    const coordsArray = [location.latitude, location.longitude];

    // Call your prediction API
    const predictRes = await fetch("http://192.168.11.157:8000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, location: coordsArray }),
    });

    // If server returns HTTP error (like 500 or 400)
    if (!predictRes.ok) {
      const errorText = await predictRes.text();
      console.error(
        "Prediction API error response:",
        predictRes.status,
        errorText
      );
      throw new Error(`Prediction API error: ${predictRes.status} ${errorText}`);
    }

    // Parse JSON response
    const predictData = await predictRes.json();
    console.log("Prediction API response:", predictData);

    // Check if response contains an error key - means invalid image
    if (predictData.error) {
      Alert.alert(
        "Invalid Image",
        predictData.error,
        [
          {
            text: "OK",
            onPress: () => clearForm(),
          },
        ],
        { cancelable: false }
      );
      setUploading(false);
      return;
    }

    // Now safely extract prediction details (valid response guaranteed here)
    const damage = Array.isArray(predictData.typeOfDamage)
      ? predictData.typeOfDamage.join(", ")
      : "Unknown";

    const severity = predictData.severity || "Unknown";

    const objects = Array.isArray(predictData.objectsDetected)
      ? predictData.objectsDetected.join(", ")
      : "None";

    // Prepare local report object
    const localReport = {
      imageUrl,
      description,
      state: city,
      coordinates: coordsArray,
      fullAddress,
      timestamp: new Date().toISOString(),
      damage,
      severity,
      objects,
    };

    await saveReportLocally(localReport);

    setUploading(false);
    navigation.navigate("UploadSuccess");
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    setUploading(false);
    Alert.alert("Error", error.message);
  }
};

  return (
    <ImageBackground source={require("../assets/d2.jpeg")} style={{ flex: 1, resizeMode: 'cover' }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 20, marginTop: 20,color: 'white' }}>
          Report an Incident
        </Text>

        <TouchableOpacity
          onPress={async () => {
            const result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }}
          style={styles.button}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>📷 Take Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          }}
          style={styles.button}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>🖼️ Select from Gallery</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 250, height: 200, marginVertical: 10, borderRadius: 10 }}
          />
        )}

        {/* <Text style={{ marginTop: 10 }}>Select State:</Text> */}
        <View style={{ backgroundColor: '#ADD8E6', marginBottom: 10, borderRadius: 8, width: 250 }}>
          <Picker
            selectedValue={city}
            onValueChange={(val) => setCity(val)}
            style={{ width: '100%' }}
            enabled={!uploading}
          >
            <Picker.Item label="Select a State" value="" />
            {indianStates.map((stateName) => (
              <Picker.Item key={stateName} label={stateName} value={stateName} />
            ))}
          </Picker>
        </View>

        <TextInput
          multiline
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          editable={!uploading}
          style={{
            backgroundColor: '#ADD8E6',
            borderRadius: 8,
            height: 50,
            width: 250,
            padding: 10,
            marginBottom: 10,
          }}
        />

        <TouchableOpacity
          onPress={handleGetLocation}
          style={[styles.button, { backgroundColor: '#4682B4' }]}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>📍 Get Location</Text>
        </TouchableOpacity>

        {locationText ? (
          <Text selectable style={{ marginVertical: 10, textAlign: 'center', color: 'white' }}>
            {locationText}
          </Text>
        ) : null}

        {fullAddress ? (
          <Text selectable style={{ marginBottom: 20, textAlign: 'center',  color: 'white',whiteSpace: 'pre-line' }}>
            {fullAddress}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#9ACD32' : '#90EE90',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            width: 250,
            marginBottom: 40,
          }}
        >
          <Text style={{ color: uploading ? '#666' : 'white', fontSize: 18 }}>
            {uploading ? 'Uploading...' : 'Upload Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      
      <Modal
        transparent={true}
        animationType="fade"
        visible={uploading}
        onRequestClose={() => { }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = {
  button: {
    backgroundColor: '#00AEEF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
};

