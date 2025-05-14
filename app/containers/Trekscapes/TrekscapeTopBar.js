import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrekscapeTopBar = ({
  categoryId,
  setCategoryId,
  category,
  setCategorySlug,
}) => {
  const scrollRef = useRef(null);
  const SCROLL_KEY = 'categoryScrollPosition';
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Create blinking animation for 'live' items
  useEffect(() => {
    const blinkingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    blinkingAnimation.start();

    return () => blinkingAnimation.stop();
  }, [blinkAnim]);

  // Restore scroll position
  useEffect(() => {
    const restoreScrollPosition = async () => {
      try {
        const savedScrollPosition = await AsyncStorage.getItem(SCROLL_KEY);

        if (savedScrollPosition && scrollRef.current) {
          setTimeout(() => {
            scrollRef.current.scrollTo({
              x: parseInt(savedScrollPosition, 10),
              animated: false,
            });
          }, 10);
        }
      } catch (error) {
        console.error('Failed to restore scroll position:', error);
      }
    };

    restoreScrollPosition();
  }, [category]);

  // Save scroll position
  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    try {
      AsyncStorage.setItem(SCROLL_KEY, scrollPosition.toString());
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.scrollContainer}>
      <View style={styles.categoriesContainer}>
        {category?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryItem,
              {minWidth: category?.length <= 5 ? '20%' : '18%'},
            ]}
            onPress={() => {
              setCategoryId(item?.id);
              setCategorySlug(item?.slug);
            }}>
            <View>
              <Image
                source={item?.slug === 'live' ? item?.icon : {uri: item?.icon}}
                style={[
                  styles.categoryIcon,
                  item?.id == categoryId &&
                    item?.slug != 'live' &&
                    styles.filteredIcon,
                ]}
                resizeMode="contain"
              />
            </View>
            {item?.slug === 'live' ? (
              <Animated.Text
                style={[
                  styles.categoryText,
                  item?.id == categoryId && styles.activeText,
                  {opacity: blinkAnim},
                ]}>
                {item?.name}
              </Animated.Text>
            ) : (
              <Text
                style={[
                  styles.categoryText,
                  item?.id == categoryId && styles.activeText,
                ]}>
                {item?.name}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    minWidth: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
    paddingTop: 9,
    paddingBottom: 4,
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  filteredIcon: {
    tintColor: '#e93c00',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
    color: 'black',
  },
  activeText: {
    color: '#e93c00',
  },
});

export default TrekscapeTopBar;
