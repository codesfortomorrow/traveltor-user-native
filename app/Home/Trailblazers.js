import React, {useEffect, useRef, useState} from 'react';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Swiper from 'react-native-swiper';
import RightIcon from 'react-native-vector-icons/AntDesign';

const Trailblazers = () => {
  const [trail, setTrail] = useState([
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      profileImage: null,
      trekscapesCount: 5,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isFirstRender = useRef(true);

  // const fetchTreckScapeFeeds = useCallback(
  //   async (searchTerm, isLoad) => {
  //     try {
  //       isLoad && setIsLoading(true);
  //       const response = await getTrailblazer(searchTerm);
  //       if (response) {
  //         setTrail(response?.data);
  //       }
  //     } catch (error) {
  //       return error;
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [],
  // );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (searchTerm.length === 0) {
      // fetchTreckScapeFeeds();
    }
  }, [searchTerm]);

  useEffect(() => {
    // fetchTreckScapeFeeds('', true);
  }, []);

  return (
    <View style={styles.container}>
      {/* heading and searchbar */}
      <View style={styles.headerWrapper}>
        <View style={styles.fullWidth}>
          <View style={styles.headerContent}>
            <Image
              source={require('../../public/images/ring-mobile.png')}
              style={styles.ringImage}
            />
            <Text style={styles.trailTitle}>Meet the Trailblazers</Text>
          </View>
        </View>
      </View>

      {/* heading and description */}
      <View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.heading}>Over 1000+ people trust us</Text>
          <Text style={styles.subheading}>
            Celebrating Adventurers Who Trusted Traveltor: Meet the Explorers
            Who Completed Their Trekscapes and Made Their Mark in the World of
            Authentic Travel!
          </Text>
        </View>
      </View>

      <View style={styles.carouselWrapper}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          loop
          showsPagination={false}
          onIndexChanged={() => {}}
          height={250}>
          {isLoading ? (
            Array.from({length: 5}).map((_, index) => (
              <View key={index} style={styles.slide}>
                {/* Replace <Skeleton> with placeholder if needed */}
                <View style={styles.imageSkeleton} />
                <View style={styles.overlay}>
                  <View style={styles.overlayContent}>
                    <View style={styles.textSkeletonContainer}>
                      <View style={styles.textSkeleton1} />
                      <View style={styles.textSkeleton2} />
                    </View>
                    <View style={styles.iconSkeleton} />
                  </View>
                </View>
              </View>
            ))
          ) : trail?.length === 0 ? (
            <View style={styles.emptyMessage}>
              <Text style={styles.emptyText}>No Trailpoint Found</Text>
            </View>
          ) : (
            trail.map((slide, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={
                    slide.profileImage === null
                      ? require('../../public/images/man.jpg')
                      : {uri: `${slide.profileImage}?tr=q-50`}
                  }
                  style={styles.slideImage}
                />
                {/* <View style={styles.gradientOverlay} /> */}
                <View style={styles.slideDetails}>
                  <View>
                    <Text style={styles.nameText}>
                      {slide.firstname} {slide.lastname}
                    </Text>
                    <Text style={styles.countText}>
                      {slide.trekscapesCount > 99
                        ? '99+'
                        : slide.trekscapesCount < 1
                        ? 1
                        : slide.trekscapesCount}{' '}
                      Trekscape
                    </Text>
                  </View>
                  <TouchableOpacity
                    // onPress={() => navigate(`trailblazer/profile/${slide.id}`)}
                    style={styles.arrowButton}>
                    <RightIcon name="right" size={15} color="#e93c00" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Swiper>
      </View>
    </View>
  );
};

export default Trailblazers;

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    marginVertical: 40,
  },
  headerWrapper: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ringImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  trailTitle: {
    fontSize: 14,
    color: '#E93C00',
    fontWeight: '500',
  },
  descriptionContainer: {
    width: '100%',
    marginHorizontal: 'auto',
    textAlign: 'center',
    marginBottom: 12,
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    color: '#090914',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    lineHeight: 26,
  },
  subheading: {
    color: '#18181B',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 23,
    textAlign: 'center',
  },
  carouselWrapper: {
    paddingLeft: 20,
  },
  slide: {
    width: 146,
    height: 230,
    position: 'relative',
  },
  imageSkeleton: {
    width: 230,
    height: 230,
    borderRadius: 12,
    backgroundColor: '#ccc',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 0,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
  },
  overlayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  textSkeletonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  textSkeleton1: {
    width: 130,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  textSkeleton2: {
    width: 100,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  iconSkeleton: {
    height: 22,
    width: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  emptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 25,
    fontWeight: '500',
    color: '#E93C00',
  },
  slideImage: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 175,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  slideDetails: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 16,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 10,
  },
  arrowButton: {
    height: 22,
    width: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E93C00',
    backgroundColor: '#FCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  arrowText: {
    color: '#E93C00',
    fontSize: 16,
  },
});
