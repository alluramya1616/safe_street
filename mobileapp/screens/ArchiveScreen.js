
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { List } from 'react-native-paper';

const ArchivesScreen = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const storedReports = await AsyncStorage.getItem('reports');
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        } else {
          setReports([]); // no reports saved yet
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      }
    };

    loadReports();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Add heading here */}
      <Text style={styles.heading}>Previous Reportes</Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.item}>
              <Text style={styles.timestamp}>
                {new Date(item.time).toLocaleString()}
              </Text>
              <Text style={styles.coords}>
                Latitude, Longitude: {item.coords.join(', ')}
              </Text>
              <Text style={styles.address}>
                Address: {item.address || item.state}
              </Text>
            </View>

            <View style={styles.accordionContainer}>
              <List.Accordion
                title="Description"
                titleStyle={styles.accordionTitle}
                left={(props) => <List.Icon {...props} icon="information" />}
              >
                <List.Item
                  title={item.description || 'No description provided.'}
                  titleStyle={styles.analysisText}
                />
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.reportImage}
                    resizeMode="cover"
                  />
                ) : null}
              </List.Accordion>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ArchivesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16247d',
    marginVertical: 20,
    textAlign: 'center',
    marginTop:50,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
    padding: 12,
  },
  item: {
    marginBottom: 8,
  },
  timestamp: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  coords: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  accordionContainer: {
    marginTop: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisText: {
    fontSize: 14,
    color: '#444',
  },
  reportImage: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
