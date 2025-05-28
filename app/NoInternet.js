// NoInternet.js
import React from 'react';
import {Image} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';

const NoInternet = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../public/favicon.png')} style={styles.image} />
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    paddingVertical: 60,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
