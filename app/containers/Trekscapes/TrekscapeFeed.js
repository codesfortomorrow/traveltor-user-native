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
  const [isShoutOut, setIsShoutOut] = useState(false);
  const [shoutOutFeed, setShoutOutFeed] = useState([]);
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef = useRef(null);
  const onEndReachedCalledDuringMomentum = useRef(false);

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
      let response;
      setLoading(true);
      try {
        response = await getTrackScapeFeeds(slug, user?.id, page);
        if (response) {
          setTrackScapeFeeds(prev => [...prev, ...response?.data?.data]);
          setHasMore(response?.data?.data?.length === 5);
        }
        if (response?.data?.data) {
          setIsLoading(false);
        }
        setLoading(false);
      } catch (error) {
        return error;
      } finally {
        if (response?.data?.data?.length == 0) {
          setIsLoading(false);
        }
      }
    },
    [slug, user?.id],
  );

  useEffect(() => {
    fetchTreckScapeFeeds(pageNumber);
  }, [pageNumber]);

  const handleEndReached = () => {
    if (!onEndReachedCalledDuringMomentum.current && hasMore && !loading) {
      setPageNumber(prev => prev + 1);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

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
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}>
            {trackScapeFeeds?.length > 0 ? (
              trackScapeFeeds?.map((item, index) => (
                <FeedsContainer
                  item={item}
                  key={index}
                  handleLike={() => handleLikeDislike(item?.id, index, 'Like')}
                  handleDislike={() =>
                    handleLikeDislike(item?.id, index, 'Dislike')
                  }
                  commentModal={commentModal}
                  setIsLoading={setIsLoading}
                  setCommentModal={setCommentModal}
                  setPostId={setPostId}
                  setFeedUsername={setFeedUsername}
                  setIsShoutOut={setIsShoutOut}
                  setShoutOutFeed={setShoutOutFeed}
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

            {loading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            <View style={styles.endSpacer} />
          </ScrollView>
        </View>
      </View>

      {/* <FeedComment
        isVisible={commentModal}
        onClose={() => setCommentModal(false)}
        postId={postId}
        feedUsername={feedUsername}
        setTrackScapeFeeds={setTrackScapeFeeds}
      /> */}

      {/* {isShoutOut && (
        <ShoutOut setIsShoutOut={setIsShoutOut} feed={shoutOutFeed} />
      )} */}
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
  endSpacer: {
    height: 50,
  },
});

export default TrekscapeFeed;
