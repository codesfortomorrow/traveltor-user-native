import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Constant from '../utils/constant';

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);
  const {heroSlider} = Constant();

  return (
    <>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={heroSlider[activeIndex]?.image || '/images/hero.png'}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Search Box */}
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchFocused,
          ]}>
          <TextInput
            ref={inputRef}
            value={search}
            onChangeText={setSearch}
            // onFocus={() => setIsSearchFocused(true)}
            placeholder="Search for User"
            style={[
              styles.searchInput,
              isSearchFocused
                ? styles.searchInputFocused
                : styles.searchInputUnfocused,
            ]}
            placeholderTextColor="#8B8181"
          />
          <Image
            source={require('../../public/images/hero/search.png')}
            style={[styles.searchIcon, isSearchFocused ? {top: 25} : {top: 10}]}
          />
        </View>

        {/* Title + Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{heroSlider[activeIndex]?.title}</Text>
          <Text style={styles.description}>
            {heroSlider[activeIndex]?.desc}
          </Text>
        </View>

        {/* Swiper */}
      </View>

      <View style={styles.swiperWrapper}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          loop
          showsPagination={false}
          onIndexChanged={setActiveIndex}
          height={100}>
          {heroSlider.map((slide, index) => {
            return (
              <View key={index} style={styles.slide}>
                <Image
                  source={slide.image}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <View style={styles.slideOverlay} />
              </View>
            );
          })}
        </Swiper>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get('window').height - 160,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  searchContainer: {
    width: '80%',
    alignSelf: 'center',
    position: 'relative',
    marginTop: 20,
  },
  searchFocused: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    width: '100%',
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 24,
    backgroundColor: '#fff',
    fontSize: 12,
  },
  searchInputFocused: {
    height: 50,
    borderRadius: 0,
    fontSize: 16,
  },
  searchInputUnfocused: {
    height: 43,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    width: 20,
    height: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    position: 'absolute',
    bottom: 50,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  swiperWrapper: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 40,
  },
  slide: {
    width: '25%',
    height: 92,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
});

export default HeroSection;
