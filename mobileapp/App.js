
import React, { useState } from "react";
import { Text, Platform, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { registerRootComponent } from "expo";
import { Entypo, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ReportScreen from "./screens/ReportScreen";
import NewsScreen from "./screens/NewsScreen";
import ArchiveScreen from "./screens/ArchiveScreen"; // updated name (your ArchiveScreen)
import UploadSuccessScreen from "./screens/UploadSuccessScreen";
import AboutScreen from "./screens/AboutScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: "#fff",
  },
};

function Tabs({ setIsLoggedIn, userInfo }) {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        children={() => <HomeScreen setIsLoggedIn={setIsLoggedIn} userInfo={userInfo} />}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Entypo name="home" size={24} color={focused ? "#16247d" : "#111"} />
              <Text style={{ fontSize: 10, color: "#16247d" }}>Home</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name="information-circle"
                size={30}
                color={focused ? "#16247d" : "#111"}
              />
              <Text style={{ fontSize: 10, color: "#16247d" }}>About</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#16247d",
                  width: Platform.OS === "ios" ? 50 : 60,
                  height: Platform.OS === "ios" ? 50 : 60,
                  borderRadius: 35,
                  top: Platform.OS === "ios" ? -10 : -5,
                }}
              >
                <MaterialIcons name="report" size={30} color="#fff" />
              </View>
              <Text style={{ fontSize: 10, color: "#16247d" }}>Report</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons
                name="announcement"
                size={24}
                color={focused ? "#16247d" : "#111"}
              />
              <Text style={{ fontSize: 12, color: "#16247d" }}>News</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Archive"
        component={ArchiveScreen} // Show stored reports; reloads on focus internally
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name="archive"
                size={24}
                color={focused ? "#16247d" : "#111"}
              />
              <Text style={{ fontSize: 9, color: "#16247d" }}>Archive</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    setIsLoggedIn={setIsLoggedIn}
                    setUserInfo={setUserInfo}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => (
                  <RegisterScreen
                    {...props}
                    setIsLoggedIn={setIsLoggedIn}
                    setUserInfo={setUserInfo}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Tabs">
                {(props) => (
                  <Tabs
                    {...props}
                    setIsLoggedIn={setIsLoggedIn}
                    userInfo={userInfo}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="UploadSuccess" component={UploadSuccessScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

