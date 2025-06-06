import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn} from '../../utils/apiHandlers';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import Login from '../Modal/Login';
import Signup from '../Signup';
import Backheading from './Backheading';
import FeedsContainer from './FeedsContainer';
import FeedLoader from '../Common/FeedLoader';
import {setError} from '../../redux/Slices/errorPopup';
import FeedComment from '../../components/Modal/FeedComment';
import DeleteConfirmation from '../Modal/DeleteConfirmation';
import Constant from '../../utils/constant';
import FastImage from 'react-native-fast-image';

const UserProfile = () => {
  const dispatch = useDispatch();
  const [feedLoading, setFeedLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const route = useRoute();
  const {userType, id} = route.params || {};
  const [commentModal, setCommentModal] = useState(false);
  const [postId, setPostId] = useState('');
  const [feedUsername, setFeedUsername] = useState('');
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [trailblazer, setTrailblazer] = useState({});
  const isLogin = isLoggedIn();
  const user = useSelector(state => state.user);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [forgotPopup, setForgotPopup] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [reactionDisabled, setReactionDisabled] = useState(false);
  const [feedId, setFeedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [isFollowDisable, setIsFollowDisable] = useState(false);
  const {optimizeImageKitUrl} = Constant();
  const {navigate} = useNavigation();
  const {getUserDetails, getUserFeeds, reactionOnFeed, userFollowUnFollow} =
    useAuth();

  const toCase = str => {
    return str
      ?.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchDetails = useCallback(
    async (id, userId) => {
      setDetailLoading(true);
      try {
        const response = await getUserDetails(
          Number(id),
          toCase(userType),
          Number(userId),
        );
        if (response) {
          setTrailblazer(response);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setDetailLoading(false);
      }
    },
    [id, user?.id],
  );

  useEffect(() => {
    if (id && user?.id) {
      fetchDetails(id, user?.id);
    }
  }, [id, user?.id]);

  const handleFollowUnFollow = async id => {
    try {
      setIsFollowDisable(true);
      const response = await userFollowUnFollow(id);
      if (response?.status) {
        setTrailblazer(prev => ({
          ...prev,
          isFollow: !prev?.isFollow,
          followers: response?.data?.follow
            ? prev?.followers + 1
            : prev?.followers - 1,
        }));
      }
    } catch (err) {
      dispatch(
        setError({
          open: true,
          custom_message: err || 'Something went wrong',
        }),
      );
    } finally {
      setIsFollowDisable(false);
    }
  };

  const handleReactionOnFeed = async (id, index, type) => {
    if (isLogin) {
      try {
        setReactionDisabled(true);
        const response = await reactionOnFeed(id, type);
        if (response?.status) {
          const newFeeds = [...feeds];
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
          setFeeds(newFeeds);
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

  const fetchFeeds = useCallback(
    async (id, userId, pageNumber) => {
      let response;
      pageNumber ? setLoading(true) : setFeedLoading(true);
      try {
        response = await getUserFeeds(Number(id), Number(userId), pageNumber);
        if (response) {
          setFeeds(prev => [...prev, ...response?.data?.data]);
          setHasMore(response?.data?.data?.length === 5);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setFeedLoading(false);
        setLoading(false);
      }
    },
    [id, pageNumber, user?.id],
  );

  useEffect(() => {
    setFeeds([]);
    setPageNumber(0);
  }, [id]);

  useEffect(() => {
    if (id && user?.id) {
      fetchFeeds(id, user?.id, pageNumber);
    }
  }, [id, user?.id, pageNumber]);

  // Helper function to detect when scrolled to bottom
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 50;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  // Replace IntersectionObserver with React Native's onEndReached for FlatList
  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  }, [loading, hasMore, pageNumber]);

  const moveToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const moveToSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const renderSkeleton = () => (
    <>
      <View style={styles.profileHeaderContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.skeletonCircle} />
          <View style={styles.skeletonText} />
        </View>
        <View style={styles.headerRight}>
          <View style={styles.skeletonButton} />
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.statsContainer}>
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <View
              key={index}
              style={[
                styles.statColumn,
                index !== 2 ? styles.statWithBorder : {},
              ]}>
              <View style={styles.skeletonStat} />
              <View style={[styles.skeletonStatLabel, {marginTop: 12}]} />
            </View>
          ))}
      </View>

      <View style={[styles.trekscapesContainer, {marginTop: 20}]}>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <View key={index} style={styles.trekscapeItem}>
              <View style={styles.skeletonTrekscapeImage} />
              <View style={styles.skeletonTrekscapeName} />
            </View>
          ))}
      </View>
    </>
  );

  // Render profile content
  const renderProfile = () => (
    <>
      <View style={styles.profileHeaderContainer}>
        <View style={styles.headerLeft}>
          <FastImage
            source={
              trailblazer?.profileImage
                ? {
                    uri: `${optimizeImageKitUrl(
                      trailblazer.profileImage,
                      200,
                      200,
                    )}`,
                  }
                : require('../../../public/images/dpPlaceholder.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.username}>
            {trailblazer?.firstname + ' ' + trailblazer?.lastname}
          </Text>
        </View>
        {user?.id !== trailblazer?.id && (
          <TouchableWithoutFeedback
            disabled={isFollowDisable}
            onPress={() => {
              if (isLogin) {
                handleFollowUnFollow(trailblazer?.id);
              } else {
                setIsLoginOpen(true);
              }
            }}>
            <View style={styles.followButton}>
              <Text style={styles.followButtonText}>
                {isFollowDisable ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : !isLogin ? (
                  'Follow'
                ) : trailblazer?.isFollow === false ? (
                  'Follow'
                ) : (
                  'Unfollow'
                )}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.statsContainer}>
        <View style={[styles.statColumn, styles.statWithBorder]}>
          <Text style={styles.statValue}>
            {trailblazer?.trekscapesCount || 0}
          </Text>
          <Text style={styles.statLabel}>Trekscape</Text>
        </View>
        <View style={[styles.statColumn, styles.statWithBorder]}>
          <Text style={styles.statValue}>{trailblazer?.checkIns || 0}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>{trailblazer?.followers || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      {trailblazer?.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioLabel}>Bio :</Text>
          <Text style={styles.bioText}>{trailblazer?.bio || 'N/A'}</Text>
        </View>
      )}

      {trailblazer?.trekscapes?.length > 0 && (
        <>
          <View style={styles.divider} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trekscapesScrollView}
            contentContainerStyle={styles.trekscapesContainer}>
            {trailblazer?.trekscapes?.map((item, index) => (
              <View style={styles.trekscapeItem} key={index}>
                <TouchableOpacity
                  onPress={() => {
                    navigate('TrekscapeDetail', {slug: item?.slug});
                  }}>
                  <FastImage
                    source={
                      item?.previewMedia[0]
                        ? {
                            uri: `${optimizeImageKitUrl(
                              item.previewMedia[0],
                              200,
                              200,
                            )}`,
                          }
                        : require('../../../public/images/au1.png')
                    }
                    style={styles.trekscapeImage}
                  />
                  <Text style={styles.trekscapeName} numberOfLines={1}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <Backheading heading={'Profile'} setting={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleEndReached();
          }
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleEndReached();
          }
        }}>
        {detailLoading ? renderSkeleton() : renderProfile()}
        {feedLoading && <FeedLoader />}
        <View style={feedLoading ? styles.hidden : styles.feedsContainer}>
          {feeds?.map((item, index) => (
            <FeedsContainer
              item={item}
              key={index}
              handleLike={() => handleReactionOnFeed(item?.id, index, 'Like')}
              handleDislike={() =>
                handleReactionOnFeed(item?.id, index, 'Dislike')
              }
              setCommentModal={setCommentModal}
              setPostId={setPostId}
              setFeedUsername={setFeedUsername}
              reactionDisabled={reactionDisabled}
              setIsDeleteModal={setIsDeleteModal}
              setFeedId={setFeedId}
            />
          ))}
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#e93c00" />
          </View>
        )}

        <View style={styles.endTrigger} ref={loader} />
      </ScrollView>

      {isLoginOpen && (
        <Login
          visible={isLoginOpen}
          onRequestClose={() => setIsLoginOpen(false)}
          setIsLoginOpen={setIsLoginOpen}
          moveToSignup={moveToSignUp}
        />
      )}

      {isSignUpOpen && (
        <Signup
          step1open={isSignUpOpen}
          handleCloseStep1={() => setIsSignUpOpen(false)}
          moveToLogin={moveToLogin}
        />
      )}

      {forgotPopup && (
        <ForgotPassword
          visible={forgotPopup}
          onRequestClose={() => setForgotPopup(false)}
          setForgotPopup={setForgotPopup}
          setIsLoginOpen={setIsLoginOpen}
        />
      )}

      <FeedComment
        isVisible={commentModal}
        onClose={() => setCommentModal(false)}
        postId={postId}
        feedUsername={feedUsername}
        setTrackScapeFeeds={setFeeds}
      />

      {isDeleteModal && (
        <DeleteConfirmation
          open={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          feedId={feedId}
          setFeeds={setFeeds}
          setTrailblazer={setTrailblazer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 70,
  },
  hidden: {
    display: 'none',
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2E3DD',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'Inter',
  },
  followButton: {
    height: 30,
    borderRadius: 3,
    width: 85,
    backgroundColor: '#e93c00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#FC8D6773',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 10,
    height: 84,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statWithBorder: {
    borderRightWidth: 1,
    borderRightColor: '#e93c00',
  },
  statValue: {
    fontSize: 45,
  },
  statLabel: {
    fontSize: 15,
    marginTop: 5,
    fontWeight: '300',
    fontFamily: 'Inter',
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 28,
    marginVertical: 20,
  },
  bioLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
  },
  bioText: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 12,
  },
  trekscapesScrollView: {
    marginVertical: 12,
  },
  trekscapesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    gap: 12,
  },
  trekscapeItem: {
    width: 65,
    alignItems: 'center',
  },
  trekscapeImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 1,
    borderColor: '#F2E3DD',
  },
  trekscapeName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '300',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  feedsContainer: {
    paddingHorizontal: 0,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    height: 60,
  },
  endTrigger: {
    height: 50,
  },

  // Skeleton styles
  skeletonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E1E1',
  },
  skeletonText: {
    width: 120,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E1E1E1',
    marginTop: 12,
  },
  skeletonButton: {
    width: 85,
    height: 30,
    borderRadius: 3,
    backgroundColor: '#E1E1E1',
  },
  skeletonStat: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#E1E1E1',
    alignSelf: 'center',
  },
  skeletonStatLabel: {
    width: 80,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E1E1E1',
    alignSelf: 'center',
  },
  skeletonTrekscapeImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#E1E1E1',
  },
  skeletonTrekscapeName: {
    width: 65,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E1E1E1',
    marginTop: 4,
  },
});

export default UserProfile;
