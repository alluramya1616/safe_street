import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, StyleSheet, StatusBar, View } from 'react-native';
import { List } from 'react-native-paper';

const mockData = [
  {
    id: '1',
    coords: [12.9716, 77.5946],
    address: 'MG Road, Bangalore',
    time: '2025-04-03 14:30',
    description: 'Heavy traffic and potholes reported in this area.',
    imagePath: '',
  },
  {
    id: '2',
    coords: [28.6139, 77.2090],
    address: 'India Gate, Delhi',
    time: '2025-04-02 10:15',
    description: 'Clean and safe street with low congestion.',
    imagePath: '',
  },
];

const ArchivesScreen = () => {
  const [newEvent, setEvent] = useState([]);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setEvent(mockData);
    }, 500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={newEvent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.item}>
              <Text style={styles.timestamp}>{item.time}</Text>
              <Text style={styles.concentration}>
                Latitude, Longitude: {item.coords.join(', ')}
              </Text>
              <Text style={styles.concentration}>Address: {item.address}</Text>
            </View>
            <View style={styles.gptAnalysisContainer}>
              <List.Accordion
                title="Description"
                titleStyle={styles.accordionTitle}
                left={props => <List.Icon {...props} icon="information" />}
              >
                <List.Item title={item.description} titleStyle={styles.analysisText} />
              </List.Accordion>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: StatusBar.currentHeight || 0,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 10,
    borderColor: '#dcdcdc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  item: {
    padding: 20,
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 1,
  },
  timestamp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  concentration: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  gptAnalysisContainer: {
    padding: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ArchivesScreen;


