import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import Constant from '../utils/constant';
import {getAuthReq} from '../utils/apiHandlers'; // Assuming you have this utility
import debounce from 'lodash/debounce'; // Make sure to install lodash
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const {heroSlider} = Constant();
  const itemWidth = screenWidth / 5.75;
  const clonedSlider = [...heroSlider, ...heroSlider];
  const scrollIndex = useRef(0);
  const scrollTimer = useRef(null);
  const navigation = useNavigation();

  // User search functionality
  const fetchUsers = async searchQuery => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({search: searchQuery});
      const res = await getAuthReq(`/users/search?${params.toString()}`);
      if (res?.status) {
        setSearchResults(res?.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setSearchResults([]);
    }
    setIsLoading(false);
  };

  const fetchUsersDebounced = useCallback(
    debounce(searchQuery => fetchUsers(searchQuery), 300),
    [],
  );

  useEffect(() => {
    if (search.trim()) {
      fetchUsersDebounced(search);
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }

    return () => fetchUsersDebounced.cancel();
  }, [search, fetchUsersDebounced]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isSearchFocused) {
      scrollTimer.current = setInterval(() => {
        scrollIndex.current += 1;

        if (scrollIndex.current >= clonedSlider.length) {
          scrollIndex.current = 0;
          listRef.current?.scrollToOffset({offset: 0, animated: false});
        } else {
          listRef.current?.scrollToOffset({
            offset: scrollIndex.current * (itemWidth + 16),
            animated: true,
          });
        }

        const index = scrollIndex.current % heroSlider.length;
        setTimeout(() => {
          setActiveIndex(index);
        }, 500);
      }, 3000);
    }

    return () => {
      if (scrollTimer.current) {
        clearInterval(scrollTimer.current);
      }
    };
  }, [heroSlider.length, itemWidth, isSearchFocused]);

  const handleUserPress = user => {
    navigation.navigate('UserProfile', {id: user?.id, userType: user?.type});
    setIsSearchFocused(false);
    setSearch('');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Add a small delay to allow for user selection
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}>
      <View style={styles.userItemContent}>
        <Image
          source={{uri: item?.profileImage}}
          style={styles.userAvatar}
          defaultSource={require('../../public/images/dpPlaceholder.png')}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item?.username}</Text>
          <Text style={styles.userFullName}>
            {item?.firstname} {item?.lastname}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E93C00" />
        </View>
      );
    }

    if (searchResults.length === 0 && search.trim()) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>{search} is not a user</Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={item => item?.id?.toString()}
          style={styles.searchResultsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.searchResultsContainer}
        />
      );
    }

    return null;
  };

  return (
    <>
      <View style={styles.container}>
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
            // onFocus={handleSearchFocus}
            // onBlur={handleSearchBlur}
            returnKeyType="search"
          />
          <Image
            source={require('../../public/images/hero/search.png')}
            style={[styles.searchIcon, isSearchFocused ? {top: 25} : {top: 10}]}
          />
        </View>

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
            scrollEnabled={false}
            renderItem={({item, index}) => (
              <View
                style={[
                  styles.slide,
                  {width: itemWidth},
                  index !== clonedSlider.length - 1 && {marginRight: 16},
                ]}>
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
      )}

      {/* Search Results Overlay - Now positioned from screen top */}
      {/* {isSearchFocused && (
        <View
          style={[
            styles.searchOverlay,
            {
              top: StatusBar.currentHeight || 0, // For Android status bar
              paddingTop: StatusBar.currentHeight ? 10 : 50, // Adjust padding for iOS/Android
            },
          ]}>
          {renderSearchResults()}
        </View>
      )} */}
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
    top: StatusBar.currentHeight || 0, // Position from actual screen top
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 1000, // Higher z-index to ensure it's on top
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10, // Higher elevation for Android
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
  // Search Results Styles
  searchOverlay: {
    position: 'absolute',
    top: 0, // Will be overridden with StatusBar height in component
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999, // Just below the search bar
    paddingHorizontal: 16,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContainer: {
    paddingBottom: 80,
  },
  userItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  userFullName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HeroSection;
