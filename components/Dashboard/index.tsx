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
import { SwipeListView } from 'react-native-swipe-list-view';

const Dashboard = () => {
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.removeItem('news');
    fetchNews();

    // Set up timer to fetch new headlines every 10 seconds
    const timer = setInterval(() => {
      fetchNews();
    }, 10000);

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
          country:
            NEWS_COUNTRIES[Math.floor(Math.random() * NEWS_COUNTRIES.length)],
          pageSize: 100,
        },
      });
      const articles = response.data.articles;

      await AsyncStorage.setItem('news', JSON.stringify(articles));
      setNews(prevNews => [...articles.slice(0, size || 10), ...prevNews]); // Update state with the first 10 headlines
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
        
        await setNews((prevNews: NewsItemType[]) => {
          return [
            ...articles.slice(prevNews.length, prevNews.length + 6),
            ...prevNews,
          ];
        });

        setIsLoading(false);
      } else {
        fetchNewsFromAPI();
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
    }
  };

  const handlePin = (item: NewsItemType) => {
    // Handle user interaction (e.g., navigate to full article view)
    item.pinned = !Boolean(item.pinned);
  };

  const handleDelete = (index: number) => {
    setNews(prevNews => prevNews.filter((_, i) => i !== index));
  };

  const renderItem = ({ item }: { item: NewsItemType; index: number }) => {
    return (
      <TouchableOpacity onPress={() => handlePress(item)}>
          <View style={styles.itemContainer}>
            <Image
              source={{uri: item.urlToImage || 'https://placehold.co/600x200'}}
              style={styles.image}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.source}>{item.source.name}</Text>
          </View>
        </TouchableOpacity>
    );
  };

  const renderHiddenItem = (data: { item: NewsItemType; index: number }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity onPress={() => handleDelete(data.index)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePin(data.item)} style={styles.pinButton}>
        <Text style={styles.pinButtonText}>{data.item.pinned ? 'Unpin' : 'Pin'}</Text>
      </TouchableOpacity>
    </View>
  );

  const handlePress = (item: NewsItemType) => {
    // Handle user interaction (e.g., navigate to full article view)
  };

  const pinnedItems = news.filter(el => el.pinned);
  const unpinnedItems = news.filter(el => !el.pinned);

  if (isLoading) {
    return <Splash />; // Display splash screen while loading
  }

  return (
    <View style={styles.container}>
      <SwipeListView
          data={[ ...pinnedItems, ...unpinnedItems ]}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          rightOpenValue={-150}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  source: {
    fontSize: 14,
    color: '#666',
  },
  hiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinButton: {
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  pinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default Dashboard;
