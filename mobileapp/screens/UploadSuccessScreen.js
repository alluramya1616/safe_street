
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ Use import for the image (more reliable than require)
import GreenCheck from '../assets/green-check.png';

const UploadSuccessScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("Tabs", { screen: "Home" });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={GreenCheck} // ✅ using imported image
        style={styles.image}
      />
      <Text style={styles.congrats}>Congratulations!</Text>
      <Text style={styles.message}>Your image was uploaded successfully!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4edda',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain', // ✅ helps with image fitting
  },
  congrats: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#155724',
  },
  message: {
    fontSize: 18,
    color: '#155724',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default UploadSuccessScreen;
