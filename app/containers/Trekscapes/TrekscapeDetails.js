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
  Dimensions,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {isLoggedIn, postAuthReq} from '../../utils/apiHandlers';
import {useSelector} from 'react-redux';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useNavigation, useRoute} from '@react-navigation/native';
import TrekscapeHeader from './TrekscapeHeader';
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
import Social from '../../components/Modal/SocialShare';

const TrekscapeDetails = () => {
  const user = useSelector(state => state?.user);
  const navigation = useNavigation();
  const route = useRoute();
  const isLogin = isLoggedIn();
  const {slug} = route.params || {};
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {getSingleTrekscapeData, followOnTrekscape} = useAuth();
  const [treckScapeDetails, setTreckScapeDetails] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isEvent, setIsEvent] = useState(false);
  const [isFollowDisable, setIsFollowDisable] = useState(false);

  const fetchTreckScapeDetail = useCallback(async () => {
    try {
      // setLoading(true);
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
          if (response?.data?.follow) {
            // toast.success('Successfully Follow');
            // Use react-native-toast-message or similar
          } else {
            // toast.success('Successfully UnFollow');
          }
          setTreckScapeDetails(prev => ({
            ...prev,
            isFollowed: !prev?.isFollowed,
          }));
        }
      } catch (err) {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: err || 'Something went wrong',
        //   }),
        // );
      } finally {
        setIsFollowDisable(false);
      }
    } else {
      //   dispatch(
      //     setError({
      //       open: true,
      //       custom_message: 'Please login to cast your vote on the post.',
      //     }),
      //   );
    }
  };

  const handleRedirect = item => {
    const googleMapsUrl = `https://www.google.com/maps?q=${item.lat},${item.long}`;
    Linking.openURL(googleMapsUrl);
  };

  const handleTrailPoint = item => {
    navigation.navigate('TrailPoint', {
      slug: item?.slug,
      previewMedia: item?.previewMedia,
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

  return (
    <View style={styles.container}>
      <TrekscapeHeader />
      <View style={styles.mainContainer}>
        <View style={styles.relative}>
          {loading ? (
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item width={393} height={225} />
            </SkeletonPlaceholder>
          ) : (
            <Image
              source={{
                uri:
                  treckScapeDetails?.previewMedia &&
                  treckScapeDetails?.previewMedia[0],
              }}
              style={styles.coverImage}
            />
          )}
          <View style={styles.detailsBox}>
            {loading ? (
              <>
                <View style={styles.headerRow}>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item height={18} width={60} />
                  </SkeletonPlaceholder>
                  <View style={styles.actionButtons}>
                    <SkeletonPlaceholder>
                      <SkeletonPlaceholder.Item
                        height={32}
                        width={61}
                        borderRadius={8}
                      />
                    </SkeletonPlaceholder>
                    <SkeletonPlaceholder>
                      <SkeletonPlaceholder.Item
                        height={32}
                        width={32}
                        borderRadius={8}
                      />
                    </SkeletonPlaceholder>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={100} height={20} />
                  </SkeletonPlaceholder>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={100} height={20} />
                  </SkeletonPlaceholder>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={70} height={20} />
                  </SkeletonPlaceholder>
                </View>
              </>
            ) : (
              <>
                <View style={styles.headerRow}>
                  <Text style={styles.titleText}>
                    {treckScapeDetails?.name}
                  </Text>
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
                    <TouchableOpacity onPress={() => setIsOpen(true)}>
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
              </>
            )}
          </View>
        </View>
        <ScrollView
          style={styles.trailPointsContainer}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <>
              {Array.from({length: 4}).map((_, index) => (
                <View key={index} style={styles.trailPointCard}>
                  <View>
                    <SkeletonPlaceholder>
                      <SkeletonPlaceholder.Item
                        width={90}
                        height={94}
                        borderRadius={10}
                      />
                    </SkeletonPlaceholder>
                  </View>
                  <View style={styles.trailPointContent}>
                    <View>
                      <SkeletonPlaceholder>
                        <SkeletonPlaceholder.Item
                          width={100}
                          height={20}
                          marginBottom={12}
                        />
                      </SkeletonPlaceholder>
                      <View style={[styles.statItem, styles.mb12]}>
                        <SkeletonPlaceholder>
                          <SkeletonPlaceholder.Item width={20} height={20} />
                        </SkeletonPlaceholder>
                        <SkeletonPlaceholder>
                          <SkeletonPlaceholder.Item width={80} height={15} />
                        </SkeletonPlaceholder>
                      </View>
                      <View style={[styles.statItem, styles.mb12]}>
                        <SkeletonPlaceholder>
                          <SkeletonPlaceholder.Item width={20} height={20} />
                        </SkeletonPlaceholder>
                        <SkeletonPlaceholder>
                          <SkeletonPlaceholder.Item width={80} height={15} />
                        </SkeletonPlaceholder>
                      </View>
                    </View>
                    <View style={styles.actionContainer}>
                      <SkeletonPlaceholder>
                        <SkeletonPlaceholder.Item
                          width={28}
                          height={28}
                          borderRadius={8}
                        />
                      </SkeletonPlaceholder>
                      <SkeletonPlaceholder>
                        <SkeletonPlaceholder.Item width={50} height={10} />
                      </SkeletonPlaceholder>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              {treckScapeDetails?.trailPoints?.length > 0 &&
                treckScapeDetails?.trailPoints?.map((item, index) => (
                  <View key={index} style={styles.trailPointCard}>
                    <TouchableOpacity onPress={() => handleTrailPoint(item)}>
                      <Image
                        style={styles.trailPointImage}
                        source={{
                          uri: item?.previewMedia && item?.previewMedia[0],
                        }}
                      />
                    </TouchableOpacity>
                    <View style={styles.trailPointContent}>
                      <View>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('TrailPoint', {
                              slug: item?.slug,
                              state: item?.previewMedia,
                            })
                          }>
                          <Text style={styles.trailPointTitle}>
                            {item?.name}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statItem, styles.mb12]}
                          onPress={() => handleRedirect(item)}>
                          <Marker width={20} height={20} />
                          <Text style={styles.linkText}>See on Map</Text>
                        </TouchableOpacity>
                        {isEvent ? (
                          <TouchableOpacity
                            style={[styles.statItem, styles.mb12]}>
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
                              navigation.navigate('Checkins', {
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
                                  navigation.navigate('CreateCheckin', {
                                    slug: item?.slug,
                                    ...item,
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
                              navigation.navigate('CreateCheckin', {
                                slug: item?.slug,
                                ...item,
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
            </>
          )}
        </ScrollView>
      </View>

      {/* Replace these with appropriate React Native modals */}
      {/* <Social
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        setOpen={setIsOpen}
        code={window.location.href}
        title={'Join the Journey with Trekscape'}
      /> */}
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
    paddingBottom: 100,
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
