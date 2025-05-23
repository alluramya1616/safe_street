
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   Image,
//   TextInput,
//   Alert,
//   TouchableOpacity,
//   ScrollView,
//   Linking,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as Location from 'expo-location';
// import { Picker } from '@react-native-picker/picker';

// export default function ReportScreen({ navigation }) {
//   const scrollRef = useRef();

//   const [imageUri, setImageUri] = useState(null);
//   const [description, setDescription] = useState('');
//   const [uploadStatus, setUploadStatus] = useState(null);
//   //const [stars, setStars] = useState(0);
//   const [city, setCity] = useState('');
//   const [area, setArea] = useState('');
//   const [location, setLocation] = useState(null);
//   const [locationText, setLocationText] = useState('');

//   const cities = {
//     Chennai: ["T. Nagar",
//   "Velachery",
//   "Adyar",
//   "Anna Nagar",
//   "Kodambakkam",
//   "Mylapore",
//   "Nungambakkam",
//   "Tambaram",
//   "Guindy",
//   "Besant Nagar"],
//   Delhi: ["Connaught Place",
//   "Karol Bagh",
//   "Chanakyapuri",
//   "Saket",
//   "Hauz Khas",
//   "Lajpat Nagar",
//   "Rohini",
//   "Dwarka",
//   "Vasant Kunj",
//   "Pitampura"],
//     Hyderabad: [
//       "Narayanaguda",
//       "Himayathnagar",
//       "Banjara Hills",
//       "Jubilee Hills",
//       "Madhapur",
//       "Gachibowli",
//       "Begumpet",
//       "Ameerpet",
//       "Kukatpally",
//       "Secunderabad",
//       "Somajiguda",
//       "Mehdipatnam",
//       "Charminar",
//       "Dilsukhnagar",
//       "LB Nagar"
//     ]
    
//   };
//  //request permissin on load
//   useEffect(() => {
//     (async () => {
//       const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

//       if (
//         cameraStatus !== 'granted' ||
//         mediaStatus !== 'granted' ||
//         locationStatus !== 'granted'
//       ) {
//         Alert.alert('Permissions Required', 'Please enable camera, media, and location permissions.');
//       }
//     })();
//   }, []);
//   const handleGetLocation = async () => {
//     try {
//       const loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc);  // this should be setGeoLocation ideally
//       const coords = `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`;
//       setLocationText(coords);
  
//       // Open location in Google Maps
//       const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
//       Linking.openURL(mapsUrl);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to get location');
//     }
//   };
//   // const handleUpload = async () => {
//   //   if (!imageUri || !city || !area || !location) {
//   //     Alert.alert("Error", "Please provide image and full location.");
//   //     return;
//   //   }
  
//   //   try {
//   //     const formData = new FormData();
//   //     formData.append("file", {
//   //       uri: imageUri,
//   //       type: "image/jpeg",
//   //       name: "upload.jpg",
//   //     });
  
//   //     formData.append("upload_preset", "road_report_preset");
  
//   //     const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dpzswyrhn/image/upload", {
//   //       method: "POST",
//   //       body: formData,
//   //     });
  
//   //     const cloudinaryData = await cloudinaryRes.json();
//   //     if (!cloudinaryData.secure_url) {
//   //       throw new Error("Cloudinary upload failed");
//   //     }
  
//   //     const imageUrl = cloudinaryData.secure_url;
  
//   //     // ✅ Extract and send just lat and lon
//   //     const coordsArray = [
//   //       location.coords.latitude,
//   //       location.coords.longitude,
//   //     ];
  
//   //     const res = await fetch("http://192.168.156.157:8000/api/predict", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         imageUrl,
//   //         location: coordsArray, // This is now [lat, lon]
//   //       }),
//   //     });
  
//   //     const data = await res.json();
//   //     console.log("✅ Upload and prediction success:", data);
//   //     Alert.alert("Success", "Prediction uploaded!");
//   //     navigation.navigate("UploadSuccess");
//   //   } catch (error) {
//   //     console.error("❌ Upload error:", error.message);
//   //     Alert.alert("Error", error.message);
//   //   }
//   // };
//   const handleUpload = async () => {
//     if (!imageUri || !city || !area || !location) {
//       Alert.alert("Error", "Please provide image and full location.");
//       return;
//     }
  
//     try {
//       const formData = new FormData();
//       formData.append("file", {
//         uri: imageUri,
//         type: "image/jpeg",
//         name: "upload.jpg",
//       });
  
//       formData.append("upload_preset", "road_report_preset");
  
//       const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/dpzswyrhn/image/upload", {
//         method: "POST",
//         body: formData,
//       });
  
//       const cloudinaryData = await cloudinaryRes.json();
//       if (!cloudinaryData.secure_url) {
//         throw new Error("Cloudinary upload failed");
//       }
  
//       const imageUrl = cloudinaryData.secure_url;
  
//       const coordsArray = [
//         location.coords.latitude,
//         location.coords.longitude,
//       ];
  
//       // Send data to your server but don't wait for the prediction result
//       fetch("http://192.168.73.232:8000/api/predict", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           imageUrl,
//           location: coordsArray,
//         }),
//       }).catch(error => {
//         console.error("❌ Background server error:", error.message);
//       });
  
//       // Immediately navigate to success screen
//       navigation.navigate("UploadSuccess");
//       Alert.alert("Success", "Image uploaded. Prediction will be processed shortly.");
  
