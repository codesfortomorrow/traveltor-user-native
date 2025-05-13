import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Backheading from '../../components/Mobile/Backheading';
import {getAuthReq} from '../../utils/apiHandlers';
import {useNavigation} from '@react-navigation/native';
import Calender from 'react-native-vector-icons/AntDesign';

const {width} = Dimensions.get('window');

const MyActivity = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const matches = width >= 380;
  const loader = useRef(null);
  const navigation = useNavigation();
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [contentLoader, setContentLoader] = useState(false);

  const fetchEvents = async page => {
    !pageNumber && setIsLoading(true);
    setContentLoader(true);
    const res = await getAuthReq(`/activities?skip=${page * 20}&take=20`);
    if (res?.status) {
      setEvents(prev => [...prev, ...res?.data?.data]);
      setHasMore(res?.data?.data?.length === 20);
    } else {
      console.log(res?.error, 'fetch events error');
    }
    setIsLoading(false);
    setContentLoader(false);
  };

  useEffect(() => {
    fetchEvents(pageNumber);
  }, [pageNumber]);

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
    if (!contentLoader && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  }, [contentLoader, hasMore, pageNumber]);

  // Skeleton replacement for React Native
  const Skeleton = () => (
    <View style={styles.skeletonContainer}>
      {/* <ActivityIndicator size="large" color="#FFFFFF" /> */}
    </View>
  );

  // CustomImage replacement for React Native
  const CustomImage = ({src, alt, style, onLoad}) => (
    <Image source={{uri: src}} style={style} onLoad={onLoad} alt={alt} />
  );

  const navigateToCheckIn = eventId => {
    navigation.navigate('CheckIn', {eventId});
  };

  return (
    <View style={styles.container}>
      <Backheading heading={'My Activity'} />
      <View style={[styles.contentContainer, {width: matches ? '90%' : '94%'}]}>
        {isLoading && (
          <View style={styles.skeletonWrapper}>
            {[...Array(14)].map((_, index) => (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.skeletonImageContainer,
                    {alignSelf: index % 2 === 0 ? 'flex-end' : 'flex-start'},
                  ]}>
                  <Skeleton />
                </View>
                <View
                  style={[
                    styles.skeletonTextContainer,
                    {alignSelf: index % 2 !== 0 ? 'flex-start' : 'flex-end'},
                  ]}>
                  <View
                    style={[styles.skeletonText, {width: matches ? 140 : 125}]}
                  />
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        <ScrollView
          style={
            ([
              {width: matches ? '90%' : '94%'},
              isLoading ? styles.hidden : styles.visible,
            ],
            {flex: 1})
          }
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
          {events &&
            events?.map((event, index) => (
              <View key={index}>
                <View
                  style={[
                    styles.imageGroup,
                    {
                      justifyContent:
                        index % 2 === 0 ? 'flex-end' : 'flex-start',
                      marginTop: -48,
                    },
                  ]}>
                  {event?.media?.map((image, imgIndex) => (
                    <CustomImage
                      key={imgIndex}
                      src={`${image}?tr=w-200,h-200,q-100`}
                      alt={`Image ${imgIndex + 1}`}
                      style={styles.roundImage}
                      onLoad={() => setIsLoading(false)}
                    />
                  ))}
                </View>
                <View
                  style={[
                    styles.eventContainer,
                    {
                      alignSelf: index % 2 !== 0 ? 'flex-start' : 'flex-end',
                    },
                  ]}>
                  <View
                    style={[
                      styles.eventDetails,
                      {
                        backgroundColor:
                          index % 2 === 0
                            ? 'linear-gradient(to right, #FF6F3E, #E93C00)'
                            : 'linear-gradient(to left, #E93C00, #FF6F3E)',
                        maxWidth: matches ? 140 : 125,
                      },
                    ]}>
                    <View style={styles.eventMarker(index % 2 !== 0)} />
                    <View style={styles.eventTextContainer}>
                      <View
                        style={[
                          styles.textAlignment,
                          {
                            alignItems:
                              index % 2 === 0 ? 'flex-end' : 'flex-start',
                          },
                        ]}>
                        <Text style={styles.dateText}>
                          <Calender size={10} color="#000" />
                          {moment(event?.createdAt).format('lll')}
                        </Text>
                        <Text style={styles.locationText}>
                          {`Check In At ${
                            event?.trekscape?.name || event?.trailPoint?.name
                          }`}
                        </Text>
                        <TouchableOpacity
                          onPress={() => navigateToCheckIn(event?.id)}
                          style={styles.exploreLink}>
                          <Text style={styles.exploreLinkText}>
                            Explore the memory
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}

          {contentLoader && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </ScrollView>

        <View style={styles.verticalLine}>
          <View style={styles.stripeBorder} />
        </View>

        <View ref={loader} style={styles.loaderRef} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#505467',
    minHeight: '100%',
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 80,
  },
  skeletonWrapper: {
    width: '90%',
    marginTop: 72,
  },
  skeletonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonImageContainer: {
    marginBottom: 8,
    marginTop: -48,
  },
  skeletonTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: -16,
  },
  skeletonText: {
    height: 59,
    backgroundColor: '#CCCCCC',
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
  },
  imageGroup: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: -24,
  },
  roundImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    objectFit: 'cover',
    backgroundColor: '#505467',
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: -16,
  },
  eventDetails: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 2,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventMarker: isLeft => ({
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E93c00',
    transform: [{translateY: -8}],
    [isLeft ? 'right' : 'left']: -8,
  }),
  eventTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textAlignment: {
    flex: 1,
  },
  dateText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: -6,
    color: 'white',
  },
  locationText: {
    fontSize: 12,
    fontWeight: 'normal',
    marginBottom: -6,
    color: 'white',
  },
  exploreLink: {
    marginBottom: -6,
  },
  exploreLinkText: {
    color: 'white',
    fontSize: 8,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 16,
    position: 'absolute',
    zIndex: 50,
    paddingBottom: 65,
  },
  verticalLine: {
    width: 36,
    height: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCCCCC',
  },
  stripeBorder: {
    // Add stripe border styling if needed
  },
  loaderRef: {
    height: 100,
  },
});

export default MyActivity;
