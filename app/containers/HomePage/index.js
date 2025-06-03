import React, {useState, useCallback, useEffect} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Keyboard,
} from 'react-native';
import HeroSection from '../../Home/HeroSection';
import TrekScapes from '../../Home/TrekScapes';
import Trailblazers from '../../Home/Trailblazers';
import Layout from '../../Layout';
import {getAuthReq} from '../../utils/apiHandlers';
import debounce from 'lodash/debounce';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Constant from '../../utils/constant';
import FastImage from 'react-native-fast-image';

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {optimizeImageKitUrl} = Constant();
  const navigation = useNavigation();

  // User search functionality
  const fetchUsers = async searchQuery => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchQuery && {search: searchQuery}),
      });
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
    fetchUsersDebounced(search);

    return () => fetchUsersDebounced.cancel();
  }, [search, fetchUsersDebounced]);

  const handleUserPress = user => {
    navigation.navigate('Profile', {id: user?.id, userType: user?.type});
    setIsSearchFocused(false);
    setSearch('');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleBackPress = () => {
    setIsSearchFocused(false);
    setSearch('');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isSearchFocused) {
          handleBackPress();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [isSearchFocused]),
  );

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}>
      <View style={styles.userItemContent}>
        <FastImage
          source={
            item?.profileImage
              ? {
                  uri: optimizeImageKitUrl(item?.profileImage, 200, 200),
                }
              : require('../../../public/images/dpPlaceholder.png')
          }
          style={styles.userAvatar}
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isSearchFocused}
        onScrollBeginDrag={dismissKeyboard}
        keyboardShouldPersistTaps="handled">
        <Layout>
          <HeroSection
            search={search}
            setSearch={setSearch}
            isSearchFocused={isSearchFocused}
            onSearchFocus={handleSearchFocus}
            onSearchBlur={handleSearchBlur}
          />
        </Layout>
        <TrekScapes />
        <Trailblazers />
      </ScrollView>

      {/* Full Screen Search Overlay */}
      {isSearchFocused && (
        <View style={styles.searchOverlay}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}>
              <Icon name="arrow-back-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search for User"
              style={styles.searchInput}
              placeholderTextColor="#8B8181"
              autoFocus={true}
              returnKeyType="search"
            />
          </View>

          {/* Search Results */}
          <View style={styles.searchResultsWrapper}>
            {renderSearchResults()}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  // Search Overlay Styles
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 22,
    backgroundColor: '#f8f8f8',
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    position: 'absolute',
    right: 32,
    width: 20,
    height: 20,
  },
  searchResultsWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContainer: {
    paddingBottom: 20,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
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
    paddingTop: 60,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomePage;
