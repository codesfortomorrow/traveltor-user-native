import Backheading from '../../components/Mobile/Backheading';
import {FeedContext} from '../../context/FeedContext';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn} from '../../utils/apiHandlers';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import IoCheckmarkSharp from 'react-native-vector-icons/Ionicons';
import FeedsContainer from '../../components/Mobile/FeedsContainer';
import SadIcon from '../../../public/images/sadIcon.svg';
import FeedLoader from '../../components/Common/FeedLoader';
import {setError} from '../../redux/Slices/errorPopup';
import FeedComment from '../../components/Modal/FeedComment';
import {EventRegister} from 'react-native-event-listeners';
import {updateScroll} from '../../redux/Slices/myfeedScroll';

const ITEMS_PER_PAGE = 5;

const MyFeeds = () => {
  const {getMyFeed, FeedReactionAction} = useAuth();
  const isLogin = isLoggedIn();
  const [contentLoader, setContentLoader] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [postId, setPostId] = useState('');
  const [feedUsername, setFeedUsername] = useState('');
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const [noData, setNoData] = useState(false);
  const feedContainerRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const isInitialLoad = useRef(true);

  const {
    feeds,
    setFeeds,
    feedLoading,
    setFeedLoading,
    setPageNumber,
    hasMore,
    setHasMore,
    scrollPosition,
  } = useContext(FeedContext);

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const [progress, setProgress] = useState({
    imgUrl: '',
    isPending: false,
    progress: 20,
    status: 'Uploading...',
  });

  const {isScroll} = useSelector(state => state?.myfeedScroll);

  useEffect(() => {
    const progressListener = EventRegister.addEventListener(
      'uploadProgress',
      data => {
        setProgress(data);
      },
    );

    const completeListener = EventRegister.addEventListener(
      'uploadComplete',
      () => {
        handleRefresh();
        setTimeout(() => {
          setProgress(prev => ({
            ...prev,
            isPending: false,
          }));
        }, 5000);
      },
    );

    return () => {
      EventRegister.removeEventListener(progressListener);
      EventRegister.removeEventListener(completeListener);
    };
  }, []);

  useEffect(() => {
    const restoreScrollPosition = async () => {
      if (scrollPosition.current && feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          y: parseInt(scrollPosition.current),
          animated: false,
        });
      }
    };

    restoreScrollPosition();
  }, []);

  useEffect(() => {
    if (isInitialLoad.current && feeds.length === 0) {
      isInitialLoad.current = false;
      initializeFeeds();
    }
  }, []);

  const initializeFeeds = async () => {
    try {
      const refresh = await AsyncStorage.getItem('refresh');
      if (!refresh) {
        fetchTreckScapeFeeds(0, true, true);
      } else {
        setCurrentPage(0);
        setPageNumber(0);
        fetchTreckScapeFeeds(0, false, true);
      }
    } catch (error) {
      console.error('Error initializing feeds:', error);
    }
  };

  const fetchTreckScapeFeeds = useCallback(
    async (page = 0, reset = false, refresh = false) => {
      try {
        if (isLoadingMore && !reset && !refresh) {
          return;
        }

        if (page < 0) {
          return;
        }

        setIsLoadingMore(true);

        if (page > 0 && !reset) {
          setContentLoader(true);
        }

        const response = await getMyFeed(page, refresh);

        if (response?.data) {
          const newData = response?.data?.data || [];
          setFeeds(prev => {
            if (reset) {
              return newData;
            } else {
              const existingIds = new Set(prev.map(item => item.id));
              const filteredNewData = newData.filter(
                item => !existingIds.has(item.id),
              );
              return [...prev, ...filteredNewData];
            }
          });

          const hasMoreData = newData.length === ITEMS_PER_PAGE;
          setHasMore(hasMoreData);

          if (!reset) {
            setCurrentPage(page);
            setPageNumber(page);
          } else {
            setCurrentPage(0);
            setPageNumber(0);
          }

          if (newData.length === 0 && page === 0) {
            setNoData(true);
          } else {
            setNoData(false);
          }
        }

        await AsyncStorage.setItem('refresh', 'true');
      } catch (error) {
        console.error('Error fetching feeds:', error);
        dispatch(
          setError({
            open: true,
            custom_message: 'Failed to load feeds. Please try again.',
          }),
        );
      } finally {
        setContentLoader(false);
        setFeedLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [getMyFeed, isLoadingMore, dispatch],
  );

  useEffect(() => {
    const checkReload = async () => {
      try {
        const isReload = await AsyncStorage.getItem('reloaded');
        if (!isReload) {
          await AsyncStorage.setItem('reloaded', 'true');
        }
      } catch (error) {
        console.error('Error checking reload status:', error);
      }
    };

    checkReload();
  }, []);

  const handleLikeDislike = async (id, index, type) => {
    if (isLogin) {
      try {
        setReactionDisabled(true);
        const response = await FeedReactionAction(id, type);
        if (response?.status) {
          const newTrackScapeFeeds = [...feeds];
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

          setFeeds(newTrackScapeFeeds);
          setReactionDisabled(false);
        } else {
          dispatch(
            setError({
              open: true,
              custom_message: response?.error?.message,
            }),
          );
          setReactionDisabled(false);
        }
      } catch (err) {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(0);
    setPageNumber(0);
    setHasMore(true);
    setNoData(false);
    scrollPosition.current = 0;
    await fetchTreckScapeFeeds(0, true, true);
  };

  const handleScrollEnd = ({nativeEvent}) => {
    const saveScrollPosition = async () => {
      try {
        const scrollPos = nativeEvent.contentOffset.y;
        scrollPosition.current = scrollPos.toString();
      } catch (error) {
        console.error('Error saving scroll position:', error);
      }
    };

    saveScrollPosition();
  };

  useEffect(() => {
    if (isScroll) {
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollToOffset({
          offset: 0,
          animated: true,
        });
        setTimeout(() => {
          handleRefresh();
        }, 500);
      }
      dispatch(updateScroll(false));
    }
  }, [isScroll]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore || contentLoader || refreshing) {
      return;
    }

    const nextPage = currentPage + 1;
    fetchTreckScapeFeeds(nextPage, false, false);
  }, [
    hasMore,
    isLoadingMore,
    contentLoader,
    refreshing,
    currentPage,
    fetchTreckScapeFeeds,
  ]);

  const renderFeedItem = ({item, index}) => (
    <View style={styles.feedItem}>
      <FeedsContainer
        item={item}
        indexed={index}
        handleLike={() => handleLikeDislike(item?.id, index, 'Like')}
        handleDislike={() => handleLikeDislike(item?.id, index, 'Dislike')}
        setCommentModal={setCommentModal}
        setPostId={setPostId}
        setFeedUsername={setFeedUsername}
        reactionDisabled={reactionDisabled}
      />
    </View>
  );

  const keyExtractor = (item, index) => `${item.id}-${index}`;

  const renderFooter = () => {
    if (contentLoader && hasMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e93c00" />
        </View>
      );
    }

    return <View style={{height: 20}} />;
  };

  return (
    <View style={styles.container}>
      <Backheading heading={'My Feeds'} notifyIcon={true} nextTrip={false} />
      {feedLoading && <FeedLoader />}
      <FlatList
        ref={feedContainerRef}
        data={feeds}
        renderItem={!feedLoading ? renderFeedItem : null}
        contentContainerStyle={{paddingBottom: 100}}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={5}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={() =>
          progress?.isPending && <PublishStatus publishStatus={progress} />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() =>
          noData &&
          !feedLoading && (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataImage}>
                <SadIcon width={30} height={30} />
              </View>
              <Text style={styles.noDataText}>
                Oops! No feeds available at this moment
              </Text>
            </View>
          )
        }
      />
      <FeedComment
        isVisible={commentModal}
        onClose={() => setCommentModal(false)}
        postId={postId}
        feedUsername={feedUsername}
        setTrackScapeFeeds={setFeeds}
      />
    </View>
  );
};

export default MyFeeds;

const PublishStatus = ({publishStatus}) => {
  const {imgUrl, progress, status} = publishStatus;

  return (
    <View style={styles.publishStatusContainer}>
      <View style={styles.publishStatusHeader}>
        <Image
          source={
            imgUrl && {
              uri: typeof imgUrl === 'string' ? imgUrl : imgUrl.uri,
            }
          }
          style={styles.publishStatusImage}
        />
        <View style={styles.publishStatusTextContainer}>
          {status === 'Published' && (
            <IoCheckmarkSharp name="checkmark-sharp" size={20} color="#000" />
          )}
          <Text style={styles.publishStatusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarForeground, {width: `${progress}%`}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ptrView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    height: Dimensions.get('window').height - 100,
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  feedContainer: {
    paddingBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  feedItem: {
    marginBottom: 10,
  },
  noDataContainer: {
    flex: 1,
    height: Dimensions.get('window').height - 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataImage: {
    height: 60,
    marginBottom: 20,
  },
  noDataText: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  publishStatusContainer: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 10,
  },
  publishStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  publishStatusImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 8,
  },
  publishStatusTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishStatusText: {
    fontSize: 15,
    color: '#475569',
    marginLeft: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  progressBarForeground: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});
