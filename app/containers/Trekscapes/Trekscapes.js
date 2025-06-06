import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../../hooks/useAuth';
import debounce from 'lodash/debounce';
import {getAuthReq, getReq} from '../../utils/apiHandlers';
import Swiper from 'react-native-swiper';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import DoubleRight from 'react-native-vector-icons/AntDesign';
import SadIcon from '../../../public/images/sadIcon.svg';
import Search from 'react-native-vector-icons/EvilIcons';
import TrekscapeTopBar from './TrekscapeTopBar';
import Constant from '../../utils/constant';
import FastImage from 'react-native-fast-image';

const Trekscapes = () => {
  const {navigate} = useNavigation();
  const route = useRoute();
  const paramSearch = route.params?.search || '';
  const [categoryId, setCategoryId] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(paramSearch || '');
  const {getTrekscape} = useAuth();
  const [treckScapeList, setTreckScapeList] = useState([]);
  const [category, setCategory] = useState([]);
  const [noData, setNoData] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const [categorySlug, setCategorySlug] = useState('cities');
  const [eventLoading, setEventLoading] = useState(true);
  const [reviewsMap, setReviewsMap] = useState({});
  const [liveEvents, setLiveEvents] = useState([]);
  const location = useSelector(state => state?.location);
  const [hasCategory, setHasCategory] = useState(false);
  const [haslive, setHasLive] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingRef = useRef(false);
  const {optimizeImageKitUrl} = Constant();
  const currentCategory = category?.find(item => item.id == categoryId);
  const paginationTimeoutRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const loadCategoryId = async () => {
      try {
        const storedCategoryId = await AsyncStorage.getItem('categoryId');
        if (storedCategoryId !== null) {
          setCategoryId(JSON.parse(storedCategoryId));
        }
      } catch (error) {
        console.log('Error loading categoryId from AsyncStorage', error);
      }
    };

    loadCategoryId();
  }, []);

  useEffect(() => {
    const saveCategoryId = async () => {
      try {
        await AsyncStorage.setItem('categoryId', JSON.stringify(categoryId));
      } catch (error) {
        console.log('Error saving categoryId to AsyncStorage', error);
      }
    };

    if (categoryId !== null) {
      saveCategoryId();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    setHasCategory(false);
    const res = await getReq('/categories');
    if (res?.status) {
      setCategory(res?.data?.data);
      setHasCategory(true);
    } else {
      console.log('fetch category error', res?.error);
    }
  };

  const fetchLiveEvents = async ({latitude, longitude}) => {
    setEventLoading(true);
    if (latitude && longitude) {
      const resLive = await getReq(
        `/trekscapes/live-events?latitude=${latitude}&longitude=${longitude}`,
      );

      if (resLive?.status && resLive?.data?.data.length > 0) {
        setLiveEvents(resLive?.data?.data);
        setHasLive(true);
      }
    }
    setEventLoading(false);
  };

  useEffect(() => {
    fetchLiveEvents(location);
  }, [location]);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (categorySlug == 'live') {
      fetchLiveEvents(location);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (hasCategory && haslive) {
      const payload = {
        createdAt: new Date().toISOString(),
        name: 'Live',
        slug: 'live',
        icon: require('../../../public/images/live.gif'),
        id: 0,
      };

      setCategory([payload, ...category]);
    }
  }, [hasCategory, haslive]);

  const fetchTrekscape = async (searchTerm, categoryId, page, location) => {
    const requestId = ++latestRequestIdRef.current;
    const isInitialTime = page === 0;

    try {
      if (isInitialTime) {
        if (isFirstRun.current) {
          setIsLoading(searchTerm ? false : true);
          isFirstRun.current = false;
        }
        setContentLoading(false);
      } else {
        setIsLoadingMore(true);
        setContentLoading(true);
      }

      const response = await getTrekscape(
        searchTerm,
        categoryId,
        page,
        location,
      );

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (response?.data) {
        if (!isInitialTime) {
          setTreckScapeList(prev => [...prev, ...response?.data]);
        } else {
          setTreckScapeList(response?.data);
          setNoData(response?.data?.length === 0);
        }
        setHasMore(response?.data?.length === 10);
      } else {
        setHasMore(false);
        isInitialTime && setNoData(true);
      }
    } catch (error) {
      console.error('Error fetching trekscape:', error);
      isInitialTime && setNoData(true);
      setHasMore(false);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        setContentLoading(false);
        setIsLoadingMore(false);
        isLoadingRef.current = false;

        if (paginationTimeoutRef.current) {
          clearTimeout(paginationTimeoutRef.current);
          paginationTimeoutRef.current = null;
        }
      }
    }
  };

  const handleSearchChange = text => {
    setSearchTerm(text);
    setPageNumber(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTreckScapeList([]);
    setPageNumber(0);
    setIsLoading(true);
  };

  const debouncedFetchTrekscape = useCallback(
    debounce(
      () => fetchTrekscape(searchTerm, categoryId, pageNumber, location),
      300, // Reduced from 500ms to 300ms
    ),
    [searchTerm, categoryId, pageNumber, location],
  );

  useEffect(() => {
    debouncedFetchTrekscape();
    return () => debouncedFetchTrekscape.cancel();
  }, [searchTerm, categoryId, pageNumber, location]);

  const handleEndReached = useCallback(() => {
    if (
      hasMore &&
      !contentLoading &&
      !isLoadingMore &&
      !isLoadingRef.current &&
      !isLoading
    ) {
      isLoadingRef.current = true;
      setContentLoading(true);
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, contentLoading, isLoadingMore, isLoading]);

  const handleScroll = useCallback(
    event => {
      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;

      if (contentSize.height <= layoutMeasurement.height) {
        return;
      }

      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      const scrollPercentage =
        contentOffset.y / (contentSize.height - layoutMeasurement.height);
      const isNearEnd = scrollPercentage >= 0.95;
      if (isCloseToBottom || isNearEnd) {
        handleEndReached();
      }
    },
    [handleEndReached],
  );

  useEffect(() => {
    setSearchTerm('');
    setTreckScapeList([]);
    setReviewsMap({});
    setEventLoading(true);
    setPageNumber(0);
    setIsLoading(true);
    setHasMore(true);
    isLoadingRef.current = false;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({x: 0, y: 0, animated: true});
    }
  }, [categoryId]);

  const fetchReviews = async slug => {
    if (reviewsMap[slug]) return;

    const res = await getAuthReq(`/trail-points/${slug}/check-ins`);
    if (res?.status) {
      setReviewsMap(prev => ({
        ...prev,
        [slug]: res?.data?.data,
      }));
      setEventLoading(false);
    } else {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    if (categorySlug === 'live') {
      liveEvents.forEach(event => {
        fetchReviews(event.slug);
      });
    }
  }, [categorySlug, liveEvents]);

  function getTimeDifference(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);

    if (now > past) {
      return {
        value: 'LIVE',
        // timeframe: 'Min Delay',
        toString: function () {
          return `${this.value}`;
        },
      };
    }

    const diffInSeconds = Math.floor((past - now) / 1000);

    let value, timeframe;

    if (diffInSeconds < 60) {
      value = diffInSeconds;
      timeframe = 'Seconds';
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        value = diffInMinutes;
        timeframe = 'Minutes';
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          value = diffInHours;
          timeframe = 'Hours';
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          value = diffInDays;
          timeframe = 'Days';
        }
      }
    }

    return {
      value,
      timeframe,
      toString: function () {
        return `${this.value}`;
      },
    };
  }

  const renderSwiperSlider = ({images, slug}) => {
    return (
      <View style={styles.swiperContainer}>
        <Swiper
          style={styles.swiper}
          showsPagination={true}
          loop={false}
          dotStyle={styles.swiperDot}
          activeDotStyle={styles.swiperActiveDot}
          removeClippedSubviews={false}
          loadMinimal={false}
          loadMinimalSize={images?.length || 1}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          threshold={20}
          autoplay={false}
          lazy={false}
          bounces={false}
          scrollEnabled={true}>
          {images?.map((image, index) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => navigate('TrekscapeDetail', {slug})}>
              <View style={styles.swiperSlide}>
                <Image
                  source={{
                    uri: optimizeImageKitUrl(image, 0, 0),
                    // priority: FastImage.priority.normal,
                  }}
                  style={styles.swiperImage}
                  // resizeMode={FastImage.resizeMode.cover}
                  resizeMode="cover"
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </Swiper>
      </View>
    );
  };

  const Skeleton = ({height, width, circle}) => {
    return (
      <View
        style={[
          styles.skeleton,
          {
            height,
            width: width || '100%',
            borderRadius: circle ? height / 2 : 8,
          },
        ]}
      />
    );
  };

  const renderFeedMenu = ({feed}) => {
    return (
      <TouchableOpacity style={styles.feedMenuButton}>
        <Text>⋯</Text>
      </TouchableOpacity>
    );
  };

  // Render loader at the bottom for better visibility
  const renderFooterLoader = () => {
    if (!isLoadingMore && !contentLoading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#e93c00" />
      </View>
    );
  };

  useEffect(() => {
    return () => {
      if (paginationTimeoutRef.current) {
        clearTimeout(paginationTimeoutRef.current);
      }
      debouncedFetchTrekscape.cancel();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBarWrapper}>
        <TrekscapeTopBar
          categoryId={String(categoryId)}
          setCategoryId={setCategoryId}
          category={category}
          setCategorySlug={setCategorySlug}
        />
      </View>

      {categorySlug !== 'live' ? (
        <ScrollView
          ref={scrollContainerRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={100}>
          {isLoading ? (
            <View style={styles.searchContainer}>
              <Skeleton height={40} width="100%" />
            </View>
          ) : (
            <>
              {(treckScapeList?.length > 0 || searchTerm) && (
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Search by ${currentCategory?.name?.trim()} Trekscapes`}
                    value={searchTerm}
                    onChangeText={handleSearchChange}
                  />
                  <TouchableOpacity
                    style={styles.searchIcon}
                    onPress={searchTerm ? handleClearSearch : null}>
                    {searchTerm ? (
                      <Text>✕</Text>
                    ) : (
                      <View style={{marginTop: -6, marginRight: -6}}>
                        <Search name="search" size={30} color="grey" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={styles.gridContainer}>
            {isLoading &&
              Array.from({length: 4}).map((_, index) => (
                <View key={index} style={styles.trekscapeCard}>
                  <Skeleton height={325} />
                  <View style={styles.cardFooter}>
                    <View>
                      <Skeleton height={17} width={100} />
                      <View style={styles.statsContainer}>
                        <Skeleton height={15} width={150} />
                        <Skeleton height={15} width={100} />
                      </View>
                    </View>
                    <Skeleton width={28} height={36} />
                  </View>
                </View>
              ))}

            {!isLoading &&
              (treckScapeList.length > 0 ? (
                treckScapeList?.map((item, index) => (
                  <View key={index} style={styles.trekscapeCard}>
                    {renderSwiperSlider({
                      images: item?.previewMedia,
                      slug: item?.slug,
                    })}
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.cardTitle}>{item?.name}</Text>
                        <View style={styles.statsContainer}>
                          <View style={styles.statItem}>
                            <Image
                              source={require('../../../public/images/trekscapes/spot-black.png')}
                              style={{width: 13, height: 13}}
                            />
                            <Text style={styles.statText}>
                              {item?.trailPoints || '0'} Trail Points
                            </Text>
                          </View>
                          <View style={styles.statItem}>
                            <Image
                              source={require('../../../public/images/trekscapes/treksters-black.png')}
                              style={{width: 13, height: 13}}
                            />
                            <Text style={styles.statText}>
                              {item?.treksters || '0'} Treksters
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={() =>
                          navigate('TrekscapeDetail', {slug: item?.slug})
                        }>
                        <DoubleRight
                          name="doubleright"
                          color="#fff"
                          size={16}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : searchTerm ? (
                <View style={styles.emptyStateContainer}>
                  <SadIcon width={60} height={60} />
                  <Text style={styles.emptyStateText}>
                    No results found for {searchTerm}. Please check the spelling
                    or try searching for another trekscape.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSearchTerm('');
                      setIsLoading(true);
                    }}>
                    <Text style={styles.emptyStateButton}>Back To Page</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                noData && (
                  <View style={styles.emptyStateContainer}>
                    <SadIcon width={60} height={60} />
                    <Text style={styles.emptyStateText}>
                      Oops! No Trekscapes available at this moment.
                    </Text>
                  </View>
                )
              ))}
          </View>

          {/* Loader at the bottom - more visible */}
          {renderFooterLoader()}

          <View style={styles.endSpace} />
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollContainerRef}
          style={styles.scrollContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {' '}
          {/* Reduced from 400 to 100 */}
          <View style={styles.liveEventsContainer}>
            {eventLoading &&
              Array.from({length: 4}).map((_, index) => (
                <View key={index} style={styles.liveEventCard}>
                  {/* Header Section */}
                  <View style={styles.liveEventHeader}>
                    <View style={styles.skeletonAvatar} />
                    <View>
                      <Skeleton width={120} height={15} />
                      <Skeleton width={100} height={10} />
                    </View>
                  </View>

                  {/* Image and Reviews Section */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[1, 2, 3].map((_, slideIndex) => (
                      <View key={slideIndex} style={styles.liveEventSlide}>
                        <Skeleton height={310} width={265} />
                        <View style={styles.liveEventOverlay}>
                          <View style={styles.liveEventOverlayHeader}>
                            <Skeleton width={50} height={12} />
                          </View>
                          <View style={styles.liveEventUser}>
                            <Skeleton circle height={50} width={50} />
                            <View>
                              <Skeleton width={100} height={14} />
                              <Skeleton width={60} height={20} />
                            </View>
                          </View>
                          <Skeleton count={2} width={'90%'} height={12} />
                          <Skeleton width={120} height={20} />
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))}

            {liveEvents &&
              liveEvents?.map((event, index) => {
                return (
                  <View
                    key={index}
                    style={[
                      styles.liveEventCard,
                      eventLoading && styles.hidden,
                    ]}>
                    <View style={styles.liveEventHeaderFull}>
                      <TouchableOpacity
                        style={styles.liveEventUserInfo}
                        onPress={() =>
                          navigate('TrekscapeDetail', {
                            slug: event?.trekscapeSlug,
                          })
                        }>
                        <View
                          style={[
                            styles.liveStatusIndicator,
                            (event?.isLive ||
                              getTimeDifference(event?.startTime).toString() ==
                                'LIVE') &&
                              styles.liveStatusActive,
                          ]}>
                          <Text style={styles.liveStatusText}>
                            {event?.isLive ||
                            getTimeDifference(event?.startTime).toString() ==
                              'LIVE'
                              ? 'LIVE'
                              : getTimeDifference(event?.startTime).toString()}
                          </Text>
                          {!event?.isLive &&
                            getTimeDifference(event?.startTime).toString() !==
                              'LIVE' && (
                              <Text style={styles.liveStatusSubtext}>
                                {getTimeDifference(event?.startTime).timeframe}
                              </Text>
                            )}
                        </View>
                        <View>
                          <Text style={styles.liveEventTitle}>
                            {event?.name}
                          </Text>
                          <View style={styles.liveEventLocation}>
                            <Image
                              source={require('../../../public/images/Pin.svg')}
                              style={styles.pinIcon}
                            />
                            <Text style={styles.distanceText}>
                              {(event?.distance / 1000).toFixed(2)} KM far from
                              your place
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      {renderFeedMenu({feed: event})}
                    </View>

                    {reviewsMap[event?.slug]?.length > 0 ? (
                      <Swiper
                        style={styles.swiper}
                        showsPagination={true}
                        loop={false}>
                        {reviewsMap[event?.slug]?.map((review, reviewIndex) => {
                          return (
                            <View key={reviewIndex} style={styles.reviewSlide}>
                              <FastImage
                                source={{
                                  uri: optimizeImageKitUrl(
                                    review.media[0],
                                    300,
                                    300,
                                  ),
                                }}
                                style={styles.reviewImage}
                              />
                              <View style={styles.reviewOverlay}>
                                <View style={styles.reviewTimestamp}>
                                  <Image
                                    source={require('../../../public/images/Pin (1).svg')}
                                    style={styles.pinIconSmall}
                                  />
                                  <Text style={styles.timestampText}>
                                    {moment(
                                      Number(review?.timestamp),
                                    ).fromNow()}
                                  </Text>
                                </View>
                                <View style={styles.reviewUserInfo}>
                                  <FastImage
                                    source={
                                      review?.user?.profileImage
                                        ? {
                                            uri: optimizeImageKitUrl(
                                              review?.user?.profileImage,
                                              200,
                                              200,
                                            ),
                                          }
                                        : require('../../../public/images/dpPlaceholder.png')
                                    }
                                    style={styles.reviewUserImage}
                                  />
                                  <View>
                                    <Text style={styles.reviewUserName}>
                                      {review?.user?.firstname}{' '}
                                      {review?.user?.lastname}
                                    </Text>
                                    <View style={styles.visitTypeBadge}>
                                      <Text style={styles.visitTypeText}>
                                        {review?.visitType == 'MustVisit'
                                          ? 'Must Go'
                                          : 'Least Go'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <Text style={styles.reviewText}>
                                  {review?.review}
                                </Text>
                                <TouchableOpacity
                                  style={styles.seeFullReviewButton}
                                  onPress={() =>
                                    navigate('Checkins', {
                                      slug: event?.slug,
                                    })
                                  }>
                                  <Text style={styles.seeFullReviewText}>
                                    See Full Review
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                      </Swiper>
                    ) : (
                      <Swiper
                        style={styles.swiper}
                        showsPagination={true}
                        loop={false}>
                        {event?.previewMedia?.map((image, imageIndex) => (
                          <View key={imageIndex} style={styles.previewSlide}>
                            <FastImage
                              source={{
                                uri: optimizeImageKitUrl(image, 0, 0),
                                priority: FastImage.priority.normal,
                              }}
                              style={styles.previewImage}
                              resizeMode={FastImage.resizeMode.cover}
                            />
                          </View>
                        ))}
                      </Swiper>
                    )}
                  </View>
                );
              })}

            {/* Loader at the bottom - more visible */}
            {renderFooterLoader()}

            <View style={styles.endSpace} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Trekscapes;

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: height * 0.95,
  },
  topBarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    height: height - 100,
  },
  searchContainer: {
    width: '70%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 40,
    paddingVertical: 10,
    borderRadius: 25,
    fontSize: 12,
  },
  searchIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{translateY: -10}],
  },
  gridContainer: {
    padding: 15,
  },
  trekscapeCard: {
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
  },
  swiperContainer: {
    height: 325,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  swiper: {
    height: 325,
  },
  swiperSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  swiperImage: {
    width: '100%',
    height: '100%',
  },
  swiperDot: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swiperActiveDot: {
    backgroundColor: '#e93c00',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  cardTitle: {
    marginVertical: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
  },
  navigateButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e93c00',
    borderRadius: 4,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    height: height - 300,
  },
  emptyStateIcon: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  emptyStateText: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  emptyStateButton: {
    textAlign: 'center',
    color: '#e93c00',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonAvatar: {
    width: 41,
    height: 41,
    borderRadius: 20.5,
    backgroundColor: '#E1E9EE',
  },
  liveEventsContainer: {
    paddingTop: 12,
  },
  liveEventCard: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-start',
    maxWidth: 393,
    width: '100%',
    overflow: 'hidden',
    paddingLeft: 25,
    marginBottom: 20,
    alignSelf: 'center',
  },
  hidden: {
    display: 'none',
  },
  liveEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  liveEventHeaderFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  liveEventUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveStatusIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 41,
    height: 41,
    borderRadius: 20.5,
    overflow: 'hidden',
    backgroundColor: '#F1C40F', // event-pending color (yellow)
  },
  liveStatusActive: {
    backgroundColor: '#E74C3C', // event-live color (red)
  },
  liveStatusText: {
    fontWeight: '500',
    fontSize: 14,
    color: 'white',
  },
  liveStatusSubtext: {
    fontWeight: '500',
    fontSize: 7,
    color: 'white',
    marginTop: -9,
  },
  liveEventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  liveEventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 8,
  },
  pinIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  distanceText: {
    fontSize: 8,
  },
  feedMenuButton: {
    padding: 8,
  },
  liveEventSlide: {
    position: 'relative',
    height: 400,
    width: 265,
    overflow: 'hidden',
    borderRadius: 15,
    marginRight: 10,
  },
  liveEventOverlay: {
    position: 'absolute',
    width: '100%',
    height: 141,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // bg-event equivalent
    padding: 8,
    borderRadius: 14,
  },
  liveEventOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  liveEventUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewSlide: {
    position: 'relative',
    height: 400,
    width: 265,
    flex: 1,
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reviewOverlay: {
    position: 'absolute',
    width: '100%',
    height: 141,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // bg-event equivalent
    padding: 8,
    borderRadius: 14,
  },
  reviewTimestamp: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pinIconSmall: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  timestampText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 8,
    textTransform: 'capitalize',
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2E3DD',
  },
  reviewUserName: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
  },
  visitTypeBadge: {
    backgroundColor: '#e93c00', // gradient-orange1 approximation
    paddingHorizontal: 4,
    borderRadius: 10,
    width: 57,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitTypeText: {
    textAlign: 'center',
    fontSize: 8,
    color: 'white',
  },
  reviewText: {
    fontWeight: '300',
    fontSize: 10,
    color: 'white',
    lineHeight: 16,
    paddingHorizontal: 4,
    paddingTop: 8,
    height: 32, // For line-clamp-2 equivalent
  },
  seeFullReviewButton: {
    alignSelf: 'flex-start',
  },
  seeFullReviewText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  previewSlide: {
    height: 400,
    width: 265,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 14,
  },
  footerLoader: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  endSpace: {
    height: 110,
  },
});
