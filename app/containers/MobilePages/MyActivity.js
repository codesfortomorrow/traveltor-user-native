import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Backheading from '../../components/Mobile/Backheading';
import {getAuthReq} from '../../utils/apiHandlers';
import moment from 'moment';
import Calender from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import Constant from '../../utils/constant';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const DashedBorder = () => {
  const numberOfDashes = Math.ceil(screenHeight / 20);

  return (
    <View style={styles.dashedBorder}>
      {Array.from({length: numberOfDashes}).map((_, index) => (
        <View key={index} style={styles.dashedLine} />
      ))}
    </View>
  );
};

const MyActivity = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [contentLoader, setContentLoader] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigation = useNavigation();
  const {optimizeImageKitUrl} = Constant();

  const fetchEvents = useCallback(
    async (page, isRefresh = false) => {
      // Prevent multiple simultaneous requests
      if (isLoadingMore && !isRefresh) return;

      try {
        // Set appropriate loading states
        if (page === 0 && !isRefresh) {
          setIsLoading(true);
        } else if (page > 0 && !isRefresh) {
          setIsLoadingMore(true);
          setContentLoader(true);
        }

        const res = await getAuthReq(`/activities?skip=${page * 20}&take=20`);

        if (res?.status) {
          const newData = res?.data?.data || [];

          if (isRefresh || page === 0) {
            setEvents(newData);
          } else {
            // Append new data to existing events
            setEvents(prevEvents => [...prevEvents, ...newData]);
          }

          // Check if there are more items to load
          setHasMore(newData.length === 20);
        } else {
          console.log(res?.error, 'fetch events error');
          setHasMore(false);
        }
      } catch (error) {
        console.log(error, 'fetch events error');
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setContentLoader(false);
        setIsLoadingMore(false);
      }
    },
    [isLoadingMore],
  );

  // Initial load
  useEffect(() => {
    fetchEvents(0);
  }, []);

  // Load more data when pageNumber changes (but not on initial load)
  useEffect(() => {
    if (pageNumber > 0) {
      fetchEvents(pageNumber);
    }
  }, [pageNumber, fetchEvents]);

  const handleLoadMore = useCallback(() => {
    // Only load more if we have more data and aren't already loading
    if (hasMore && !isLoadingMore && !isLoading) {
      setPageNumber(prevPage => prevPage + 1);
    }
  }, [hasMore, isLoadingMore, isLoading]);

  const handleRefresh = useCallback(() => {
    setPageNumber(0);
    setHasMore(true);
    fetchEvents(0, true);
  }, [fetchEvents]);

  const handleExploreMemory = eventId => {
    navigation.navigate('SingleCheckIn', {feedId: eventId});
  };

  const renderSkeletonItem = index => (
    <View key={index} style={styles.skeletonContainer}>
      <View
        style={[
          styles.skeletonAvatarContainer,
          index % 2 === 0 && styles.alignRight,
        ]}>
        <View style={styles.skeletonAvatar} />
      </View>
      <View
        style={[
          styles.skeletonBubbleContainer,
          index % 2 !== 0 ? styles.alignLeft : styles.alignRight,
        ]}>
        <View style={[styles.skeletonBubble, {width: 125}]} />
      </View>
    </View>
  );

  const renderEventItem = (event, index) => (
    <View key={`${event.id}-${index}`} style={styles.eventContainer}>
      <View
        style={[styles.mediaContainer, index % 2 === 0 && styles.alignRight]}>
        {event?.media?.map((image, imgIndex) => (
          <Image
            key={imgIndex}
            source={{uri: optimizeImageKitUrl(image, 100, 100)}}
            style={[styles.mediaImage, {marginLeft: imgIndex > 0 ? -24 : 0}]}
          />
        ))}
      </View>

      <View
        style={[
          styles.bubbleContainer,
          index % 2 !== 0 ? styles.alignLeft : styles.alignRight,
        ]}>
        <View
          style={[
            styles.bubble,
            index % 2 === 0 ? styles.bubbleRight : styles.bubbleLeft,
            {maxWidth: 125},
          ]}>
          <View
            style={[
              styles.bubbleIndicator,
              index % 2 !== 0 ? styles.indicatorLeft : styles.indicatorRight,
            ]}
          />

          <View
            style={[
              styles.bubbleContent,
              index % 2 === 0 ? styles.contentRight : styles.contentLeft,
            ]}>
            <View style={styles.dateContainer}>
              <Text>
                <Calender name="calendar" size={9} color="#fff" />
              </Text>
              <Text style={styles.dateText}>
                {moment(event?.createdAt).format('lll')}
              </Text>
            </View>

            <Text
              style={[
                styles.checkInText,
                {textAlign: index % 2 === 0 ? 'right' : 'left'},
              ]}>
              {`Check In At ${
                event?.trekscape?.name || event?.trailPoint?.name
              }`}
            </Text>

            <TouchableOpacity onPress={() => handleExploreMemory(event?.id)}>
              <Text style={styles.exploreText}>Explore the memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const handleScroll = useCallback(
    ({nativeEvent}) => {
      const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
      const paddingToBottom = 50; // Increased threshold for better UX

      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        handleLoadMore();
      }
    },
    [handleLoadMore],
  );

  return (
    <View style={styles.container}>
      <Backheading heading="My Activity" />

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={200} // Reduced throttle for better responsiveness
          showsVerticalScrollIndicator={true}>
          <View style={[styles.eventsContainer, {width: '94%'}]}>
            {isLoading ? (
              <>
                {Array.from({length: 14}).map((_, index) =>
                  renderSkeletonItem(index),
                )}
              </>
            ) : (
              <>
                {events?.map((event, index) => renderEventItem(event, index))}
                {contentLoader && (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#E93c00" />
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Dashed border line */}
        <DashedBorder />
        <View style={styles.LineBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#505467',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 80,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 72, // 4.5rem equivalent
    paddingBottom: 20,
  },
  eventsContainer: {
    alignSelf: 'center',
  },
  eventContainer: {
    marginBottom: 8,
  },
  skeletonContainer: {
    marginBottom: 8,
  },
  mediaContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: -48,
    marginBottom: 8,
  },
  skeletonAvatarContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: -48,
    marginBottom: 8,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  mediaImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#505467',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'silver',
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -8,
  },
  skeletonBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -8,
  },
  bubble: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bubbleRight: {
    backgroundColor: '#E93c00',
    minHeight: 59,
    height: 'auto',
  },
  bubbleLeft: {
    backgroundColor: '#E93c00',
    minHeight: 59,
    height: 'auto',
  },
  skeletonBubble: {
    height: 59,
    backgroundColor: 'silver',
    borderRadius: 5,
  },
  bubbleIndicator: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    backgroundColor: '#E93c00',
    borderRadius: 8,
    marginTop: -8,
  },
  indicatorLeft: {
    right: -8,
  },
  indicatorRight: {
    left: -8,
  },
  bubbleContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center',
  },
  contentRight: {
    alignItems: 'flex-end',
  },
  contentLeft: {
    alignItems: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: -6,
  },
  dateText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  checkInText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Inter',
    fontWeight: 'normal',
    lineHeight: 14,
    marginBottom: -6,
  },
  exploreText: {
    fontSize: 8,
    color: 'white',
    textDecorationLine: 'underline',
    fontWeight: '500',
    marginBottom: -6,
    paddingBottom: 8,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Inter',
  },
  endContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  endText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter',
    opacity: 0.7,
  },
  LineBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '45%',
    width: 40,
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#fff',
    borderRightColor: '#fff',
    borderStyle: 'solid',
  },
  dashedBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 9,
    backgroundColor: 'transparent',
  },
  dashedLine: {
    width: 1,
    height: 80,
    backgroundColor: 'white',
    marginBottom: 80, // 20px total - 11px line = 9px gap
  },
});

export default MyActivity;
