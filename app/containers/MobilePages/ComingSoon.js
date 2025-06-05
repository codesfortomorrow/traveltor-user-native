import React from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';
import Backheading from '../../components/Mobile/Backheading';

const {width, height} = Dimensions.get('window');

const ComingSoon = () => {
  return (
    <View style={styles.container}>
      <Backheading heading={'Coming Soon'} />

      <View style={styles.contentContainer}>
        <Image
          source={require('../../../public/favicon.png')}
          style={styles.faviconImage}
        />
        <Image
          source={require('../../../public/images/coming-soon.png')}
          style={styles.comingSoonImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: height - 60,
    backgroundColor: '#e93c00',
    backgroundImage: 'linear-gradient(90deg, #e93c00 0%, #f3845d 100%)',
  },
  faviconImage: {
    position: 'absolute',
    width: 240,
    height: 280,
    zIndex: 10,
    opacity: 0.4,
  },
  comingSoonImage: {
    position: 'relative',
    zIndex: 10,
    width: 350,
    height: 235,
  },
});

export default ComingSoon;
