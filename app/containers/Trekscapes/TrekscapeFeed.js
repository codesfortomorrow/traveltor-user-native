import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import FeedLoader from '../../components/Common/FeedLoader';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn} from '../../utils/apiHandlers';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeedsContainer from '../../components/Mobile/FeedsContainer';
import TrekscapeHeader from './TrekscapeHeader';
import SadIcon from '../../../public/images/sadIcon.svg';
import {setError} from '../../redux/Slices/errorPopup';
import FeedComment from '../../components/Modal/FeedComment';

const TrekscapeFeed = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const {slug} = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const {getTrackScapeFeeds, handleReactionOnTrekscapeFeed} = useAuth();
  const [trackScapeFeeds, setTrackScapeFeeds] = useState([]);
  const user = useSelector(state => state?.user);
  const isLogin = isLoggedIn();
  const [commentModal, setCommentModal] = useState(false);
  const [postId, setPostId] = useState('');
  const [feedUsername, setFeedUsername] = useState('');
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef = useRef(null);
  const loadingRef = useRef(false); // Prevent multiple simultaneous loads
  const lastScrollY = useRef(0);
  const scrollTimer = useRef(null);

  useEffect(() => {
    // Load stored session data
    const loadSessionData = async () => {
      try {
        const storedCommentModal = await AsyncStorage.getItem('commentModal');
        const storedPostId = await AsyncStorage.getItem('postId');
        const storedFeedUsername = await AsyncStorage.getItem('feedUsername');

        if (storedCommentModal) setCommentModal(JSON.parse(storedCommentModal));
        if (storedPostId) setPostId(JSON.parse(storedPostId));
        if (storedFeedUsername) setFeedUsername(JSON.parse(storedFeedUsername));
      } catch (error) {
        console.error('Error loading session data', error);
      }
    };

    loadSessionData();
  }, []);

  useEffect(() => {
    // Save session data
    const saveSessionData = async () => {
      try {
        await AsyncStorage.setItem(
          'commentModal',
          JSON.stringify(commentModal),
        );
        await AsyncStorage.setItem('postId', JSON.stringify(postId));
        await AsyncStorage.setItem(
          'feedUsername',
          JSON.stringify(feedUsername),
        );

        if (!commentModal) {
          await AsyncStorage.setItem('postId', JSON.stringify(''));
          await AsyncStorage.setItem('feedUsername', JSON.stringify(''));
        }
      } catch (error) {
        console.error('Error saving session data', error);
      }
    };

    saveSessionData();
  }, [commentModal]);

  const fetchTreckScapeFeeds = useCallback(
    async page => {
      if (loadingRef.current) return; // Prevent multiple simultaneous requests

      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await getTrackScapeFeeds(slug, user?.id, page);

        if (response?.data?.data) {
          if (page === 0) {
            // Initial load or refresh
            setTrackScapeFeeds(response.data.data);
          } else {
            // Pagination load
            setTrackScapeFeeds(prev => [...prev, ...response.data.data]);
          }

          // Check if there are more items to load
          setHasMore(response.data.data.length === 5);
          setIsLoading(false);
        } else {
          setHasMore(false);
          if (page === 0) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching feeds:', error);
        setHasMore(false);
        if (page === 0) {
          setIsLoading(false);
        }
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [slug, user?.id, getTrackScapeFeeds],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchTreckScapeFeeds(pageNumber);
  }, [pageNumber, fetchTreckScapeFeeds]);

  // Handle scroll events for pagination with debouncing
  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const currentScrollY = contentOffset.y;

    // Only check if user is scrolling down
    if (currentScrollY <= lastScrollY.current) {
      lastScrollY.current = currentScrollY;
      return;
    }

    lastScrollY.current = currentScrollY;

    // Clear existing timer
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    // Debounce the scroll check
    scrollTimer.current = setTimeout(() => {
      const paddingToBottom = 300; // Trigger pagination when user is 300px from bottom

      // Calculate how close we are to the bottom
      const isCloseToBottom =
        layoutMeasurement.height + currentScrollY >=
        contentSize.height - paddingToBottom;

      // Also check percentage scrolled (trigger at 75% scrolled)
      const scrollPercentage =
        (currentScrollY + layoutMeasurement.height) / contentSize.height;

      if (
        (isCloseToBottom || scrollPercentage >= 0.75) &&
        hasMore &&
        !loading &&
        !loadingRef.current
      ) {
        loadMoreData();
      }
    }, 100); // 100ms debounce
  };

  const loadMoreData = useCallback(() => {
    if (hasMore && !loading && !loadingRef.current) {
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, loading, pageNumber]);

  const handleLikeDislike = async (id, index, type) => {
    if (isLogin) {
      try {
        setReactionDisabled(true);
        const response = await handleReactionOnTrekscapeFeed(id, type);
        if (response?.status) {
          const newTrackScapeFeeds = [...trackScapeFeeds];
          if (type === 'Like') {
            if (newTrackScapeFeeds[index].reaction === 'Dislike') {
              newTrackScapeFeeds[index].dislikes -= 1;
            }
            newTrackScapeFeeds[index].likes += 1;
            newTrackScapeFeeds[index].reaction = 'Like';
          } else {
            if (newTrackScapeFeeds[index].reaction === 'Like') {
              newTrackScapeFeeds[index].likes -= 1;
            }
            newTrackScapeFeeds[index].dislikes += 1;
            newTrackScapeFeeds[index].reaction = 'Dislike';
          }

          setTrackScapeFeeds(newTrackScapeFeeds);
        } else {
          dispatch(
            setError({
              open: true,
              custom_message: response?.data?.message,
            }),
          );
        }
      } catch (err) {
        dispatch(
          setError({
            open: true,
            custom_message: err || 'Something went wrong',
          }),
        );
      } finally {
        setReactionDisabled(false);
      }
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: 'Please login to cast your vote on the post.',
        }),
      );
    }
  };

  // Refresh function for pull-to-refresh
  const handleRefresh = useCallback(() => {
    setPageNumber(0);
    setHasMore(true);
    setIsLoading(true);
  }, []);

  return (
    <View style={styles.container}>
      <TrekscapeHeader />
      <View style={styles.contentContainer}>
        {isLoading && <FeedLoader />}
        <View style={isLoading ? styles.hidden : styles.visible}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16} // Smooth scrolling (60fps)
          >
            {trackScapeFeeds?.length > 0 ? (
              trackScapeFeeds?.map((item, index) => (
                <FeedsContainer
                  item={item}
                  key={`${item?.id}-${index}`} // Better key using item id
                  handleLike={() => handleLikeDislike(item?.id, index, 'Like')}
                  handleDislike={() =>
                    handleLikeDislike(item?.id, index, 'Dislike')
                  }
                  commentModal={commentModal}
                  setIsLoading={setIsLoading}
                  setCommentModal={setCommentModal}
                  setPostId={setPostId}
                  setFeedUsername={setFeedUsername}
                  reactionDisabled={reactionDisabled}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <SadIcon width={60} />
                <Text style={styles.emptyText}>
                  Oops! No feeds available at this moment
                </Text>
              </View>
            )}

            {loading && hasMore && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#e93c00" />
              </View>
            )}

            <View style={styles.endSpacer} />
          </ScrollView>
        </View>
      </View>

      <FeedComment
        isVisible={commentModal}
        onClose={() => setCommentModal(false)}
        postId={postId}
        feedUsername={feedUsername}
        setTrackScapeFeeds={setTrackScapeFeeds}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    minHeight: '80%',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    borderColor: '#ccc',
    borderWidth: 0.5,
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyImage: {
    height: 60,
    resizeMode: 'contain',
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 20,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  endContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  endSpacer: {
    height: 50,
  },
});

export default TrekscapeFeed;
