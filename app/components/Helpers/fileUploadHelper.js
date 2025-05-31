import {setLocation} from '../../redux/Slices/geoLocation';
import {RESULTS} from 'react-native-permissions';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {Image} from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import {setError} from '../../redux/Slices/errorPopup';
import ImageResizer from 'react-native-image-resizer';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {v4 as uuidv4} from 'uuid';

export const convertToThreeFourRatioRN = async file => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      file.uri,
      async (width, height) => {
        try {
          const targetRatio = 3 / 4;
          let cropWidth = width;
          let cropHeight = cropWidth / targetRatio;

          if (cropHeight > height) {
            cropHeight = height;
            cropWidth = cropHeight * targetRatio;
          }

          const offsetX = (width - cropWidth) / 2;
          const offsetY = (height - cropHeight) / 2;

          const cropData = {
            offset: {x: offsetX, y: offsetY},
            size: {width: cropWidth, height: cropHeight},
            displaySize: {width: cropWidth, height: cropHeight},
            resizeMode: 'contain',
          };

          const croppedUri = await ImageEditor.cropImage(file.uri, cropData);

          resolve({
            uri: croppedUri?.uri,
            name: `cropped_${file.name || Date.now()}.jpg`,
            type: 'image/jpeg',
          });
        } catch (error) {
          console.error('Crop error:', error);
          reject(error);
        }
      },
      error => {
        console.error('Image.getSize error:', error);
        reject(error);
      },
    );
  });
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return result === RESULTS.GRANTED;
  }
};

export const getLocation = async (setGetLocationLoader, dispatch) => {
  setGetLocationLoader(true);
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('Location permission denied');
    dispatch(
      setLocation({
        latitude: null,
        longitude: null,
        response: {
          code: -1,
          message: 'Geolocation is not supported in your device',
        },
      }),
    );
    return;
  }

  Geolocation.getCurrentPosition(
    position => {
      dispatch(
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      );
    },
    error => {
      console.error('Location Error:', error);
      dispatch(
        setLocation({
          latitude: null,
          longitude: null,
          response: error,
        }),
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      forceRequestLocation: true,
    },
  );
};

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

export const pickImage = async (setSelectedFiles, setIsLoaded, dispatch) => {
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
