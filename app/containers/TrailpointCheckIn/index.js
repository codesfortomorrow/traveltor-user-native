import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import {useDispatch, useSelector} from 'react-redux';
import {setError} from '../../redux/Slices/errorPopup';
import {
  convertToThreeFourRatio,
  convertToThreeFourRatioRN,
  getLocation,
} from '../../components/Helpers/fileUploadHelper';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckInTopBar from '../../components/Common/CheckInTopBar';
import {Swiper} from 'react-native-swiper';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import ImageCropper from '../../components/Crop/ImageCropperComponent';
import SadIcon from '../../../public/images/sadIcon.svg';
import UploadImageMic from '../../../public/images/uploadImageMic.svg';
import CameraIcon from '../../../public/images/camera.svg';
import CheckInStep2 from './CheckInStep2';
import {
  generateDraftId,
  getDraftById,
  processFilesForDraft,
  saveDraft,
} from '../../utils/draftManager';
import {publishDraft} from '../../utils/BackgroundTaskService';

const TrailpointCheckIn = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const {id, trailpointId} = route.params;
  const [successCheckin, setSuccessCheckin] = useState(null);
  const [failureCheckin, setFailureCheckin] = useState(null);
  const [loading, setLoading] = useState(false);
  const {getSingleTrailpoint} = useAuth();
  const {navigate} = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [seletedValue, setSeletedValue] = useState('MustVisit');
  const [step, setStep] = useState(2);
  const [trailPointDetail, setTrailPointDetail] = useState({});
  const [locationloader, setLocationloader] = useState(true);
  const currentLocation = useSelector(state => state?.location);
  const [getLocationLoader, setGetLocationLoader] = useState(false);
  const [showSingleFile, setShowSingleFile] = useState({});
  const [croppedImages, setCroppedImages] = useState({});
  const [isCropOpen, setIsCropOpen] = useState(false);
  const inputRef = useRef(null);
  const isTriggered = useRef(false);
  const [isLoaded, setIsLoaded] = useState({});
  const [showSelectedDateTime, setShowSelectedDateTime] = useState(false); // Added missing state

  const handleCheckInTreckScape = async () => {
    try {
      setLoading(true);
      // Using AsyncStorage instead of localStorage
      await AsyncStorage.removeItem('checkinDraft');

      const payload = {
        type: 'TrailPoint',
        visitType: seletedValue,
        trailPointId: trailpointId,
        lat: currentLocation?.latitude || 0,
        long: currentLocation?.longitude || 0,
        review: reviewText,
      };

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
          type: 'trailpoint',
        });
      }

      const response = await publishDraft();
      if (response?.status) {
        setSuccessCheckin({
          status: true,
          data: {name: trailPointDetail?.name, point: 1000},
        });
        navigate('MyFeeds');
      } else {
        toast.error('Failed to publish check-in.');
      }
    } catch (error) {
      dispatch(
        setError({
          open: true,
          custom_message: error || 'Something went wrong',
        }),
      );
      console.log(error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailpointDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSingleTrailpoint(id);

      if (response) {
        setTrailPointDetail(response);
        setLoading(false);
      }
    } catch (error) {
      console.log('Error:', error);
      setLoading(false);
    } finally {
      setLocationloader(false);
    }
    //eslint-next-line-disable
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTrailpointDetail();
    }
  }, [fetchTrailpointDetail, id]);

  const handleSelectChange = value => {
    setSeletedValue(value);
  };

  const disable =
    currentLocation?.response ||
    !trailPointDetail ||
    selectedFiles?.length == 0 ||
    locationloader;

  useEffect(() => {
    const loadSavedCrops = async () => {
      try {
        // Using AsyncStorage instead of sessionStorage
        const savedCropsStr = await AsyncStorage.getItem('croppedImages');
        const savedCrops = savedCropsStr ? JSON.parse(savedCropsStr) : {};
        setCroppedImages(savedCrops);
      } catch (error) {
        console.log('Error loading crops:', error);
      }
    };

    loadSavedCrops();
  }, []);

  const handleCropDone = (originalImage, croppedImage) => {
    setCroppedImages(prev => {
      const updatedCrops = {...prev, [originalImage]: croppedImage};
      // Using AsyncStorage instead of sessionStorage
      AsyncStorage.setItem('croppedImages', JSON.stringify(updatedCrops));
      return updatedCrops;
    });
  };

  useEffect(() => {
    const triggerFileInput = () => {
      if (!isTriggered.current) {
        isTriggered.current = true;
        setTimeout(() => {
          pickImage();
        }, 0);
      }
    };
    if (step === 2) {
      // triggerFileInput();
    }
  }, [step]);

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

  return (
    <>
      {step == 3 ? (
        <CheckInStep2
          setReviewText={setReviewText}
          disable={disable}
          handleCheckInTreckScape={handleCheckInTreckScape}
          setStep={setStep}
          locationloader={locationloader}
          croppedImages={croppedImages}
          selectedFiles={selectedFiles}
          trailPointDetail={trailPointDetail}
          seletedValue={seletedValue}
          handleSelectChange={handleSelectChange}
        />
      ) : (
        <>
          <View>
            <CheckInTopBar
              disable={disable}
              handleCheckInTreckScape={handleCheckInTreckScape}
              setShowSelectedDateTime={setShowSelectedDateTime}
              trigger={'Next'}
              setStep={setStep}
              isCropOpen={isCropOpen}
              setIsCropOpen={setIsCropOpen}
              step={step}
              type={'trailpoint'}
              selectedFiles={selectedFiles}
              nextTrip={true}
            />
            {currentLocation?.response && (
              <>
                <View style={styles.locationErrorContainer}>
                  <View style={{marginBottom: 20}}>
                    <SadIcon width={60} height={60} />
                  </View>
                  <Text style={styles.errorText}>
                    {currentLocation?.response.code === 1
                      ? 'Permission denied. Please enable geolocation access.'
                      : currentLocation?.response.message}
                  </Text>

                  <TouchableOpacity
                    disabled={getLocationLoader}
                    onPress={() => getLocation(setGetLocationLoader, dispatch)}
                    style={styles.retryButton}>
                    {getLocationLoader ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.retryButtonText}>Retry</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {!currentLocation?.response && (
              <View
                style={[
                  styles.mainContainer,
                  selectedFiles?.length !== 0 &&
                    !isCropOpen &&
                    styles.justifyCenter,
                ]}>
                {selectedFiles.length == 0 && (
                  <View style={styles.emptyStateContainer}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri: 'https://ik.imagekit.io/8u2famo7gp/prod/5ab9e2e49445d4bdf1454b78585f9125.svg?tr=w-97,q-10',
                        }}
                        style={styles.earnTvtorImage}
                      />
                    </View>
                    <View style={styles.uploadInfoBox}>
                      <UploadImageMic width={70} height={70} />

                      <Text style={styles.uploadInfoText}>
                        Crop or Adjust your photo before publishing, tap on to
                        photo preview.
                      </Text>
                    </View>
                  </View>
                )}

                {selectedFiles?.length !== 0 && !isCropOpen && (
                  <Text
                    style={[
                      styles.instructionText,
                      selectedFiles?.length !== 0 &&
                        !isCropOpen &&
                        styles.adjustedInstructionText,
                    ]}>
                    *{selectedFiles?.length > 1 && 'Scroll to see more and'} Tap
                    to adjust display
                  </Text>
                )}

                {step === 2 && selectedFiles?.length !== 0 && (
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
                                selectedFiles?.length === 1 &&
                                  styles.singleImage,
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
                                    isLoaded[file?.id]
                                      ? {opacity: 1}
                                      : {opacity: 0},
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
                                    prevFiles.filter(
                                      fileObj => fileObj.id !== file.id,
                                    ),
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

                {!isCropOpen && (
                  <View style={styles.addPhotoContainer}>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.addPhotoButton}>
                      <CameraIcon width={24} height={24} />

                      <Text style={styles.addPhotoText}>Add your photos</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* {failureCheckin?.status && (
              <FailCheckin
                open={failureCheckin?.status}
                handleClose={() => setFailureCheckin(null)}
                errorMessage={failureCheckin?.message}
              />
            )} */}
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  locationErrorContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  errorImage: {
    height: 240,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#E93C00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 20,
    width: 75,
    height: 30,
    borderRadius: 15,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  mainContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    height: 'auto',
    backgroundColor: '#fff',
    minHeight: '90%',
    flexDirection: 'column',
    gap: 20,
    paddingTop: 20,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  emptyStateContainer: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 50,
  },
  imageContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  earnTvtorImage: {
    minHeight: 95,
    width: 97,
  },
  uploadInfoBox: {
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
  uploadIcon: {
    width: 40,
    height: 40,
  },
  uploadInfoText: {
    width: 200,
    lineHeight: 20,
    fontSize: 16,
  },
  instructionText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  adjustedInstructionText: {
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
  singleImageSlide: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  checkinImage: {
    width: 300,
    height: 400,
    resizeMode: 'cover',
  },
  imageVisible: {
    opacity: 1,
  },
  imageHidden: {
    opacity: 0,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    height: '70%',
    alignItems: 'center',
  },
  addPhotoContainer: {
    paddingHorizontal: 56,
    marginHorizontal: 'auto',
    width: '100%',
    paddingTop: 20,
  },
  addPhotoButton: {
    backgroundColor: '#E93C00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
  },
  cameraIcon: {
    marginRight: 8,
    width: 24,
    height: 24,
  },
  addPhotoText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: 'white',
  },
});

export default TrailpointCheckIn;
