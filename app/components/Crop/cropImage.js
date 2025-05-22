import {ImageEditor} from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';

/**
 * Creates a cropped version of the image based on the crop parameters
 *
 * @param {string} uri - The original image URI
 * @param {Object} cropData - The cropping parameters
 * @param {number} scaleFactor - Scale factor for pixel calculations
 * @returns {Promise<string>} - URI of the cropped image
 */
const getCroppedImg = async (uri, cropData, scaleFactor = 1) => {
  try {
    // Ensure crop values are valid
    const cropWidth = Math.max(1, cropData.width / scaleFactor);
    const cropHeight = Math.max(1, cropData.height / scaleFactor);
    const cropX = Math.max(0, cropData.x / scaleFactor);
    const cropY = Math.max(0, cropData.y / scaleFactor);

    // Adjust crop area based on scale factor
    const cropRect = {
      offset: {
        x: cropX,
        y: cropY,
      },
      size: {
        width: cropWidth,
        height: cropHeight,
      },
      // These parameters ensure the output image has the correct dimensions
      displaySize: {
        width: cropWidth,
        height: cropHeight,
      },
      resizeMode: 'contain',
    };

    // Use ImageEditor to crop the image
    const croppedImageUri = await ImageEditor.cropImage(uri, cropRect);

    return croppedImageUri;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
};

export default getCroppedImg;
