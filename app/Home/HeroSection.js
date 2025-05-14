import React, {useRef, useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import Constant from '../utils/constant';

const screenWidth = Dimensions.get('window').width;

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const {heroSlider} = Constant();
  const itemWidth = screenWidth / 5.75;

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const nextIndex = (prev + 1) % heroSlider.length;
        listRef.current?.scrollToOffset({
          offset: nextIndex * itemWidth + 20,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [heroSlider.length]);

  return (
    <>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={
            heroSlider[activeIndex]?.image ||
            require('../../public/images/hero.png')
          }
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
      </View>

      {/* FlatList Slider */}
      <View style={styles.swiperWrapper}>
        <FlatList
          ref={listRef}
          data={heroSlider}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={[styles.slide, {width: itemWidth}]}>
              <Image
                source={item.image}
                style={styles.slideImage}
                resizeMode="cover"
              />
              <View style={styles.slideOverlay} />
            </View>
          )}
        />
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
    bottom: -40,
    zIndex: 100,
    left: 30,
    right: 30,
    height: 100,
    width: '83%',
  },
  slide: {
    height: 92,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
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
