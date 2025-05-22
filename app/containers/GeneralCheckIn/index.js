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
  Alert,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {useDispatch, useSelector} from 'react-redux';
import {setError} from '../../redux/Slices/errorPopup';
import {
  convertToThreeFourRatio,
  convertToThreeFourRatioRN,
  getLocation,
} from '../../components/Helpers/fileUploadHelper';
import {useNavigation} from '@react-navigation/native';
import CheckInStep2 from './CheckInStep2';
import CheckInTopBar from '../../components/Common/CheckInTopBar';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
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
  const inputRef = useRef(null);
  const isTriggered = useRef(false);
  const [isLoaded, setIsLoaded] = useState({});

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

      // const updatedFiles = await Promise.all(
      //   selectedFiles.map(async file => {
      //     const croppedImage = croppedImages[file.id];
      //     if (croppedImage) {
      //       const blob = await fetch(croppedImage).then(res => res.blob());
      //       return new File(
      //         [blob],
      //         `cropped_${file.file?.name || 'image'}.jpg`,
      //         {
      //           type: 'image/jpeg',
      //         },
      //       );
      //     }
      //     return await convertToThreeFourRatio(file.file);
      //   }),
      // );

      const threeFourFiles = await Promise.all(
        selectedFiles.map(async f => {
          try {
            const converted = await convertToThreeFourRatioRN(f.file);
            return converted;
          } catch (e) {
            console.warn(
              'Failed to convert ratio, using original:',
              f.file.name,
            );
            return f.file;
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
        latitude: '22.7611853',
        longitude: '75.8831569',
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

  // const handleCropDone = async (originalImage, croppedImage) => {
  //   try {
  //     const updatedCrops = {...croppedImages, [originalImage]: croppedImage};
  //     setCroppedImages(updatedCrops);
  //     await AsyncStorage.setItem('croppedImages', JSON.stringify(updatedCrops));
  //   } catch (error) {
  //     console.error('Error saving cropped images:', error);
  //   }
  // };

  const handleCropDone = async (fileId, croppedImageUri) => {
    console.log({fileId, croppedImageUri});
    // setCroppedImages(prevFiles =>
    //   prevFiles.map(file =>
    //     file.id === fileId ? {...file, croppedUri: croppedImageUri} : file,
    //   ),
    // );

    try {
      const updatedCrops = {...croppedImages, [fileId]: croppedImageUri};
      setCroppedImages(updatedCrops);
      await AsyncStorage.setItem('croppedImages', JSON.stringify(updatedCrops));
    } catch (error) {
      console.error('Error saving cropped images:', error);
    }
  };

  useEffect(() => {
    const triggerImagePicker = () => {
      if (!isTriggered.current) {
        isTriggered.current = true;
        setTimeout(() => {
          pickImage();
        }, 500);
      }
    };

    // triggerImagePicker();
  }, []);

  const copyToCache = async (sourceUri, fileName) => {
    const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    try {
      await RNFS.copyFile(sourceUri, destPath);
      return destPath;
    } catch (err) {
      console.error('Failed to copy file to cache:', err);
      throw err;
    }
  };

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        selectionLimit: 0,
        includeBase64: false,
        includeExtra: true,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Unknown error occurred');
        return;
      }

      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/svg+xml',
        'image/heic',
        'image/heif',
      ].map(type => type.toLowerCase());

      const tempFiles = result.assets.map(asset => ({
        id: uuidv4(),
        file: asset,
        url: asset.uri,
        status: 'ready',
      }));

      setSelectedFiles(prevFiles => [...prevFiles, ...tempFiles]);

      const failedIndexes = new Set();

      await Promise.all(
        tempFiles.map(async tempFile => {
          setIsLoaded(prev => ({
            ...prev,
            [tempFile.id]: false,
          }));

          try {
            let processedFile = tempFile.file;
            const fileTypeMatch = processedFile.uri.match(/\.([^.]+)$/);
            const fileExtension = fileTypeMatch
              ? fileTypeMatch[1].toLowerCase()
              : '';
            const mimeType = processedFile.type
              ? processedFile.type.toLowerCase()
              : '';

            const isAllowedType =
              allowedTypes.includes(mimeType) ||
              allowedTypes.includes(`image/${fileExtension}`);

            if (!isAllowedType) {
              dispatch(
                setError({
                  open: true,
                  custom_message: `Unsupported file type: ${
                    processedFile.type || fileExtension
                  }`,
                }),
              );
              failedIndexes.add(tempFile.id);
              return;
            }

            // HEIC/HEIF Conversion
            if (
              mimeType.includes('heic') ||
              fileExtension === 'heic' ||
              fileExtension === 'heif'
            ) {
              try {
                const fileName = `converted_${Date.now()}.jpg`;
                const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

                const resizeResult = await ImageResizer.createResizedImage(
                  processedFile.uri,
                  2048,
                  2048,
                  'JPEG',
                  80,
                  0,
                  outputPath,
                );

                const newFileName = processedFile.name.replace(
                  /\.(heic|heif)$/i,
                  '.jpg',
                );
                processedFile = {
                  uri: resizeResult.uri,
                  name: newFileName,
                  type: 'image/jpeg',
                };

                setSelectedFiles(prevFiles =>
                  prevFiles.map(fileObj =>
                    fileObj.id === tempFile.id
                      ? {
                          ...fileObj,
                          file: processedFile,
                          status: 'ready',
                          url: resizeResult.uri,
                        }
                      : fileObj,
                  ),
                );
              } catch (error) {
                console.error('HEIC/HEIF conversion failed:', error);
                dispatch(
                  setError({
                    open: true,
                    custom_message: `Failed to convert HEIC/HEIF file: ${processedFile.name}`,
                  }),
                );
                failedIndexes.add(tempFile.id);
                return;
              }
            }

            // Compression
            if (
              ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
                mimeType,
              ) ||
              ['jpeg', 'jpg', 'png', 'webp'].includes(fileExtension)
            ) {
              try {
                const fileStats = await RNFS.stat(
                  processedFile.uri.replace('file://', ''),
                );
                const fileSizeInMB = fileStats.size / (1024 * 1024);

                if (fileSizeInMB > 2 || true) {
                  const copiedPath = await copyToCache(
                    processedFile.uri.replace('file://', ''),
                    `temp_${Date.now()}.jpg`,
                  );

                  let resizeResult = null;
                  try {
                    resizeResult = await ImageResizer.createResizedImage(
                      copiedPath,
                      2048,
                      2048,
                      'JPEG',
                      80,
                      0,
                    );
                  } catch (error) {
                    console.error(
                      'ImageResizer.createResizedImage failed:',
                      error,
                      processedFile.uri,
                    );
                  }

                  if (resizeResult) {
                    const resizedStats = await RNFS.stat(resizeResult.uri);
                    const resizedSizeInMB = resizedStats.size / (1024 * 1024);

                    if (resizedSizeInMB > 2) {
                      const furtherCompressedPath = `${
                        RNFS.CachesDirectoryPath
                      }/further_${Date.now()}.jpg`;
                      const furtherCompressed =
                        await ImageResizer.createResizedImage(
                          resizeResult.uri,
                          1280,
                          1280,
                          'JPEG',
                          60,
                          0,
                          furtherCompressedPath,
                        );

                      processedFile = {
                        uri: furtherCompressed.uri,
                        name: processedFile.name,
                        type: 'image/jpeg',
                      };

                      RNFS.unlink(resizeResult.uri).catch(err =>
                        console.warn('Error removing temporary file:', err),
                      );
                    } else {
                      processedFile = {
                        uri: resizeResult.uri,
                        name: processedFile.name,
                        type: 'image/jpeg',
                      };
                    }
                  } else {
                    console.warn(
                      'resizeResult was null, skipping compression step',
                    );
                  }
                }
              } catch (error) {
                console.error('Image compression failed:', error);
              }
            }

            setSelectedFiles(prevFiles =>
              prevFiles.map(fileObj =>
                fileObj.id === tempFile.id
                  ? {...fileObj, status: 'ready', file: processedFile}
                  : fileObj,
              ),
            );

            setIsLoaded(prev => ({
              ...prev,
              [tempFile.id]: true,
            }));
          } catch (error) {
            console.error('Error processing image:', error);
            failedIndexes.add(tempFile.id);
          }
        }),
      );

      if (failedIndexes.size > 0) {
        setSelectedFiles(prevFiles =>
          prevFiles.filter(fileObj => !failedIndexes.has(fileObj.id)),
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      dispatch(
        setError({
          open: true,
          custom_message: 'Error selecting images. Please try again.',
        }),
      );
    }
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
      <SadIcon width={30} height={30} />

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
              // source={require('../../../public/images/CheckInTvtor.jpg')}
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
              horizontal
              contentContainerStyle={styles.imageSwiper}
              showsHorizontalScrollIndicator={false}
              pagingEnabled>
              {selectedFiles.map(file => {
                const imageUrl = croppedImages[file.id] || file.url;
                return (
                  <View
                    key={file?.id}
                    style={[
                      styles.imageSwiperSlide,
                      selectedFiles?.length === 1 && styles.singleImage,
                    ]}>
                    {!isLoaded[file?.id] && (
                      <View style={styles.imageLoader}>
                        <Text style={styles.imageLoaderText}>
                          Loading image...
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setShowSingleFile(file);
                        setIsCropOpen(true);
                      }}
                      activeOpacity={0.8}>
                      <Image
                        source={{uri: imageUrl}}
                        style={[
                          styles.selectedImage,
                          isLoaded[file?.id] ? {opacity: 1} : {opacity: 0},
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
                      onPress={() =>
                        setSelectedFiles(prevFiles =>
                          prevFiles.filter(fileObj => fileObj.id !== file.id),
                        )
                      }>
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
          {/* <ImageCropper
            fileId={showSingleFile?.id || selectedFiles[0]?.id}
            originalFile={
              showSingleFile?.file || selectedFiles[0]?.file
            }
            imageSrc={showSingleFile?.url || selectedFiles[0].url}
            onCropDone={handleCropDone}
            setIsCropOpen={setIsCropOpen}
          /> */}
          {/*} <ImageCropper
            fileId={showSingleFile?.id || selectedFiles[0]?.id}
            originalFile={showSingleFile.file}
            imageSrc={showSingleFile?.url || selectedFiles[0]?.url}
            onCropDone={handleCropDone}
          /> */}

          <ImageCropper
            fileId={showSingleFile?.id || selectedFiles[0]?.id}
            originalFile={
              showSingleFile?.file?.uri || selectedFiles[0]?.file?.uri
            }
            imageSrc={showSingleFile?.file?.uri || selectedFiles[0]?.file?.uri}
            onCropDone={handleCropDone}
          />
        </View>
      )}

      {!isCropOpen && (
        <View style={styles.addPhotosButtonContainer}>
          <TouchableOpacity style={styles.addPhotosButton} onPress={pickImage}>
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 20,
    width: 75,
    height: 30,
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
  singleImage: {
    marginHorizontal: 'auto',
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
    width: 300,
    height: 400,
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
