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
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;

function HeroSection({search, setSearch, isSearchFocused, onSearchFocus}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const {heroSlider} = Constant();
  const itemWidth = screenWidth / 5.75;
  const itemSpacing = 16;
  // Create multiple copies for infinite scroll
  const clonedSlider = [...heroSlider, ...heroSlider, ...heroSlider];
  const scrollIndex = useRef(heroSlider.length); // Start from middle section
  const scrollTimer = useRef(null);
  const isManualScrolling = useRef(false);
  const resumeTimer = useRef(null);

  // Initialize scroll position to middle section
  useEffect(() => {
    if (listRef.current && heroSlider.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: heroSlider.length * (itemWidth + itemSpacing),
          animated: false,
        });
      }, 100);
    }
  }, [heroSlider.length, itemWidth]);

  // Auto-scroll functionality
  useEffect(() => {
    const startAutoScroll = () => {
      if (scrollTimer.current) {
        clearInterval(scrollTimer.current);
      }

      scrollTimer.current = setInterval(() => {
        if (!isManualScrolling.current) {
          scrollIndex.current += 1;

          const offset = scrollIndex.current * (itemWidth + itemSpacing);
          listRef.current?.scrollToOffset({
            offset: offset,
            animated: true,
          });

          const index = scrollIndex.current % heroSlider.length;
          setTimeout(() => {
            setActiveIndex(index);
          }, 300);
        }
      }, 3000);
    };

    if (!isSearchFocused) {
      startAutoScroll();
    }

    return () => {
      if (scrollTimer.current) {
        clearInterval(scrollTimer.current);
      }
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, [heroSlider.length, itemWidth, isSearchFocused]);

  // Handle manual scroll start
  const handleScrollBeginDrag = () => {
    isManualScrolling.current = true;
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }
  };

  // Handle manual scroll end
  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 2 seconds of no manual interaction
    resumeTimer.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 2000);
  };

  // Handle scroll position change
  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / (itemWidth + itemSpacing));

    // Update scroll index for auto-scroll continuity
    scrollIndex.current = currentIndex;

    // Calculate actual index for display
    const actualIndex = currentIndex % heroSlider.length;
    setActiveIndex(actualIndex);
  };

  // Handle momentum scroll end for infinite loop
  const handleMomentumScrollEnd = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / (itemWidth + itemSpacing));
    const totalItems = clonedSlider.length;

    // Reset to middle section if we're at the beginning or end
    if (currentIndex <= 0) {
      // Jump to the end of first section (beginning of middle section)
      const newIndex = heroSlider.length;
      scrollIndex.current = newIndex;
      listRef.current?.scrollToOffset({
        offset: newIndex * (itemWidth + itemSpacing),
        animated: false,
      });
    } else if (currentIndex >= totalItems - heroSlider.length) {
      // Jump to the beginning of middle section
      const newIndex = heroSlider.length;
      scrollIndex.current = newIndex;
      listRef.current?.scrollToOffset({
        offset: newIndex * (itemWidth + itemSpacing),
        animated: false,
      });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <FastImage
          source={
            heroSlider[activeIndex]?.image ||
            require('../../public/images/hero.png')
          }
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Search Box - Only shows when not focused */}
        {!isSearchFocused && (
          <View style={styles.searchContainer}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for User"
              style={styles.searchInput}
              placeholderTextColor="#8B8181"
              onFocus={onSearchFocus}
              returnKeyType="search"
            />
            <Image
              source={require('../../public/images/hero/search.png')}
              style={styles.searchIcon}
            />
          </View>
        )}

        {/* Title + Description - Hidden when search is focused */}
        {!isSearchFocused && (
          <View style={styles.textContainer}>
            <Text style={styles.title}>{heroSlider[activeIndex]?.title}</Text>
            <Text style={styles.description}>
              {heroSlider[activeIndex]?.desc}
            </Text>
          </View>
        )}
      </View>

      {/* FlatList Slider - Hidden when search is focused */}
      {!isSearchFocused && (
        <View style={styles.swiperWrapper}>
          <FlatList
            ref={listRef}
            data={clonedSlider}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={itemWidth + itemSpacing}
            snapToAlignment="start"
            disableIntervalMomentum={true}
            renderItem={({item, index}) => (
              <View
                style={[
                  styles.slide,
                  {width: itemWidth},
                  index !== clonedSlider.length - 1 && {
                    marginRight: itemSpacing,
                  },
                ]}>
                <FastImage
                  source={item.image}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
                <View style={styles.slideOverlay} />
              </View>
            )}
          />
        </View>
      )}
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
    zIndex: -2,
  },
  searchContainer: {
    width: '80%',
    alignSelf: 'center',
    position: 'relative',
    marginTop: 20,
    zIndex: -1,
  },
  searchInput: {
    width: '100%',
    height: 43,
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 24,
    backgroundColor: '#fff',
    fontSize: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 10,
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
