import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions, Linking, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

const walkthroughSteps = [
  {
    step: '1. Launch the Report Incident Screen',
    image: require('../assets/1.jpg'),
  },
  {
    step: '2. Upload or Take a Photo',
    image: require('../assets/2.jpg'),
  },
  {
    step: '3. Enter City and Location',
    image: require('../assets/3.jpg'),
  },
  {
    step: '4. Tap Upload Button',
    image: require('../assets/4.jpg'),
  },
  {
    step: '5. Upload Successful',
    image: require('../assets/5.jpg'),
  },
];

export default function AboutScreen() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:safestreet.help@example.com');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>About SafeStreet</Text>
      <Text style={styles.paragraph}>
        SafeStreet is a community-driven platform that empowers users to report, track,
        and stay updated on safety and infrastructure issues like traffic, road damages.
      </Text>

      <Text style={styles.subHeader}>Features:</Text>
      <Text style={styles.bullet}>• Report incidents with photo and location</Text>
      <Text style={styles.bullet}>• View live heatmaps of recent reports</Text>
      <Text style={styles.bullet}>• Access important safety-related news</Text>
      <Text style={styles.bullet}>• Browse an archive of your past reports</Text>

      <Text style={styles.footer}>Your contribution makes streets safer for everyone!</Text>

      <Text style={[styles.header, { marginTop: 40 }]}>How to Report an Incident</Text>
      {walkthroughSteps.map((item, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text style={styles.title}>{item.step}</Text>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
      ))}

      <Text style={[styles.header, { marginTop: 30 }]}>Need Help?</Text>
      <Text style={styles.helpText}>For assistance, please contact us at:</Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <Text style={styles.email}>safestreet.help@gmail.com</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 15,
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#0057A0',
    alignSelf: 'flex-start',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 10,
    color: '#555',
  },
  bullet: {
    fontSize: 15,
    marginBottom: 6,
    alignSelf: 'flex-start',
    color: '#444',
  },
  footer: {
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
    color: '#28a745',
  },
  stepContainer: {
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#444',
  },
  image: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#333',
    //marginTop: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#0057A0',
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 4,
    marginBottom: 100,
  },
});
