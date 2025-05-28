
import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Dimensions,
  Text,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

const HomeScreen = ({ setIsLoggedIn, userInfo }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("traffic");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const carouselRef = useRef(null);

  const trafficEvents = [
    {
      id: "t1",
      coords: [28.6139, 77.209],
      address: "SR Nagar, Delhi",
      time: new Date().toISOString(),
      description: "Heavy traffic near metro station due to road work.",
    },
    {
      id: "t2",
      coords: [19.076, 72.8777],
      address: "Marine Drive, Mumbai",
      time: new Date().toISOString(),
      description: "Heavy traffic due to local festival.",
    },
  ];

  const roadDamageEvents = [
    {
      id: "r1",
      coords: [13.0827, 80.2707],
      address: "Mount Road, Chennai",
      time: new Date().toISOString(),
      description: "Large potholes reported near junction.",
    },
    {
      id: "r2",
      coords: [12.9716, 77.5946],
      address: "MG Road, Bengaluru",
      time: new Date().toISOString(),
      description: "Broken pavement causing slowdowns.",
    },
  ];

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location in settings.");
        return null;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("GPS Disabled", "Please turn on location services.");
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Unable to fetch location.");
      return null;
    }
  };

  useEffect(() => {
    getUserLocation().then((location) => {
      if (location) setUserLocation(location);
    });
  }, []);

  const initialRegion = {
    latitude: 21.146633,
    longitude: 79.08886,
    latitudeDelta: 15,
    longitudeDelta: 15,
  };

  const events = selectedCategory === "traffic" ? trafficEvents : roadDamageEvents;

  const handleMarkerPress = (index) => {
    setCurrentSlideIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  const handleLogout = () => {
    setIsProfileDropdownVisible(false);
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setIsProfileDropdownVisible(false)}>
        <View style={{ flex: 1 }}>
          {/* Header: Picker and Profile */}
          <View style={styles.header}>
            <Picker
              selectedValue={selectedCategory}
              style={styles.picker}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <Picker.Item label="Traffic" value="traffic" />
              <Picker.Item label="Road Damage" value="road" />
            </Picker>

            <View style={{ position: "relative" }}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => setIsProfileDropdownVisible(!isProfileDropdownVisible)}
              >
                <Ionicons name="person-circle-outline" size={36} color="#16247d" />
              </TouchableOpacity>

              {isProfileDropdownVisible && (
                <View style={styles.profileDropdown}>
                  {/* Changed username to name */}
                  <Text style={styles.nameText}>{userInfo?.name || "User"}</Text>
                  <Text style={styles.emailText}>{userInfo?.email || "email@example.com"}</Text>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView style={styles.map} initialRegion={initialRegion}>
              {events.map((event, index) => (
                <Marker
                  key={event.id}
                  coordinate={{
                    latitude: event.coords[0],
                    longitude: event.coords[1],
                  }}
                  pinColor={index === currentSlideIndex ? "red" : "blue"}
                  onPress={() => handleMarkerPress(index)}
                >
                  <Callout>
                    <Text>{event.description}</Text>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          </View>

          {/* Carousel */}
          <View style={styles.carouselContainer}>
            <Carousel
              ref={carouselRef}
              width={width}
              height={width / 2.5}
              data={events}
              onSnapToItem={(index) => setCurrentSlideIndex(index)}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemText}>{`Address: ${item.address}`}</Text>
                  <Text style={styles.itemText}>{`Time: ${new Date(item.time).toLocaleString()}`}</Text>
                  <Text style={styles.itemText}>{`Description: ${item.description}`}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  picker: {
    height: 50,
    width: 180,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  profileDropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    alignItems: "center",
    width: 180,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#16247d",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    width: "100%",
  },
  itemContainer: {
    padding: 10,
    alignItems: "center",
  },
  itemText: {
    fontSize: 9,
    textAlign: "center",
  },
});

export default HomeScreen;
