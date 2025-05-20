import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Convert an image to 3:4 aspect ratio
 * @param {Object} file - The image file object with uri property
 * @returns {Promise<Object>} - The converted file
 */
export const convertToThreeFourRatio = async file => {
  if (!file || !file.uri) {
    throw new Error('Invalid file');
  }

  try {
    // Get image dimensions
    const imageInfo = await new Promise((resolve, reject) => {
      Image.getSize(
        file.uri,
        (width, height) => resolve({width, height}),
        error => reject(error),
      );
    });

    const {width, height} = imageInfo;
    const targetAspectRatio = 3 / 4; // Target aspect ratio (width/height)
    const currentAspectRatio = width / height;

    // If the image already has the correct aspect ratio (with small tolerance)
    const tolerance = 0.05;
    if (Math.abs(currentAspectRatio - targetAspectRatio) < tolerance) {
      return file;
    }

    let cropX = 0;
    let cropY = 0;
    let cropWidth = width;
    let cropHeight = height;

    // Calculate crop dimensions to achieve 3:4 ratio
    if (currentAspectRatio > targetAspectRatio) {
      // Image is wider than 3:4, crop width
      cropWidth = height * targetAspectRatio;
      cropX = (width - cropWidth) / 2;
    } else {
      // Image is taller than 3:4, crop height
      cropHeight = width / targetAspectRatio;
      cropY = (height - cropHeight) / 2;
    }

    // Perform the crop operation
    const manipResult = await ImageManipulator.manipulateAsync(
      file.uri,
      [
        {
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      {compress: 1, format: ImageManipulator.SaveFormat.JPEG},
    );

    // Create a new file object with the cropped image
    const fileName = file.name
      ? file.name.replace(/\.\w+$/, '.jpg')
      : `image_${Date.now()}.jpg`;

    return {
      uri: manipResult.uri,
      name: fileName,
      type: 'image/jpeg',
    };
  } catch (error) {
    console.error('Error in convertToThreeFourRatio:', error);
    // Return original file if conversion fails
    return file;
  }
};

/**
 * Converts a file URI to a blob (for React Native Web)
 * @param {string} uri - The file URI
 * @returns {Promise<Blob>} - A blob object
 */
export const uriToBlob = async uri => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return await response.blob();
  } else {
    // For native platforms
    const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('uriToBlob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', `data:image/jpeg;base64,${base64}`, true);
      xhr.send(null);
    });
  }
};

/**
 * Creates a File object from a blob and name
 * @param {Blob} blob - The blob data
 * @param {string} name - The file name
 * @returns {File} - A File object
 */
export const createFile = (blob, name) => {
  return new File([blob], name, {type: blob.type});
};

export default {
  convertToThreeFourRatio,
  uriToBlob,
  createFile,
};
