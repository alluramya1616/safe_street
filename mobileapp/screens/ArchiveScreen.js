import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ArchiveScreen() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Use the same key 'reports' as in ReportScreen
        const storedReports = await AsyncStorage.getItem('reports');
        if (storedReports !== null) {
          setReports(JSON.parse(storedReports));
        }
      } catch (error) {
        console.error('❌ Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.text}><Text style={styles.label}>State:</Text> {item.state}</Text>
      <Text style={styles.text}><Text style={styles.label}>Description:</Text> {item.description}</Text>
      <Text style={styles.text}><Text style={styles.label}>Address:</Text> {item.fullAddress}</Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Coordinates:</Text> {item.coordinates?.[0]}, {item.coordinates?.[1]}
      </Text>
      <Text style={styles.text}><Text style={styles.label}>Reported At:</Text> {new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📂 Archived Reports</Text>
      {reports.length === 0 ? (
        <Text style={styles.noData}>No reports available.</Text>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop:50,
    textAlign: 'center',
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
  },
});
