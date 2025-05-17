import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn} from '../../utils/apiHandlers';
import {useDispatch, useSelector} from 'react-redux';
import {setError} from '../../redux/Slices/errorPopup';
import FeedLoader from '../../components/Common/FeedLoader';
import Backheading from '../../components/Mobile/Backheading';
import FeedsContainer from '../../components/Mobile/FeedsContainer';
import {useRoute} from '@react-navigation/native';
import TrailpointReviewFilter from './TrailpointReviewFilter';
import FeedComment from '../../components/Modal/FeedComment';

const TrailpointReview = () => {
  const {
    getSingleTrailpointforReview,
    getSingleTrailpoint,
    handleReactionOnTrekscapeFeed,
  } = useAuth();
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trailPointInfo, setTrailPointInfo] = useState({});
  const [trailPoints, setTrailPoints] = useState([]);
  const route = useRoute();
  const slug = route.params?.slug;
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [contentLoader, setContentLoader] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollViewRef = useRef(null);
  const [commentModal, setCommentModal] = useState(() => {
    try {
      const value = global.sessionStorage?.getItem('commentModal');
      return value ? JSON.parse(value) : false;
    } catch (error) {
      return false;
    }
  });
  const [postId, setPostId] = useState(() => {
    try {
      const value = global.sessionStorage?.getItem('postId');
      return value ? JSON.parse(value) : '';
    } catch (error) {
      return '';
    }
  });
  const [feedUsername, setFeedUsername] = useState(() => {
    try {
      const value = global.sessionStorage?.getItem('feedUsername');
      return value ? JSON.parse(value) : '';
    } catch (error) {
      return '';
    }
  });
  const [isShoutOut, setIsShoutOut] = useState(false);
  const [shoutOutFeed, setShoutOutFeed] = useState([]);
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const user = useSelector(state => state?.user);

  useEffect(() => {
    try {
      global.sessionStorage?.setItem(
        'commentModal',
        JSON.stringify(commentModal),
      );
      global.sessionStorage?.setItem('postId', JSON.stringify(postId));
      global.sessionStorage?.setItem(
        'feedUsername',
        JSON.stringify(feedUsername),
      );

      if (!commentModal) {
        global.sessionStorage?.setItem('postId', JSON.stringify(''));
        global.sessionStorage?.setItem('feedUsername', JSON.stringify(''));
      }
    } catch (error) {
      console.log('Session storage error:', error);
    }
  }, [commentModal]);

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  const fetchSingleTrailpoint = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSingleTrailpoint(slug);
      if (response) {
        setTrailPointInfo(response);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }, [slug]);

  const fetchTrailpointDetail = useCallback(
    async (filterData, userId, page) => {
      if (page === 0) {
        setTrailPoints([]);
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await getSingleTrailpointforReview(
          slug,
          filterData,
          userId,
          page,
        );
        if (response) {
          setTrailPoints(prev =>
            page === 0 ? response?.data : [...prev, ...response?.data],
          );
          setHasMore(response?.data?.length === 5);
        }
      } catch (error) {
        console.log('Error:', error);
        dispatch(
          setError({
            open: true,
            custom_message: 'Failed to load reviews. Please try again.',
          }),
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [slug, dispatch],
  );

  useEffect(() => {
    fetchSingleTrailpoint();
  }, [fetchSingleTrailpoint]);

  useEffect(() => {
    if (user?.id) {
      fetchTrailpointDetail('', user?.id, pageNumber);
    }
  }, [user?.id, pageNumber, fetchTrailpointDetail]);

  const handleFilterData = data => {
    setPageNumber(0); // Reset to first page when applying filters
    fetchTrailpointDetail(data, user?.id, 0);
    setShowFilter(false);
  };

  const handleLikeDislike = async (id, index, type) => {
    if (isLoggedIn()) {
      try {
        setReactionDisabled(true);

        const response = await handleReactionOnTrekscapeFeed(id, type);
        if (response?.status) {
          const newFeeds = [...trailPoints];
          if (type === 'Like') {
            if (newFeeds[index].reaction === 'Dislike') {
              newFeeds[index].dislikes -= 1;
            }
            newFeeds[index].likes += 1;
            newFeeds[index].reaction = 'Like';
          } else {
            if (newFeeds[index].reaction === 'Like') {
              newFeeds[index].likes -= 1;
            }
            newFeeds[index].dislikes += 1;
            newFeeds[index].reaction = 'Dislike';
          }

          setTrailPoints(newFeeds);
          setReactionDisabled(false);
        } else {
          dispatch(
            setError({open: true, custom_message: response?.error?.message}),
          );
          setReactionDisabled(false);
        }
      } catch (err) {
        dispatch(
          setError({
            open: true,
            custom_message:
              err ||
              ' Something went wrong, please clear your cookies and try again.',
          }),
        );
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

  // Improved scroll detection function with debounce-like behavior
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 50;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // Improved handler with guard against multiple triggers
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      setPageNumber(prevPage => prevPage + 1);
    }
  }, [isLoading, isLoadingMore, hasMore]);

  // Optimized scroll handler
  const handleScroll = useCallback(
    ({nativeEvent}) => {
      if (isCloseToBottom(nativeEvent)) {
        handleLoadMore();
      }
    },
    [handleLoadMore],
  );

  return (
    <View style={styles.container}>
      <Backheading
        heading={
          trailPointInfo?.name ? trailPointInfo?.name + ' Review' : 'N/A'
        }
        handleFilter={handleFilter}
        addFilter={true}
        loading={isLoading}
      />
      {isLoading && pageNumber === 0 && <FeedLoader />}
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollView,
          isLoading && pageNumber === 0 ? styles.hidden : styles.visible,
        ]}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {trailPoints?.length > 0
          ? trailPoints?.map((item, index) => (
              <FeedsContainer
                item={item}
                key={item?.id || index} // Better key usage
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
          : !isLoading && (
              <Text style={styles.noDataText}>No reviews found</Text>
            )}

        {isLoadingMore && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#e93c00" />
          </View>
        )}
      </ScrollView>

      <TrailpointReviewFilter
        open={showFilter}
        handleClose={handleFilterData}
      />
      <FeedComment
        isVisible={commentModal}
        onClose={() => setCommentModal(false)}
        postId={postId}
        feedUsername={feedUsername}
        setTrackScapeFeeds={setTrailPoints}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    minHeight: '95%',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
  },
  noDataText: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    height: 60,
  },
});

export default TrailpointReview;
