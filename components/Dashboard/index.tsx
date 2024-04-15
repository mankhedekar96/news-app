import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Splash from '../Splash'; // Import the Splash component
import {NewsItemType} from './type';
import {NEWS_API_KEY, NEWS_COUNTRIES, NEWS_URL} from '../../APP_CONSTANTS';

const Dashboard = () => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      AsyncStorage.removeItem('news');
      fetchNews();

    // Set up timer to fetch new headlines every 10 seconds
    const timer = setInterval(() => {
      fetchNews();
    }, 2000);

    return () => {
      AsyncStorage.removeItem('news');
      clearInterval(timer);
    }; // Cleanup timer on component unmount
  }, []);

  const fetchNewsFromAPI = async (size?: number) => {
    try {
      const response = await axios.get(NEWS_URL, {
        params: {
          apiKey: NEWS_API_KEY,
          country: 'us' || NEWS_COUNTRIES[Math.floor(Math.random() * NEWS_COUNTRIES.length)],
          pageSize: 100,
          // language: 'en'
        },
      });
      const articles = response.data.articles;

      await AsyncStorage.setItem('news', JSON.stringify(articles));
      setNews(prevNews => [ ...articles.slice(0, size || 10), ...prevNews]); // Update state with the first 10 headlines
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const storedNews = await AsyncStorage.getItem('news');
      if (storedNews) {
        const articles = JSON.parse(storedNews);
        if (articles.length === news.length) {
          console.log('Condition matched!');
          await AsyncStorage.removeItem('news');
          fetchNewsFromAPI(5);
        } else {
          console.log('5');
          await setNews((prevNews: NewsItemType[]) => {
            return [
              ...articles.slice(prevNews.length, prevNews.length + 6),
              ...prevNews,
            ];
          });
        }
        setIsLoading(false);
      } else {
          console.log('1');
          fetchNewsFromAPI();
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
    }
  };

  const renderItem = ({item}: {item: NewsItemType}) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.itemContainer}>
        <Image source={{uri: item.urlToImage || 'https://placehold.co/600x200'}} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.source}>{item.source.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const handlePress = (item: NewsItemType) => {
    // Handle user interaction (e.g., navigate to full article view)
  };

  if (isLoading) {
    return <Splash />; // Display splash screen while loading
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  source: {
    fontSize: 14,
    color: '#666',
  },
});

export default Dashboard;
