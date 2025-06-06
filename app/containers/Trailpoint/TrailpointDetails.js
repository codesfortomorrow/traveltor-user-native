import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Dimensions,
  FlatList,
  Share as NativeShare,
  Alert,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {setError} from '../../redux/Slices/errorPopup';
import {postAuthReq} from '../../utils/apiHandlers';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import HTML from 'react-native-render-html';
import TrialPointSlider from './TrailpointSlider';
import Backheading from '../../components/Mobile/Backheading';
import WhiteMarker from '../../../public/images/mobtrekscape/trialpoints/whitemarker.svg';
import CheckIn from '../../../public/images/mobtrekscape/trialpoints/checkin.svg';
import Reviews from '../../../public/images/mobtrekscape/trialpoints/reviews.svg';
import Share from '../../../public/images/mobtrekscape/trialpoints/share.svg';
import {AuthContext} from '../../context/AuthContext';

const TrailpointDetails = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [trailPoints, setTrailPoints] = useState({});
  const route = useRoute();
  const {slug} = route.params;
  const {getTrailPointDetails, getTrailPointFeeds} = useAuth();
  const {isLoggedIn} = useContext(AuthContext);
  const [trekScapeReview, setTrekScapeReview] = useState([]);
  const user = useSelector(state => state?.user);

  const fetchTrailpointDetail = useCallback(
    async userId => {
      try {
        const response = await getTrailPointDetails(slug, userId);
        if (response) {
          setTrailPoints(response);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    },
    [slug],
  );

  const fetchTreckScapeFeeds = useCallback(
    async (slug, userId) => {
      setIsLoading(true);
      try {
        const response = await getTrailPointFeeds(slug, userId);
        if (response) {
          setTrekScapeReview(response?.data);
        }
      } catch (error) {
        return error;
      } finally {
        setIsLoading(false);
      }
    },
    [slug, user?.id],
  );

  useEffect(() => {
    if (slug) {
      fetchTreckScapeFeeds(slug, user?.id);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    if (user) {
      fetchTrailpointDetail(user?.id);
    }
  }, [user]);

  const handleRedirect = item => {
    const googleMapsUrl = `https://www.google.com/maps?q=${item.lat},${item.long}`;
    Linking.openURL(googleMapsUrl);
  };

  const handleInterested = async trailPointId => {
    const res = await postAuthReq('/trail-points/interested/users', {
      trailPointId,
    });
    if (res?.status) {
      setTrailPoints(prev => {
        if (prev?.id == trailPointId) {
          return {
            ...prev,
            isInterested: !prev.isInterested,
          };
        }

        return prev;
      });
    } else {
      console.log('Error updating interest status');
    }
  };

  const isCurrentTimeInRange = (startTime, endTime) => {
    const currentTime = new Date().toISOString();

    if (currentTime <= startTime && currentTime <= endTime) return true;
    if (currentTime >= startTime && currentTime <= endTime) return true;

    return false;
  };

  // Skeleton component for loading state
  const SkeletonView = ({width, height, circle = false, style}) => {
    return (
      <View
        style={[
          styles.skeleton,
          {width, height, borderRadius: circle ? height / 2 : 14},
          style,
        ]}
      />
    );
  };

  const onShare = async () => {
    try {
      const result = await NativeShare.share({
        message: `${process.env.CHECK_URL}/trailpoint/${slug}`,
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

  return (
    <View style={styles.container}>
      <Backheading
        heading={trailPoints?.name}
        CheckInPoint={true}
        trailPoints={trailPoints}
        loading={isLoading}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.gradientOrangeButton]}
              onPress={() => handleRedirect(trailPoints)}>
              <WhiteMarker width={18} height={18} />
              <Text style={styles.whiteButtonText}>See On Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('TrailpointCheckIn', {
                    id: trailPoints?.slug,
                    trailpointId: trailPoints?.id,
                  });
                } else {
                  dispatch(
                    setError({
                      open: true,
                      custom_message:
                        'Please login first to check in this place',
                    }),
                  );
                }
              }}>
              <CheckIn width={18} height={18} />
              <Text style={styles.primaryButtonText}>Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.gradientOrangeButton]}
              onPress={() =>
                navigation.navigate('TrailpointReview', {
                  slug: trailPoints?.slug,
                })
              }>
              <Reviews width={18} height={18} />
              <Text style={styles.whiteButtonText}>Reviews</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryActionContainer}>
            {trailPoints?.trailPointMeta &&
              isCurrentTimeInRange(
                trailPoints?.trailPointMeta?.startTime,
                trailPoints?.trailPointMeta?.endTime,
              ) && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    trailPoints?.isInterested
                      ? styles.gradientOrangeButton
                      : {},
                  ]}
                  onPress={() => handleInterested(trailPoints?.id)}>
                  <Image
                    source={
                      trailPoints?.isInterested
                        ? require('../../../public/images/heartwhite-30x30.png')
                        : require('../../../public/images/heartred-30x30.png')
                    }
                    style={[styles.actionIcon, {width: 16, height: 16}]}
                  />
                  <Text
                    style={
                      trailPoints?.isInterested
                        ? styles.whiteButtonText
                        : styles.primaryButtonText
                    }>
                    Interested
                  </Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Share width={18} height={18} />
              <Text style={styles.primaryButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.skeletonContainer}>
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={Array.from({length: 5})}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({index}) => (
                <View style={styles.swiperSlide}>
                  <SkeletonView height={350} style={styles.skeletonFull} />
                  <View style={styles.skeletonBottomSection}>
                    <View style={styles.skeletonTopRight}>
                      <SkeletonView width={14} height={14} circle />
                      <SkeletonView width={50} height={10} />
                    </View>
                    <View style={styles.skeletonProfile}>
                      <SkeletonView width={50} height={50} circle />
                      <View>
                        <SkeletonView width={80} height={14} />
                        <SkeletonView
                          width={57}
                          height={14}
                          style={styles.skeletonRounded}
                        />
                      </View>
                    </View>
                    <SkeletonView
                      width={'90%'}
                      height={10}
                      style={styles.skeletonMarginTop}
                    />
                    <SkeletonView
                      width={'80%'}
                      height={10}
                      style={styles.skeletonMarginTopSmall}
                    />
                  </View>
                </View>
              )}
            />
          </View>
        )}

        <TrialPointSlider
          check_ins={trekScapeReview}
          isLoading={isLoading}
          trailpointImage={trailPoints?.previewMedia}
        />

        {isLoading ? (
          <View style={styles.descContainer}>
            <SkeletonView height={20} style={styles.skeletonFull} />
            <SkeletonView
              height={20}
              style={[styles.skeletonFull, styles.skeletonMarginTopSmall]}
            />
            <SkeletonView
              height={20}
              style={[styles.skeletonFull, styles.skeletonMarginTopSmall]}
            />
            <SkeletonView
              height={20}
              style={[styles.skeletonFull, styles.skeletonMarginTopSmall]}
            />
          </View>
        ) : (
          <View style={[styles.descContainer, isLoading ? styles.hidden : {}]}>
            {trailPoints?.description ? (
              <HTML
                source={{html: trailPoints?.description}}
                contentWidth={Dimensions.get('window').width - 40}
                tagsStyles={{
                  body: styles.htmlContent,
                }}
              />
            ) : (
              <Text style={styles.descText}>No description available</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    minHeight: '95%',
  },
  scrollView: {
    height: '100%',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'Inter',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  secondaryActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    fontFamily: 'Inter',
    paddingHorizontal: 16,
    marginTop: 5,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: 'white',
  },
  gradientOrangeButton: {
    backgroundColor: '#e93c00',
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  whiteButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  primaryButtonText: {
    color: '#e93c00',
    fontWeight: '500',
    fontSize: 12,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    minHeight: 350,
  },
  swiper: {
    height: 350,
  },
  swiperSlide: {
    position: 'relative',
    height: '100%',
    width: Dimensions.get('window').width * 0.65,
    paddingRight: 20,
  },
  skeletonFull: {
    width: '100%',
  },
  skeletonBottomSection: {
    position: 'absolute',
    width: '100%',
    height: '34%',
    bottom: 0,
    backgroundColor: 'rgba(255, 244, 240, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  skeletonTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  skeletonProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonRounded: {
    borderRadius: 10,
    marginTop: 6,
  },
  skeletonMarginTop: {
    marginTop: 8,
  },
  skeletonMarginTopSmall: {
    marginTop: 4,
  },
  descContainer: {
    backgroundColor: '#FFF4F0',
    paddingHorizontal: 20,
    paddingTop: 12,
    marginTop: 12,
    paddingBottom: 60,
  },
  descText: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 12,
  },
  htmlContent: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 12,
  },
  hidden: {
    display: 'none',
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 14,
  },
});

export default TrailpointDetails;
