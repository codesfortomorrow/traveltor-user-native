import React, {useRef, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, FlatList} from 'react-native';
import moment from 'moment';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import WhiteMarker from '../../../public/images/mobtrekscape/trialpoints/whitemarker.svg';
import Constant from '../../utils/constant';
import FastImage from 'react-native-fast-image';

const TrialPointSlider = ({check_ins, isLoading, trailpointImage}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const {slug} = route.params;
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const {optimizeImageKitUrl} = Constant();

  const {width} = Dimensions.get('window');
  const ITEM_WIDTH = width * 0.6;
  const ITEM_SPACING = 15;

  // Handle pagination dots
  const renderDots = totalItems => {
    return (
      <View style={styles.pagination}>
        {Array(totalItems)
          .fill(0)
          .map((_, index) => (
            <View
              key={index}
              style={index === activeIndex ? styles.activeDot : styles.dot}
            />
          ))}
      </View>
    );
  };

  // Handle when scroll ends
  const handleScroll = event => {
    const slideSize = ITEM_WIDTH + ITEM_SPACING;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  // Render check-in item
  const renderCheckInItem = ({item, index}) => (
    <View
      style={[styles.slide, {width: ITEM_WIDTH, marginRight: ITEM_SPACING}]}>
      <View
        style={styles.slideContent}
        onPress={() => navigation.navigate('CheckIns', {slug: slug})}>
        <FastImage
          source={{
            uri: optimizeImageKitUrl(item?.media[0], 0, 0),
            priority: FastImage.priority.normal,
          }}
          style={styles.slideImage}
        />
        <LinearGradient
          colors={['rgba(105, 93, 89, 0.8)', '#B93204']}
          start={{x: 0.035, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.bottomInfoContainer}>
          <View style={styles.topRightInfo}>
            <View style={styles.timestampContainer}>
              <WhiteMarker width={14} height={14} />
              <Text style={styles.timestampText}>
                {moment(Number(item?.timestamp)).fromNow()}
              </Text>
            </View>
          </View>

          <View style={styles.profileContainer}>
            <View>
              <FastImage
                source={
                  item?.user?.profileImage
                    ? {
                        uri: optimizeImageKitUrl(
                          item?.user?.profileImage,
                          200,
                          200,
                        ),
                      }
                    : require('../../../public/images/dpPlaceholder.png')
                }
                style={styles.profileImage}
              />
            </View>
            <View>
              <Text style={styles.userName}>
                {item?.user?.firstname || 'N/A'} {item?.user?.lastname || 'N/A'}
              </Text>
              <View style={styles.visitTypeContainer}>
                <Text style={styles.visitTypeText}>
                  {item?.visitType === 'MustVisit' ? 'Must Go' : 'Least Go'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.reviewText} numberOfLines={2}>
            {item?.review}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );

  // Render trailpoint image item
  const renderTrailpointItem = ({item, index}) => (
    <View
      style={[styles.slide, {width: ITEM_WIDTH, marginRight: ITEM_SPACING}]}>
      <View style={styles.slideContent}>
        <FastImage
          source={{
            uri: optimizeImageKitUrl(item, 0, 0),
            priority: FastImage.priority.normal,
          }}
          style={styles.slideImage}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, isLoading ? styles.hidden : styles.visible]}>
      {check_ins?.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={check_ins}
            renderItem={renderCheckInItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + ITEM_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onMomentumScrollEnd={handleScroll}
          />
          {renderDots(check_ins.length)}
        </>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={trailpointImage}
            renderItem={renderTrailpointItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + ITEM_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onMomentumScrollEnd={handleScroll}
          />
          {renderDots(trailpointImage?.length || 0)}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    minHeight: 350,
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
  },
  flatListContent: {
    paddingRight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  slide: {
    marginRight: 15,
  },
  slideContent: {
    width: '100%',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: 350,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  bottomInfoContainer: {
    position: 'absolute',
    width: '100%',
    height: '34%',
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  topRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markerIcon: {
    width: 14,
    height: 14,
  },
  timestampText: {
    color: 'white',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 8,
    textTransform: 'capitalize',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    borderWidth: 1,
    borderColor: '#F2E3DD',
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  userName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
  },
  visitTypeContainer: {
    backgroundColor: '#e93c00',
    paddingHorizontal: 4,
    marginTop: 4,
    borderRadius: 10,
    width: 57,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitTypeText: {
    fontFamily: 'Inter',
    fontSize: 8,
    color: 'white',
    textAlign: 'center',
  },
  reviewText: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 10,
    color: 'white',
    lineHeight: 16,
    paddingHorizontal: 4,
    paddingTop: 8,
  },
});

export default TrialPointSlider;
