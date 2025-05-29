import {setLocation} from '../../redux/Slices/geoLocation';
import {RESULTS} from 'react-native-permissions';
import {PermissionsAndroid, Platform} from 'react-native';
import {Image} from 'react-native';

import ImageEditor from '@react-native-community/image-editor';

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

// export const handleFileChange = async (
//   event,
//   setSelectedFiles,
//   setIsLoaded,
// ) => {
//   const files = Array.from(event.target.files);
//   if (!files.length) return;

//   const allowedTypes = [
//     'image/png',
//     'image/jpeg',
//     'image/jpg',
//     'image/webp',
//     'image/svg+xml',
//     'image/heic',
//     'image/heif',
//     'image/HEIC',
//     'image/SVG',
//     'image/JPG',
//   ];

//   const tempFiles = files.map(file => ({
//     id: crypto.randomUUID(),
//     file,
//     url: URL.createObjectURL(file),
//     status: 'ready',
//   }));

//   setSelectedFiles(prevFiles => [...prevFiles, ...tempFiles]);

//   let failedIndexes = new Set();

//   await Promise.all(
//     tempFiles.map(async tempFile => {
//       setIsLoaded(prev => ({
//         ...prev,
//         [tempFile.id]: false,
//       }));

//       try {
//         let processedFile = tempFile.file;

//         if (!allowedTypes.includes(processedFile.type)) {
//           toast.error(`Unsupported file type: ${processedFile.type}`);
//           failedIndexes.add(tempFile.id);
//           return;
//         }

//         if (
//           processedFile.type === 'image/heic' ||
//           processedFile.name.endsWith('.heic')
//         ) {
//           try {
//             const convertedBlob = await heic2any({
//               blob: processedFile,
//               toType: 'image/jpeg',
//             });

//             const finalBlob = Array.isArray(convertedBlob)
//               ? convertedBlob[0]
//               : convertedBlob;

//             processedFile = new File(
//               [finalBlob],
//               processedFile.name.replace(/\.heic$/i, '.jpg'),
//               {
//                 type: 'image/jpeg',
//               },
//             );

//             const newPreviewUrl = URL.createObjectURL(processedFile);

//             setSelectedFiles(prevFiles =>
//               prevFiles.map(fileObj =>
//                 fileObj.id === tempFile.id
//                   ? {
//                       ...fileObj,
//                       file: processedFile,
//                       status: 'ready',
//                       url: newPreviewUrl,
//                     }
//                   : fileObj,
//               ),
//             );
//           } catch (error) {
//             console.error('HEIC conversion failed:', error);
//             toast.error(`Failed to convert HEIC file: ${processedFile.name}`);
//             failedIndexes.add(tempFile.id);
//             setSelectedFiles(prevFiles =>
//               prevFiles.filter(fileObj => !failedIndexes.has(fileObj.id)),
//             );
//             return;
//           }
//         }

//         if (
//           ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
//             processedFile.type,
//           )
//         ) {
//           const options = {
//             maxSizeMB: 2,
//             maxWidthOrHeight: 1920,
//             useWebWorker: true,
//             initialQuality: 0.8,
//             alwaysKeepResolution: false,
//           };

//           const compressedBlob = await imageCompression(processedFile, options);
//           processedFile = new File([compressedBlob], processedFile.name, {
//             type: 'image/webp',
//           });
//         }

//         setSelectedFiles(prevFiles =>
//           prevFiles.map(fileObj =>
//             fileObj.id === tempFile.id
//               ? {...fileObj, status: 'ready', file: processedFile}
//               : fileObj,
//           ),
//         );
//       } catch (error) {
//         failedIndexes.add(tempFile.id);
//       }
//     }),
//   );

//   if (failedIndexes.size > 0) {
//     setSelectedFiles(prevFiles =>
//       prevFiles.filter(fileObj => !failedIndexes.has(fileObj.id)),
//     );
//   }
// };