//     } catch (error) {
//       console.error("❌ Upload error:", error.message);
//       Alert.alert("Error", error.message);
//     }
//   };  
//   return (
//     <ScrollView
//       ref={scrollRef}
//       style={{ flex: 1, backgroundColor: '#fff' }}
//       contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
//       keyboardShouldPersistTaps="handled"
//     >
//       <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 20 ,marginTop:20,marginleft:20,}}>
//         Report an Incident
//       </Text>

//       <Button
//         title="📷 Take Picture"
//         onPress={async () => {
//           const result = await ImagePicker.launchCameraAsync();
//           if (!result.canceled) {
//             setImageUri(result.assets[0].uri);
//           }
//         }}
//       />

//       <View style={{ marginVertical: 10 }}>
//         <Button
//           title="🖼️ Select from Gallery"
//           onPress={async () => {
//             const result = await ImagePicker.launchImageLibraryAsync();
//             if (!result.canceled) {
//               setImageUri(result.assets[0].uri);
//             }
//           }}
//         />
//       </View>

//       {imageUri && (
//         <Image
//           source={{ uri: imageUri }}
//           style={{ width: '100%', height: 200, marginVertical: 10, borderRadius: 10 }}
//         />
//       )}

//       <Text style={{ marginTop: 10 }}>Select City:</Text>
//       <Picker
//         selectedValue={city}
//         onValueChange={(val) => {
//           setCity(val);
//           setArea('');
//         }}
//         style={{ backgroundColor: '#f0f0f0', marginBottom: 10 }}
//       >
//         <Picker.Item label="-- Select City --" value="" />
//         {Object.keys(cities).map((cityName) => (
//           <Picker.Item key={cityName} label={cityName} value={cityName} />
//         ))}
//       </Picker>

//       {city !== '' && (
//         <>
//           <Text>Select Area:</Text>
//           <Picker
//             selectedValue={area}
//             onValueChange={setArea}
//             style={{ backgroundColor: '#f0f0f0', marginBottom: 10 }}
//           >
//             <Picker.Item label="-- Select Area --" value="" />
//             {cities[city].map((areaName) => (
//               <Picker.Item key={areaName} label={areaName} value={areaName} />
//             ))}
//           </Picker>
//         </>
//       )}

//       <TextInput
//         placeholder="Enter description"
//         value={description}
//         onChangeText={setDescription}
//         multiline
//         numberOfLines={4}
//         style={{
//           borderWidth: 1,
//           borderColor: '#ccc',
//           padding: 10,
//           borderRadius: 8,
//           marginBottom: 10,
//           backgroundColor: '#f9f9f9',
//         }}
//       />

//       <TouchableOpacity
//         onPress={handleGetLocation}
//         style={{
//           backgroundColor: '#4444aa',
//           padding: 12,
//           borderRadius: 10,
//           alignItems: 'center',
//           marginBottom: 10,
//         }}
//       >
//         <Text style={{ color: 'white', fontSize: 16 }}>
//           📍 Get Live Location
//         </Text>
//       </TouchableOpacity>

//       {locationText !== '' && (
//         <Text style={{ marginBottom: 10 }}>
//           📌 Location: {locationText}
//         </Text>
//       )}

//       <TouchableOpacity
//         onPress={handleUpload}
//         style={{
//           backgroundColor: '#007b00',
//           padding: 15,
//           borderRadius: 10,
//           alignItems: 'center',
//           marginBottom: 20,
//         }}
//       >
//         <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
//           Upload
//         </Text>
//       </TouchableOpacity>

//       {uploadStatus === 'success' && (
//         <Text style={{ color: 'green', fontWeight: 'bold', marginBottom: 10 }}>
//           ✅ Image uploaded successfully...
//         </Text>
//       )}
//       {uploadStatus === 'failed' && (
//         <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>
//           ❌ Please fill all fields before uploading.
//         </Text>
//       )}

//       {/* <Text style={{ fontSize: 16 }}>⭐ Stars Earned: {stars}</Text> */}
//     </ScrollView>
//   );
// }
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

export default function ReportScreen({ navigation }) {
  const scrollRef = useRef();

  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null); // For raw coords
  const [locationText, setLocationText] = useState(""); // Short display
  const [fullAddress, setFullAddress] = useState(""); // Full address display

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
  
      // Set only latitude/longitude for upload use
      setLocation({ latitude, longitude });
  
      const latStr = latitude.toFixed(6);
      const lonStr = longitude.toFixed(6);
      setLocationText(`${latStr}, ${lonStr}`);
  
      // Reverse geocode for full address
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
  
      // Optional: open maps
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latStr},${lonStr}`;
      Linking.openURL(mapsUrl);
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
      console.error(error);
    }
  };
  
    const handleUpload = async () => {
    if (!imageUri || !location) {
      Alert.alert("Error", "Please provide image and full location.");
      return;
    }
  
    try {
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
  
      // Send data to your server but don't wait for the prediction result
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
  
      // Immediately navigate to success screen
      navigation.navigate("UploadSuccess");
      Alert.alert("Success", "Image uploaded. Prediction will be processed shortly.");
  
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
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          ⬆️ Upload Report
          </Text>
        </TouchableOpacity>

        {/* Upload Status Message */}
        {uploadStatus === 'success' && (
          <Text style={{ color: 'green', fontWeight: 'bold', marginBottom: 10 }}>
            ✅ Image uploaded successfully...
          </Text>
        )}
        {uploadStatus === 'failed' && (
          <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 10 }}>
            ❌ Please fill all fields before uploading.
          </Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = {
  button: {
    backgroundColor: '#D8BFD8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: 250,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
};
