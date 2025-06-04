import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';

const NEWS_API_KEY = '7ffdc46f9b23400089d54237c4d782ad'; // Replace with your key

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNews();
  }, []);

  const fetchRecentNews = async () => {
    try {
      const query = encodeURIComponent(
        '(pothole accident OR road damage OR damaged road OR bad road condition OR road infrastructure)'
      );

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`
      );

      const data = await response.json();

      const filteredArticles = (data.articles || []).filter((article) => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        return (
          content.includes('pothole') ||
          content.includes('road damage') ||
          content.includes('damaged road') ||
          content.includes('accident') ||
          content.includes('bad road') ||
          content.includes('infrastructure')
        );
      });

      setArticles(filteredArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const openArticleUrl = (url) => {
    Linking.openURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncateDescription = (description, length = 100) => {
    return description && description.length > length
      ? `${description.substring(0, length)}...`
      : description;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openArticleUrl(item.url)}
      style={styles.articleContainer}
    >
      <Image
        style={styles.image}
        source={{
          uri: item.urlToImage || 'https://via.placeholder.com/150',
        }}
      />
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{item.title || 'No Title'}</Text>
        <Text style={styles.description}>
          {truncateDescription(item.description || 'No description available.')}
        </Text>
        <Text style={styles.pubDate}>{formatDate(item.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        Recent Road Damage & Pothole Accident News (India)
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#16247d" />
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16247d',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  articleContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#16247d',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pubDate: {
    fontSize: 12,
    color: '#666',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
});

export default NewsScreen;
