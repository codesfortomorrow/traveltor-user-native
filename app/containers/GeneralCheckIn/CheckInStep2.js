import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import CheckInTopBar from '../../components/Common/CheckInTopBar';
import ReviewCheckIn from '../../components/Common/ReviewCheckIn';
import CheckInSuccessPopup from '../../components/Modal/CheckInSuccessPopup';
import LocationIcon from 'react-native-vector-icons/SimpleLineIcons';
import SearchIcon from 'react-native-vector-icons/Feather';
import ChevronRight from 'react-native-vector-icons/Entypo';

const CheckInStep2 = ({
  currentTrekscapes,
  setReviewText,
  disable,
  handleCheckInTreckScape,
  setStep,
  locationloader,
  handleName,
  setHandleName,
  setTrailPointDetail,
  croppedImages,
  successCheckin,
  setSuccessCheckin,
  selectedFiles,
}) => {
  const [handledropdown, setHandledropdown] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const {navigate} = useNavigation();

  const handleLocationChange = value => {
    const selectedDetail = currentTrekscapes?.find(
      trailpoint => trailpoint.slug === value,
    );
    setTrailPointDetail(selectedDetail ? [selectedDetail] : []);
    setHandledropdown(false);
  };

  useEffect(() => {
    if (currentTrekscapes) {
      handleLocationChange(currentTrekscapes[0]?.slug);
      setHandleName(currentTrekscapes[0]?.name);
    }
  }, [currentTrekscapes]);

  const renderImageItem = ({item, index}) => {
    const imageUrl = croppedImages[item.id] || item.url;
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => handledropdown && setHandledropdown(false)}>
        <View style={styles.container}>
          <CheckInTopBar
            disable={disable}
            handleCheckInTreckScape={handleCheckInTreckScape}
            text={'Back'}
            setStep={setStep}
          />
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageGalleryContainer}>
              <FlatList
                data={selectedFiles}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                pagingEnabled={false}
                decelerationRate="fast"
              />
            </View>

            <ReviewCheckIn setReviewText={setReviewText} />

            <View style={styles.locationContainer}>
              <View style={styles.locationWrapper}>
                {locationloader ? (
                  <View style={styles.loaderContainer}>
                    <View style={styles.loader} />
                  </View>
                ) : (
                  <TouchableWithoutFeedback
                    ref={buttonRef}
                    onPress={() => setHandledropdown(!handledropdown)}>
                    <View
                      style={[
                        styles.locationButton,
                        handledropdown && styles.locationButtonOpen,
                      ]}>
                      <View style={styles.locationButtonContent}>
                        {handledropdown ? (
                          <SearchIcon name="search" size={20} color="#000" />
                        ) : (
                          <LocationIcon
                            name="location-pin"
                            size={20}
                            color="#000"
                          />
                        )}
                        <Text style={styles.locationText}>{handleName}</Text>
                        {currentTrekscapes?.length > 1 && (
                          <ChevronRight
                            name="chevron-small-right"
                            size={24}
                            style={handledropdown && styles.chevronRotated}
                            color="#000"
                          />
                        )}
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                )}
                {handledropdown && (
                  <View ref={dropdownRef} style={styles.dropdownContainer}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}>
                      {currentTrekscapes
                        ?.filter(trek => trek?.name !== handleName)
                        ?.map((detail, index) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            key={index}
                            onPress={() => {
                              handleLocationChange(detail?.slug);
                              setHandleName(detail?.name);
                            }}>
                            <LocationIcon
                              name="location-pin"
                              size={20}
                              color="#000"
                            />
                            <Text style={styles.locationText}>
                              {detail?.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      {successCheckin?.status && (
        <CheckInSuccessPopup
          open={successCheckin?.status}
          handleClose={() => {
            setSuccessCheckin(null);
            navigate('MyFeeds');
          }}
          data={successCheckin?.data}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    minHeight: Dimensions.get('window').height * 0.95,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
    height: Dimensions.get('window').height - 100,
  },
  imageGalleryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    width: '100%',
  },
  flatListContent: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 229,
  },
  imageContainer: {
    width: 172,
    height: 229,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
    paddingBottom: 45,
  },
  locationWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 6,
    marginHorizontal: 12,
  },
  loader: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0000009A',
    borderTopColor: 'transparent',
    // Animation would need to be added via Animated API
  },
  locationButton: {
    borderWidth: 1,
    borderColor: '#0000009A',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 192,
    paddingLeft: 8,
    borderRadius: 4,
    width: '100%',
  },
  locationButtonOpen: {
    borderBottomColor: '#EEEEEE',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  locationButtonContent: {
    flexDirection: 'row',
    gap: 4,
    paddingRight: 8,
    alignItems: 'center',
    width: '100%',
    minHeight: 42,
  },
  locationText: {
    width: '85%',
    paddingLeft: 6,
    paddingVertical: 4,
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Inter',
  },
  chevronIcon: {
    fontWeight: 'bold',
    width: 20,
    height: 20,
  },
  chevronRotated: {
    transform: [{rotate: '90deg'}],
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#0000009A',
    borderTopColor: '#EEEEEE',
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxHeight: 200,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -1,
    width: '100%',
  },
  dropdownScroll: {
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 14,
    width: '100%',
  },
});

export default CheckInStep2;
