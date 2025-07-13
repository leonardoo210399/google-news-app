// BreakingNewsCard.jsx
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';


const BreakingNewsCard = ({ item }) => (
  <View style={styles.container}>
    <Image source={{ uri: item.imageUrl }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.date} numberOfLines={1}>
        {format(parseISO(item.datetime), "yyyy-MM-dd HH:mm")}
      </Text>
    </View>
  </View>
);

export default BreakingNewsCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4e4b4bff',
  },
  image: {
    width: '100%',
    height: '65%',
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
});
