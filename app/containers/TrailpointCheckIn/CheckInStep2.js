import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CheckInTopBar from '../../components/Common/CheckInTopBar';
import ReviewCheckIn from '../../components/Common/ReviewCheckIn';
import LocationIcon from 'react-native-vector-icons/SimpleLineIcons';
import Thumb from 'react-native-vector-icons/AntDesign';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const CheckInStep2 = ({
  setReviewText,
  disable,
  handleCheckInTreckScape,
  setStep,
  locationloader,
  croppedImages,
  selectedFiles,
  trailPointDetail,
  seletedValue,
  handleSelectChange,
}) => {
  const renderImageItem = ({item, index}) => {
    const imageUrl = croppedImages[item.id] || item.url;
    return (
      <View style={styles.imageContainer}>
        <Image
          key={index}
          source={{uri: imageUrl}}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CheckInTopBar
        disable={disable}
        handleCheckInTreckScape={handleCheckInTreckScape}
        text={'Back'}
        setStep={setStep}
        type={'trailpoint'}
      />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imagesGallery}>
          <FlatList
            data={selectedFiles}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => (
              <View style={styles.imageSeparator} />
            )}
          />
        </View>

        <ReviewCheckIn setReviewText={setReviewText} />

        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <View style={styles.locationContainer}>
              <LocationIcon name="location-pin" size={20} color="#000" />
              {locationloader ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              ) : (
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText}>
                    {trailPointDetail?.name || '-'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.reactionContainer}>
              <View
                style={[
                  styles.reactionIcon,
                  seletedValue === 'LeastVisit' && styles.flippedIcon,
                ]}>
                <Thumb name="like2" size={24} color="#000" />
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={seletedValue}
                  onValueChange={itemValue => {
                    handleSelectChange(itemValue);
                  }}
                  style={styles.picker}>
                  <Picker.Item label="Must Visit" value="MustVisit" />
                  <Picker.Item label="Least Visit" value="LeastVisit" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: screenHeight * 0.95,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagesGallery: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    width: '100%',
  },
  flatListContent: {
    paddingRight: 20,
  },
  imageContainer: {
    width: 172,
    height: 229,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageSeparator: {
    width: 16,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 45,
  },
  inputContainer: {
    width: '100%',
    gap: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
  },
  locationIcon: {
    width: 20,
    height: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 12,
  },
  locationTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingRight: 8,
  },
  locationText: {
    flex: 1,
    paddingLeft: 6,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  reactionContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    borderRadius: 4,
    height: 42,
  },
  flippedIcon: {
    transform: [{scaleY: -1}],
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingRight: 4,
  },
  picker: {
    flex: 1,
    paddingLeft: 6,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Inter',
    backgroundColor: 'transparent',
  },
});

export default CheckInStep2;
