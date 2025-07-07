// temp.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';

const getBackendHost = () => {
  // Android emulator → special alias
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  // iOS simulator → localhost works
  if (Platform.OS === 'ios')     return 'http://localhost:3000';
  // Real device (both iOS & Android) → use your laptop’s LAN IP
  return 'http://192.168.1.49:3000';  // ← replace with your machine’s IP
};

const Temp = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const BACKEND_URL = `${getBackendHost()}/api/latest-news`;

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(BACKEND_URL);
        const json = await res.json();
        setArticles(json);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        Linking.openURL(
          item.url.startsWith('http')
            ? item.url
            : `https://cointelegraph.com${item.url}`
        )
      }
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.timeAgo} by {item.author}
        </Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.views}>{item.views} views</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.url}
      renderItem={renderItem}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
};

export default Temp;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  desc: {
    fontSize: 14,
    color: '#333',
  },
  views: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});
