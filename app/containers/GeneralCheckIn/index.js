import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {useDispatch, useSelector} from 'react-redux';
import {setError} from '../../redux/Slices/errorPopup';
import {
  convertToThreeFourRatioRN,
  getLocation,
  pickImage,
} from '../../components/Helpers/fileUploadHelper';
import {useNavigation} from '@react-navigation/native';
import CheckInStep2 from './CheckInStep2';
import CheckInTopBar from '../../components/Common/CheckInTopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import SadIcon from '../../../public/images/sadIcon.svg';
import UploadImageMic from '../../../public/images/uploadImageMic.svg';
import CameraIcon from '../../../public/images/camera.svg';
import ImageCropper from '../../components/Crop/ImageCropperComponent';
import {
  generateDraftId,
  getDraftById,
  processFilesForDraft,
  saveDraft,
} from '../../utils/draftManager';
import {publishDraft} from '../../utils/BackgroundTaskService';

const {width, height} = Dimensions.get('window');

const slideWidth = 300;
const slideHeight = 400;

const GeneralCheckIn = () => {
  const dispatch = useDispatch();
  const [successCheckin, setSuccessCheckin] = useState(null);
  const [loading, setLoading] = useState(false);
  const {getValidatedCheckInPoint} = useAuth();
  const location = useSelector(state => state?.location);
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [step, setStep] = useState(1);
  const [trailPointDetail, setTrailPointDetail] = useState([]);
  const [currentTrekscapes, setCurrentTrekscapes] = useState([]);
  const [locationloader, setLocationloader] = useState(true);
  const [hasLocation, setHasLocation] = useState(true);
  const [handleName, setHandleName] = useState('');
  const [getLocationLoader, setGetLocationLoader] = useState(false);
  const [showSingleFile, setShowSingleFile] = useState({});
  const [croppedImages, setCroppedImages] = useState({});
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState({});
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [shouldRestorePosition, setShouldRestorePosition] = useState(false);

  const handleCheckInTreckScape = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('generalDraft');

      const trailPoint = trailPointDetail[0];
      const payload = {
        type: trailPoint?.trekscape_id ? 'TrailPoint' : 'Trekscape',
        lat: location?.latitude || 0,
        long: location?.longitude || 0,
        review: reviewText,
      };

      if (trailPoint?.trekscape_id) {
        payload.trailPointId = trailPoint.id;
      } else {
        payload.trekscapeId = trailPoint.id;
      }

      const threeFourFiles = await Promise.all(
        selectedFiles.map(async file => {
          const croppedImage = croppedImages[file.id];
          if (croppedImage) {
            return {uri: croppedImage};
          } else {
            try {
              const converted = await convertToThreeFourRatioRN(file.file);
              return converted;
            } catch (e) {
              console.warn(
                'Failed to convert ratio, using original:',
                file.file.name,
              );
              return file.file;
            }
          }
        }),
      );

      const processedFiles = await processFilesForDraft(threeFourFiles);

      const draftId = await generateDraftId(payload, processedFiles);

      const existingDraft = await getDraftById(draftId);

      if (!existingDraft) {
        await saveDraft({
          id: draftId,
          files: processedFiles,
          payload: payload,
          status: 'readyforPublish',
          type: 'general',
        });
      }

      const response = await publishDraft();
      if (response?.status) {
        setSuccessCheckin({
          status: true,
          data: {
            name: handleName,
            point: payload.type === 'TrailPoint' ? 1000 : 5,
          },
        });
      } else {
        toast.error('Failed to publish check-in.');
      }
    } catch (error) {
      console.log(error, 'error');
      dispatch(
        setError({
          open: true,
          custom_message: error?.message || 'Something went wrong',
        }),
      );
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTrekscapes = useCallback(async ({latitude, longitude}) => {
    setLocationloader(true);
    try {
      const response = await getValidatedCheckInPoint({
        latitude: '22.7590774',
        longitude: '75.8650035',
      });
      if (response) {
        setCurrentTrekscapes(response);
        setTrailPointDetail(response);
      } else {
        setCurrentTrekscapes([]);
        setTrailPointDetail(null);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLocationloader(false);
      setLoading(false);
      setHasLocation(false);
    }
  }, []);

  useEffect(() => {
    if (!location?.response && location?.latitude) {
      fetchCurrentTrekscapes(location);
    } else {
      setCurrentTrekscapes([]);
      setTrailPointDetail(null);
    }
  }, [fetchCurrentTrekscapes, location]);

  const disable =
    location?.response ||
    !trailPointDetail ||
    selectedFiles?.length == 0 ||
    locationloader;

  useEffect(() => {
    const loadSavedCrops = async () => {
      try {
        const savedCrops = await AsyncStorage.getItem('croppedImages');
        if (savedCrops) {
          setCroppedImages(JSON.parse(savedCrops));
        }
      } catch (error) {
        console.error('Error loading cropped images:', error);
      }
    };

    loadSavedCrops();
  }, []);

  const handleCropDone = async (fileId, croppedDataUrl) => {
    try {
      const updatedCrops = {...croppedImages, [fileId]: croppedDataUrl};
      setCroppedImages(updatedCrops);
      await AsyncStorage.setItem('croppedImages', JSON.stringify(updatedCrops));
    } catch (error) {
      console.error('Error saving cropped images:', error);
    }
  };

  const handleRemoveSlide = (fileId, currentIndex) => {
    const newFiles = selectedFiles.filter(fileObj => fileObj.id !== fileId);
    setSelectedFiles(newFiles);

    // If removing the last slide and there are remaining slides
    if (currentIndex === selectedFiles.length - 1 && newFiles.length > 0) {
      // Calculate new scroll position to show the previous slide
      const newScrollPosition = Math.max(
        0,
        (newFiles.length - 1) * (slideWidth + 10),
      );
      setScrollPosition(newScrollPosition);

      // Scroll to the new position after state update
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: newScrollPosition,
          animated: true,
        });
      }, 100);
    }
    // If removing a slide in the middle, adjust scroll position
    else if (currentIndex < selectedFiles.length - 1 && newFiles.length > 0) {
      const currentScrollPosition = currentIndex * (slideWidth + 10);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, currentScrollPosition),
          animated: true,
        });
      }, 100);
    }
  };

  // Function to handle image press (going to crop)
  const handleImagePress = file => {
    // Store current scroll position before going to crop
    setScrollPosition(scrollPosition);
    setShouldRestorePosition(true);
    setShowSingleFile(file);
    setIsCropOpen(true);
  };

  // Effect to restore scroll position when coming back from crop
  useEffect(() => {
    if (shouldRestorePosition && !isCropOpen && scrollViewRef.current) {
      // Restore scroll position after crop is closed
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: false, // Use false for instant positioning
        });
        setShouldRestorePosition(false);
      }, 100);
    }
  }, [isCropOpen, shouldRestorePosition, scrollPosition]);

  // Function to track scroll position
  const handleScroll = event => {
    const currentScrollX = event.nativeEvent.contentOffset.x;
    setScrollPosition(currentScrollX);
  };

  if (step === 2) {
    return (
      <CheckInStep2
        currentTrekscapes={currentTrekscapes}
        setReviewText={setReviewText}
        disable={disable}
        handleCheckInTreckScape={handleCheckInTreckScape}
        setStep={setStep}
        locationloader={locationloader}
        handleName={handleName}
        setHandleName={setHandleName}
        setTrailPointDetail={setTrailPointDetail}
        croppedImages={croppedImages}
        successCheckin={successCheckin}
        setSuccessCheckin={setSuccessCheckin}
        selectedFiles={selectedFiles}
      />
    );
  }

  const renderNoLocationContent = () => (
    <View style={styles.noLocationContainer}>
      <View style={{marginBottom: 20}}>
        <SadIcon width={60} height={60} />
      </View>

      <Text style={styles.notHereTitle}>
        We're Not Here Yet, But We're Trying.
      </Text>
      <Text style={styles.notHereDescription}>
        Not here yet! Locals, help us expand—join our Telegram to connect this
        location!
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Trekscapes')}
        style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationDeniedContent = () => (
    <View style={styles.noLocationContainer}>
      <SadIcon width={60} height={60} />

      <Text style={styles.notHereTitle}>
        {location?.response?.code === 1
          ? 'Permission denied. Please enable geolocation access.'
          : location?.response?.message}
      </Text>
      <TouchableOpacity
        disabled={getLocationLoader}
        onPress={() => getLocation(setGetLocationLoader, dispatch)}
        style={styles.retryButton}>
        {getLocationLoader ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.retryButtonText}>Retry</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderImageUploadContent = () => (
    <View
      style={[
        styles.imageUploadContainer,
        selectedFiles?.length !== 0 && !isCropOpen && styles.justifyCenter,
      ]}>
      {selectedFiles.length === 0 && (
        <View style={styles.uploadInstructionsContainer}>
          <View style={styles.selfCenter}>
            <Image
              source={{
                uri: 'https://ik.imagekit.io/8u2famo7gp/prod/90e0c362d1ee4bd482fd9eda023862db.jpg',
              }}
              style={styles.earnTvtorImage}
            />
          </View>
          <View style={styles.uploadInstructions}>
            <UploadImageMic width={70} height={70} />

            <Text style={styles.uploadInstructionsText}>
              Crop or Adjust your photo before publishing, tap on to photo
              preview.
            </Text>
          </View>
        </View>
      )}

      {selectedFiles?.length !== 0 && !isCropOpen && (
        <Text
          style={[
            styles.tapToAdjustText,
            selectedFiles?.length !== 0 &&
              !isCropOpen &&
              styles.negativeMarginTop,
          ]}>
          *{selectedFiles?.length > 1 && 'Scroll to see more and'} Tap to adjust
          display
        </Text>
      )}

      {selectedFiles?.length !== 0 && (
        <View>
          {!isCropOpen && (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              contentContainerStyle={styles.imageSwiper}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={slideWidth}
              snapToAlignment="start"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleScroll}>
              {selectedFiles.map((file, index) => {
                const imageUrl = croppedImages[file?.id] || file?.url;
                return (
                  <View
                    key={file?.id}
                    style={[
                      styles.imageSwiperSlide,
                      {
                        width: slideWidth,
                        height: slideHeight,
                      },
                      {paddingRight: 10},
                    ]}>
                    {!isLoaded[file?.id] && (
                      <View style={styles.imageLoader}>
                        <Text style={styles.imageLoaderText}>
                          Loading image...
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleImagePress(file)}
                      activeOpacity={0.8}>
                      <Image
                        source={{uri: imageUrl}}
                        style={[
                          styles.selectedImage,
                          isLoaded[file?.id] ? {opacity: 1} : {opacity: 0},
                          {
                            width: slideWidth,
                            height: slideHeight,
                          },
                        ]}
                        onLoad={() =>
                          setIsLoaded(prev => ({
                            ...prev,
                            [file.id]: true,
                          }))
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleRemoveSlide(file.id, index)}>
                      <Text style={styles.deleteIconText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {selectedFiles?.length !== 0 && isCropOpen && (
        <View style={styles.cropperContainer}>
          <ImageCropper
            imageUri={showSingleFile?.file?.uri}
            fileId={showSingleFile?.id}
            onCropComplete={handleCropDone}
          />
        </View>
      )}

      {!isCropOpen && (
        <View style={styles.addPhotosButtonContainer}>
          <TouchableOpacity
            style={styles.addPhotosButton}
            onPress={() => pickImage(setSelectedFiles, setIsLoaded, dispatch)}>
            <CameraIcon width={24} height={24} />

            <Text style={styles.addPhotosButtonText}>Add your photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      <CheckInTopBar
        disable={selectedFiles?.length === 0}
        trigger={'Next'}
        setStep={setStep}
        isCropOpen={isCropOpen}
        setIsCropOpen={setIsCropOpen}
        selectedFiles={selectedFiles}
        nextTrip={true}
      />

      {!location?.response &&
      !loading &&
      location &&
      currentTrekscapes &&
      !hasLocation &&
      currentTrekscapes.length == 0 ? (
        renderNoLocationContent()
      ) : (
        <>
          {location?.response
            ? renderLocationDeniedContent()
            : renderImageUploadContent()}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height - 100,
    backgroundColor: 'white',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sadIcon: {
    height: 240,
    marginVertical: 8,
    marginBottom: 16,
  },
  notHereTitle: {
    fontFamily: 'Inter-Light',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 20,
    paddingTop: 10,
  },
  notHereDescription: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 12,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#E93C00',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 15,
  },
  exploreButtonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: '#E93C00',
    paddingVertical: 4,
    paddingHorizontal: 20,
    marginVertical: 20,
    width: 75,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  imageUploadContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    height: 'auto',
    minHeight: height * 0.9,
    flexDirection: 'column',
    gap: 20,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  uploadInstructionsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 50,
  },
  selfCenter: {
    alignSelf: 'center',
    width: '100%',
  },
  earnTvtorImage: {
    minHeight: 95,
    width: '100%',
    resizeMode: 'cover',
  },
  uploadInstructions: {
    width: '100%',
    height: 125,
    borderWidth: 2,
    borderColor: 'rgba(49, 49, 49, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 32,
    paddingHorizontal: 12,
  },
  uploadInstructionsText: {
    width: 200,
    lineHeight: 20,
    fontSize: 16,
  },
  tapToAdjustText: {
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  negativeMarginTop: {
    marginTop: -90,
  },
  imageSwiper: {
    paddingHorizontal: 10,
  },
  imageSwiperSlide: {
    width: 300,
    maxWidth: 300,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 400,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f1',
    zIndex: 10,
  },
  imageLoaderText: {
    color: '#666',
    fontSize: 14,
  },
  selectedImage: {
    borderRadius: 8,
    resizeMode: 'cover',
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  deleteIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cropperContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    alignItems: 'center',
  },
  addPhotosButtonContainer: {
    paddingHorizontal: 56,
    marginHorizontal: 'auto',
    width: '100%',
    paddingTop: 20,
  },
  addPhotosButton: {
    backgroundColor: '#E93C00',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    marginHorizontal: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
  },
  cameraIcon: {
    marginRight: 8,
    width: 24,
    height: 24,
  },
  addPhotosButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'white',
  },
});

export default GeneralCheckIn;
