import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Splash = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Top News</Text>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Optional: Center horizontally
    height: 700,
    backgroundColor: 'white'
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 100,
  },
});

export default Splash;
