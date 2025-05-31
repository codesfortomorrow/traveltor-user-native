import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Share as NativeShare,
  Dimensions,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn, postAuthReq} from '../../utils/apiHandlers';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import TrekscapeHeader from './TrekscapeHeader';
import TrekscapeDetailsSkeleton from './TrekscapeDetailsSkeleton'; // Import the skeleton component
import Share from '../../../public/images/mobtrekscape/share.svg';
import Location from '../../../public/images/mobtrekscape/location.svg';
import Man from '../../../public/images/mobtrekscape/man.svg';
import Award from '../../../public/images/mobtrekscape/award.svg';
import Marker from '../../../public/images/mobtrekscape/marker.svg';
import IsInterested from '../../../public/images/isInterested.svg';
import EventJoin from '../../../public/images/eventjoin.svg';
import CheckIn from '../../../public/images/mobtrekscape/checkin.svg';
import Login from '../../components/Modal/Login';
import Signup from '../../components/Signup';
import {setError} from '../../redux/Slices/errorPopup';
import Constant from '../../utils/constant';

const windowWidth = Dimensions.get('window').width;

const TrekscapeDetails = () => {
  const user = useSelector(state => state?.user);
  const navigation = useNavigation();
  const route = useRoute();
  const isLogin = isLoggedIn();
  const {slug} = route.params || {};
  const [loading, setLoading] = useState(true); // Changed to true initially
  const {getSingleTrekscapeData, followOnTrekscape} = useAuth();
  const [treckScapeDetails, setTreckScapeDetails] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isEvent, setIsEvent] = useState(false);
  const [isFollowDisable, setIsFollowDisable] = useState(false);
  const {optimizeImageKitUrl} = Constant();
  const dispatch = useDispatch();

  const fetchTreckScapeDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSingleTrekscapeData(slug, user?.id);
      if (response) {
        setTreckScapeDetails(response);
        setIsEvent(response?.isEvent || false);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    fetchTreckScapeDetail();
  }, []);

  const handleFollowUnFollow = async id => {
    if (isLogin) {
      setIsFollowDisable(true);
      try {
        const response = await followOnTrekscape(id);
        if (response?.status) {
          setTreckScapeDetails(prev => ({
            ...prev,
            isFollowed: !prev?.isFollowed,
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
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: 'Please login to cast your vote on the post.',
        }),
      );
    }
  };

  const handleRedirect = item => {
    const googleMapsUrl = `https://www.google.com/maps?q=${item.lat},${item.long}`;
    Linking.openURL(googleMapsUrl);
  };

  const handleTrailPoint = item => {
    navigation.navigate('TrailpointDetails', {
      slug: item?.slug,
    });
  };

  const moveToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const moveToSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const isCurrentTimeInRange = (startTime, endTime) => {
    const currentTime = new Date().toISOString();
    return currentTime >= startTime && currentTime <= endTime;
  };

  const formatTimeRange = (startTime, endTime) => {
    const options = {day: 'numeric', month: 'short'};
    const startDate = new Date(startTime).toLocaleDateString('en-GB', options);
    const endDate = new Date(endTime).toLocaleDateString('en-GB', options);

    return `${startDate.replace(/\s/, 'th ')} to ${endDate.replace(
      /\s/,
      'th ',
    )}`;
  };

  const notLiveTimeRange = (startTime, endTime) => {
    const optionsDate = {day: 'numeric', month: 'short', year: 'numeric'};
    const optionsTime = {hour: '2-digit', minute: '2-digit', hour12: false};

    const startDate = new Date(startTime).toLocaleDateString(
      'en-GB',
      optionsDate,
    );
    const startTimeFormatted = new Date(startTime).toLocaleTimeString(
      'en-GB',
      optionsTime,
    );
    const endTimeFormatted = new Date(endTime).toLocaleTimeString(
      'en-GB',
      optionsTime,
    );

    return `${startDate} ${startTimeFormatted} to ${endTimeFormatted}`;
  };

  const handleInterested = async trailPointId => {
    const res = await postAuthReq('/trail-points/interested/users', {
      trailPointId,
    });
    if (res?.status) {
      setTreckScapeDetails(prev => {
        if (!prev) return prev;

        if (prev.trailPoints?.id === trailPointId) {
          return {
            ...prev,
            trailPoints: {
              ...prev.trailPoints,
              isInterested: !prev.trailPoints.isInterested,
            },
          };
        }

        if (Array.isArray(prev.trailPoints)) {
          return {
            ...prev,
            trailPoints: prev.trailPoints.map(point =>
              point.id === trailPointId
                ? {...point, isInterested: !point.isInterested}
                : point,
            ),
          };
        }

        return prev;
      });
    } else {
      console.log('Error updating interest status');
    }
  };

  const onShare = async () => {
    try {
      const result = await NativeShare.share({
        message: `${process.env.CHECK_URL}/trekscape/${slug}`,
      });
      if (result.action === NativeShare.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === NativeShare.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  // Show skeleton loading when data is loading
  if (loading) {
    return (
      <View style={styles.container}>
        <TrekscapeHeader />
        <TrekscapeDetailsSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TrekscapeHeader />
      <View style={styles.mainContainer}>
        <View style={styles.relative}>
          <Image
            source={{
              uri:
                treckScapeDetails?.previewMedia &&
                treckScapeDetails?.previewMedia[0],
            }}
            style={styles.coverImage}
          />
          <View style={styles.detailsBox}>
            <View style={styles.headerRow}>
              <Text style={styles.titleText}>{treckScapeDetails?.name}</Text>
              <View style={styles.actionButtons}>
                <TouchableWithoutFeedback
                  disabled={isFollowDisable}
                  onPress={() => {
                    if (isLogin) {
                      handleFollowUnFollow(treckScapeDetails?.id);
                    } else {
                      setIsLoginOpen(true);
                    }
                  }}>
                  <View style={styles.followButton}>
                    {isFollowDisable ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : !isLoggedIn() ? (
                      <Text style={styles.followButtonText}>Follow</Text>
                    ) : treckScapeDetails?.isFollowed === false ? (
                      <Text style={styles.followButtonText}>Follow</Text>
                    ) : (
                      <Text style={styles.followButtonText}>Unfollow</Text>
                    )}
                  </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity onPress={onShare}>
                  <Share width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Location width={15} height={15} />
                <Text style={styles.statText}>
                  {treckScapeDetails?.totalTrailPoints || 0} Trail Point
                </Text>
              </View>
              <View style={styles.statItem}>
                <Man width={15} height={15} />
                <Text style={styles.statText}>
                  {treckScapeDetails?.treksters || '0'} Treksters
                </Text>
              </View>
              <View style={styles.statItem}>
                <Award width={15} height={15} />
                <Text style={styles.statText}>
                  {treckScapeDetails?.level?.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.trailPointsContainer}
          showsVerticalScrollIndicator={false}>
          {treckScapeDetails?.trailPoints?.length > 0 &&
            treckScapeDetails?.trailPoints?.map((item, index) => (
              <View key={index} style={styles.trailPointCard}>
                <TouchableOpacity onPress={() => handleTrailPoint(item)}>
                  <Image
                    style={styles.trailPointImage}
                    source={{
                      uri:
                        item?.previewMedia &&
                        optimizeImageKitUrl(item?.previewMedia[0], 90, 94, {
                          quality: 100,
                        }),
                    }}
                  />
                </TouchableOpacity>
                <View style={styles.trailPointContent}>
                  <View>
                    <TouchableOpacity onPress={() => handleTrailPoint(item)}>
                      <Text style={styles.trailPointTitle}>{item?.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statItem, styles.mb12]}
                      onPress={() => handleRedirect(item)}>
                      <Marker width={20} height={20} />
                      <Text style={styles.linkText}>See on Map</Text>
                    </TouchableOpacity>
                    {isEvent ? (
                      <TouchableOpacity style={[styles.statItem, styles.mb12]}>
                        <Man width={20} height={20} />
                        <Text style={styles.linkText}>
                          {isCurrentTimeInRange(
                            item?.trailPointMeta?.startTime,
                            item?.trailPointMeta?.endTime,
                          )
                            ? `LIVE | ${item?.reviews || 0} Attending`
                            : notLiveTimeRange(
                                item?.trailPointMeta?.startTime,
                                item?.trailPointMeta?.endTime,
                              )}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.statItem, styles.mb12]}
                        onPress={() =>
                          navigation.navigate('TrailpointReview', {
                            slug: item?.slug,
                          })
                        }>
                        <Man width={20} height={20} />
                        <Text style={styles.linkText}>
                          {item?.reviews || '0'} Reviews
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isEvent ? (
                    <>
                      {!isCurrentTimeInRange(
                        item?.trailPointMeta?.startTime,
                        item?.trailPointMeta?.endTime,
                      ) ? (
                        <View style={styles.actionContainer}>
                          <TouchableOpacity
                            onPress={() => handleInterested(item?.id)}>
                            {item?.isInterested ? (
                              <IsInterested width={28} height={28} />
                            ) : (
                              <EventJoin width={28} height={28} />
                            )}
                          </TouchableOpacity>
                          <Text style={styles.actionText}>
                            Tap to Join the event
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.actionContainer}
                          onPress={() => {
                            if (isLogin) {
                              navigation.navigate('TrailpointCheckIn', {
                                trailpointId: item?.slug,
                                id: item?.id,
                              });
                            } else {
                              setIsLoginOpen(true);
                            }
                          }}>
                          <CheckIn width={28} height={28} />
                          <Text style={styles.actionText}>
                            {formatTimeRange(
                              item?.trailPointMeta?.startTime,
                              item?.trailPointMeta?.endTime,
                            )}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionContainer}
                      onPress={() => {
                        if (isLogin) {
                          navigation.navigate('TrailpointCheckIn', {
                            id: item?.slug,
                            trailpointId: item?.id,
                          });
                        } else {
                          setIsLoginOpen(true);
                        }
                      }}>
                      <CheckIn width={28} height={28} />
                      <Text style={styles.actionText}>Tap to Check In</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
        </ScrollView>
      </View>
      {isLoginOpen && (
        <Login
          open={isLoginOpen}
          handleClose={() => setIsLoginOpen(false)}
          setOpen={setIsLoginOpen}
          moveToSignUp={moveToSignUp}
        />
      )}
      {isSignUpOpen && (
        <Signup
          step1open={isSignUpOpen}
          handleCloseStep1={() => setIsSignUpOpen(false)}
          setStep1open={setIsSignUpOpen}
          moveToLogin={moveToLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    minHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  relative: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 225,
    resizeMode: 'cover',
  },
  detailsBox: {
    position: 'absolute',
    bottom: -24,
    left: '2%',
    right: '2%',
    width: '96%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    marginVertical: 4,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Jakarta',
    width: '70%',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    backgroundColor: '#E93C00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 75,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Jakarta',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  iconTiny: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  iconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  iconMedium: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  trailPointsContainer: {
    marginTop: 40,
    marginHorizontal: 10,
    marginBottom: 70,
  },
  trailPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FCF2EE59',
    borderRadius: 15,
    padding: 8,
    marginBottom: 16,
  },
  trailPointImage: {
    width: 90,
    height: 94,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  trailPointContent: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  trailPointTitle: {
    fontWeight: '500',
    fontFamily: 'Jakarta',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  mb12: {
    marginBottom: 12,
  },
  linkText: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    top: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionText: {
    fontFamily: 'Inter',
    fontSize: 8,
    textAlign: 'center',
    color: '#6F6764',
  },
});

export default TrekscapeDetails;
