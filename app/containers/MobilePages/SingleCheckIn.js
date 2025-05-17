import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {getAuthReq} from '../../utils/apiHandlers';
import Backheading from '../../components/Mobile/Backheading';
import moment from 'moment';
import FeedComment from '../../components/Modal/FeedComment';
import {useDispatch, useSelector} from 'react-redux';
import {setError} from '../../redux/Slices/errorPopup';
import useAuth from '../../hooks/useAuth';
import {useNavigation, useRoute} from '@react-navigation/native';
import Skeleton from 'react-native-skeleton-placeholder';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactionIcon from 'react-native-vector-icons/AntDesign';
import CheckIcon from '../../../public/images/icons/check.svg';
import Marker from '../../../public/images/icons/marker.svg';
import FaRegComment from 'react-native-vector-icons/FontAwesome';
import FeedReactionList from '../../components/Modal/FeedReactionList';
import FeedMenuBar from '../../components/Modal/FeedMenuBar';
import ShoutOut from '../../components/Modal/ShoutOut';

const SingleCheckIn = () => {
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const reviewText = feed?.review || '';
  const displayText = expanded ? reviewText : reviewText.slice(0, 50);
  const navigation = useNavigation();
  const route = useRoute();
  const {feedId} = route.params;
  const [commentModal, setCommentModal] = useState(false);
  const [postId, setPostId] = useState('');
  const [feedUsername, setFeedUsername] = useState('');
  const {handleReactionOnTrekscapeFeed} = useAuth();
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user);
  const [isShoutOut, setIsShoutOut] = useState(false);
  const [shoutOutFeed, setShoutOutFeed] = useState([]);
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [reactionData, setReactionData] = useState([]);
  const [type, setType] = useState('');
  const [reactionLoader, setReactionLoader] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedCommentModal = await AsyncStorage.getItem('commentModal');
        const storedPostId = await AsyncStorage.getItem('postId');
        const storedFeedUsername = await AsyncStorage.getItem('feedUsername');

        if (storedCommentModal) setCommentModal(JSON.parse(storedCommentModal));
        if (storedPostId) setPostId(JSON.parse(storedPostId));
        if (storedFeedUsername) setFeedUsername(JSON.parse(storedFeedUsername));
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadStorageData();
  }, []);

  useEffect(() => {
    const saveStorageData = async () => {
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
        console.error('Error saving data to AsyncStorage:', error);
      }
    };

    saveStorageData();
  }, [commentModal]);

  const toggleReview = () => {
    setExpanded(prevState => !prevState);
  };

  const fetchSinglefeed = async user => {
    const res = await getAuthReq(`/check-ins/${feedId}?userId=${user?.id}`);
    if (res?.status) {
      setFeed(res?.data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      navigation.navigate('MyFeeds');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSinglefeed(user);
    }
  }, [feedId, user]);

  useEffect(() => {
    const handleBackButton = () => {
      if (commentModal) {
        setCommentModal(false);
        return true; // Prevent default behavior
      }
      return false;
    };

    // For React Native, we would use the BackHandler from react-native
    // This is a placeholder for the equivalent Web functionality
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      //   BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [commentModal]);

  const handleLikeDislike = async (id, type) => {
    try {
      setReactionDisabled(true);
      const response = await handleReactionOnTrekscapeFeed(id, type);
      if (response?.status) {
        const newTrackScapeFeeds = {...feed};
        if (type === 'Like') {
          if (newTrackScapeFeeds.reaction === 'Dislike') {
            newTrackScapeFeeds.dislikes -= 1;
          }
          newTrackScapeFeeds.likes += 1;
          newTrackScapeFeeds.reaction = 'Like';
        } else {
          if (newTrackScapeFeeds.reaction === 'Like') {
            newTrackScapeFeeds.likes -= 1;
          }
          newTrackScapeFeeds.dislikes += 1;
          newTrackScapeFeeds.reaction = 'Dislike';
        }

        setFeed(newTrackScapeFeeds);
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
      dispatch(
        setError({
          open: true,
          custom_message: err || 'Something went wrong',
        }),
      );
      setReactionDisabled(false);
    }
  };

  const fetchReactions = async (checkInId, type) => {
    setReactionLoader(true);
    const res = await getAuthReq(
      `/check-ins/users/${checkInId}/reactions?userId=${user?.id}&rection=${type}`,
    );
    if (res?.status) {
      setReactionData(res?.data?.data);
      setReactionLoader(false);
    } else {
      setReactionLoader(false);
      console.log(res?.error);
    }
  };

  const onDoubleTap = (
    e,
    feed,
    handleLikeDislike,
    setShowHeart,
    lastTapRef,
    doubleclick,
  ) => {
    if (
      e.nativeEvent &&
      e.nativeEvent.touches &&
      e.nativeEvent.touches.length > 1
    )
      return;

    const currentTime = new Date().getTime();
    const tapGap = currentTime - lastTapRef.current;

    if (e.type === 'touchstart') {
      const startY = e.nativeEvent.touches[0].clientY;

      const touchMoveHandler = moveEvent => {
        const moveY = moveEvent.nativeEvent.touches[0].clientY;
        if (Math.abs(moveY - startY) > 10) {
          // In React Native we would use different event handling
          return;
        }
      };

      // In React Native we would use different event handling
      setTimeout(() => {
        // Cleanup
      }, 300);
    }

    if (doubleclick || (tapGap < 300 && tapGap > 0)) {
      setShowHeart(true);
      if (feed?.reaction !== 'Like') {
        handleLikeDislike(feed?.id, 'Like');
      }
      setTimeout(() => setShowHeart(false), 500);
    }

    lastTapRef.current = currentTime;
  };

  return (
    <>
      <View style={styles.container}>
        <Backheading heading={'CheckIn'} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <View style={styles.contentContainer}>
            {isLoading && (
              <View>
                <View style={styles.loaderHeader}>
                  <View style={styles.loaderUserInfo}>
                    <Skeleton circle={true} height={50} width={50} />
                    <View>
                      <Skeleton width={120} height={14} />
                      <View style={styles.loaderUserMetaInfo}>
                        <Skeleton width={15} height={15} />
                        <Skeleton width={140} height={12} />
                      </View>
                    </View>
                  </View>
                  <Skeleton width={25} height={12} />
                </View>
                <View style={styles.loaderImageContainer}>
                  <Skeleton height={260} width="100%" />
                </View>
                <View style={styles.loaderReview}>
                  <Skeleton count={1} height={12} width="40%" />
                </View>
                <View style={styles.loaderReactionsContainer}>
                  <View style={styles.loaderReactionsLeft}>
                    <Skeleton width={20} height={20} />
                    <Skeleton width={50} height={10} />
                    <Skeleton width={40} height={10} />
                  </View>
                  <View style={styles.loaderReactionsRight}>
                    <Skeleton width={20} height={20} />
                    <Skeleton width={50} height={10} />
                    <Skeleton width={40} height={10} />
                  </View>
                </View>
              </View>
            )}
            {!isLoading && (
              <View>
                <View style={styles.headerContainer}>
                  <TouchableOpacity
                    style={styles.userInfoContainer}
                    onPress={() =>
                      navigation.navigate(
                        `${feed?.user?.type?.toLowerCase()}Profile`,
                        {userId: feed?.userId},
                      )
                    }>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={
                          feed?.user?.profileImage
                            ? {
                                uri: `${feed?.user?.profileImage}`,
                              }
                            : require('../../../public/images/dpPlaceholder.png')
                        }
                        style={[
                          styles.avatar,
                          feed?.user?.profileImage == null &&
                            styles.avatarPlaceholder,
                        ]}
                      />
                    </View>
                    <View style={styles.userInfoTextContainer}>
                      <View style={styles.nameContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate(
                              `${feed?.user?.type?.toLowerCase()}Profile`,
                              {userId: feed?.userId},
                            )
                          }>
                          <Text style={styles.nameText}>
                            {feed?.user?.firstname + ' ' + feed?.user?.lastname}
                          </Text>
                        </TouchableOpacity>
                        {feed?.user?.type?.toLowerCase() === 'trailblazer' && (
                          <CheckIcon width={16} height={16} />
                        )}
                        {feed?.trailPoint?.slug && feed?.trailPoint?.name && (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('TrailPoint', {
                                slug: feed?.trailPoint?.slug,
                              })
                            }>
                            <Text
                              style={styles.trailPointText}
                              numberOfLines={1}>
                              {`at ${feed?.trailPoint?.name}`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.locationContainer}>
                        <Marker width={15} height={15} />
                        <Text style={styles.locationText}>
                          Checked in {moment(Number(feed?.timestamp)).fromNow()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.menuContainer}>
                    {/* Menu button would go here */}
                    <FeedMenuBar
                      feed={feed}
                      setIsShoutOut={setIsShoutOut}
                      setShoutOutFeed={setShoutOutFeed}
                    />
                  </View>
                </View>
                <View style={styles.imageContainer}>
                  <Swiper
                    style={styles.swiper}
                    dotStyle={styles.swiperDot}
                    activeDotStyle={styles.swiperActiveDot}
                    showsButtons={false}
                    loop={true}
                    autoplay={false}
                    scrollEnabled={true}
                    bounces={true}
                    paginationStyle={{bottom: 10}}
                    removeClippedSubviews={false}>
                    {feed?.media?.map((image, index) => (
                      <View
                        key={index}
                        onDoubleTap={() =>
                          onDoubleTap(
                            null,
                            feed,
                            handleLikeDislike,
                            setShowHeart,
                            lastTapRef,
                            true,
                          )
                        }>
                        <Image
                          source={{uri: image}}
                          style={styles.feedImage}
                          onLoad={() => setIsLoading(false)}
                        />
                      </View>
                    ))}
                    {/* {showHeart && (
                      <AnimatePresence>
                        <View style={styles.heartContainer}>
                          <Heart color="white" size={56} fill="white" />
                        </View>
                      </AnimatePresence>
                    )} */}
                  </Swiper>
                </View>
                {feed?.review && (
                  <View style={styles.reviewContainer}>
                    <Text style={styles.reviewText}>
                      <Text style={styles.reviewerName}>
                        {feed?.user?.firstname} {feed?.user?.lastname}:
                      </Text>{' '}
                      {displayText}
                      {feed?.review?.length > 50 && (
                        <Text
                          style={styles.toggleButton}
                          onPress={toggleReview}>
                          {expanded ? ' less' : ' ...more'}
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
                <View style={styles.reactionsContainer}>
                  <View style={styles.likeContainer}>
                    <TouchableOpacity
                      disabled={
                        (feed?.reaction === 'Like' ? true : false) ||
                        reactionDisabled
                      }
                      style={[
                        styles.reactionButton,
                        feed?.reaction?.toLowerCase() === 'like' &&
                          styles.activeReaction,
                      ]}
                      onPress={() => handleLikeDislike(feed?.id, 'Like')}>
                      <ReactionIcon
                        name="like2"
                        size={32}
                        color={
                          feed?.reaction?.toLowerCase() === 'like'
                            ? '#e93c00'
                            : '#000'
                        }
                      />
                      <Text style={styles.reactionText}>Must Go</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.countButton}
                      onPress={() => {
                        setOpen(true);
                        fetchReactions(feed?.id, 'Like');
                        setType('Likes');
                      }}>
                      <Text style={styles.countText}>{feed.likes || 0}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dislikeContainer}>
                    <TouchableOpacity
                      disabled={
                        (feed?.reaction?.toLowerCase() === 'dislike'
                          ? true
                          : false) || reactionDisabled
                      }
                      style={[
                        styles.reactionButton,
                        feed?.reaction?.toLowerCase() === 'dislike' &&
                          styles.activeReaction,
                      ]}
                      onPress={() => handleLikeDislike(feed?.id, 'Dislike')}>
                      <ReactionIcon
                        name="dislike2"
                        size={32}
                        color={
                          feed?.reaction?.toLowerCase() === 'dislike'
                            ? '#e93c00'
                            : '#000'
                        }
                      />
                      <Text style={styles.reactionText}>Least Go</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.countButton}
                      onPress={() => {
                        setOpen(true);
                        fetchReactions(feed?.id, 'Dislike');
                        setType('DisLikes');
                      }}>
                      <Text style={styles.countText}>{feed.dislikes || 0}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.commentContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setPostId(feed?.id);
                        setFeedUsername(feed?.user?.username);
                        setCommentModal(true);
                      }}>
                      <FaRegComment name="comment-o" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.countText}>
                      {feed?._count?.comments || 0}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {commentModal && (
        <FeedComment
          isVisible={commentModal}
          onClose={() => setCommentModal(false)}
          postId={postId}
          feedUsername={feedUsername}
          fetchSinglefeed={fetchSinglefeed}
        />
      )}
      {/* Additional modals like ShoutOut and LikesModal would go here */}
      {isShoutOut && (
        <ShoutOut
          open={isShoutOut}
          onClose={() => setIsShoutOut(false)}
          feed={shoutOutFeed}
        />
      )}
      {open && (
        <FeedReactionList
          open={open}
          onClose={() => setOpen(false)}
          list={reactionData}
          type={type}
          isLoading={reactionLoader}
          setReactionData={setReactionData}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    borderColor: '#E5E5E5',
    borderWidth: 1,
  },
  loaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  loaderUserInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  loaderUserMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  loaderImageContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 0,
  },
  loaderReview: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  loaderReactionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  loaderReactionsLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
    paddingLeft: 20,
  },
  loaderReactionsRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 10,
    width: '100%',
  },
  userInfoContainer: {
    flexDirection: 'row',
    width: '95%',
  },
  avatarContainer: {
    width: '18%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: '#000',
  },
  userInfoTextContainer: {
    width: '81%',
    flexDirection: 'column',
    gap: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  trailPointText: {
    whiteSpace: 'nowrap',
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  markerIcon: {
    width: 15,
    height: 15,
  },
  locationText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '5%',
  },
  imageContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 0,
  },
  swiper: {
    height: 524,
  },
  swiperDot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  swiperActiveDot: {
    backgroundColor: '#E93C00',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  feedImage: {
    width: '100%',
    minHeight: 524,
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  reviewContainer: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  reviewText: {
    fontSize: 12,
    fontFamily: 'Inter',
    lineHeight: 17,
  },
  reviewerName: {
    fontWeight: '600',
  },
  toggleButton: {
    color: '#E86900',
    fontSize: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 8,
    alignItems: 'center',
  },
  likeContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
  },
  dislikeContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
  },
  commentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeReaction: {
    color: '#E86900',
  },
  reactionIcon: {
    width: 32,
    height: 32,
  },
  inactiveIcon: {
    opacity: 0.5,
  },
  reactionText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: 'normal',
  },
  countButton: {
    cursor: 'pointer',
  },
  countText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: 'normal',
  },
  commentIcon: {
    width: 24,
    height: 24,
    color: '#5c5c5c',
  },
});

export default SingleCheckIn;
