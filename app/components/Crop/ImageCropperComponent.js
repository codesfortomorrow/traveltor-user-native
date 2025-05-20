import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import ImageZoom from 'react-native-image-pan-zoom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';

const ImageCropper = ({
  fileId,
  originalFile,
  imageSrc,
  onCropDone,
  setIsCropOpen,
}) => {
  const cropBox = {width: 300, height: 400};
  const aspectRatio = cropBox.width / cropBox.height;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const debouncedCropDoneRef = useRef();
  const imageRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const cropperWidth = screenWidth - 32; // Adjust based on your padding
  const cropperHeight = cropperWidth / aspectRatio;

  const [cropData, setCropData] = useState({});
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const scaleFactorRef = useRef(1);
  const panOffsetRef = useRef({x: 0, y: 0});
  const currentScaleRef = useRef(1);

  // Load stored crop data
  useEffect(() => {
    const loadStoredCropData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('cropData');
        if (storedData) {
          setCropData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading crop data', error);
      }
    };

    loadStoredCropData();
  }, []);

  // Generate preview image
  const generatePreviewImage = useCallback(async (uri, maxWidth = 1000) => {
    try {
      const imageSize = await Image.getSize(uri);
      const scale = Math.min(maxWidth / imageSize.width, 1);

      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{resize: {width: imageSize.width * scale}}],
        {compress: 0.8, format: ImageManipulator.SaveFormat.JPEG},
      );

      return {previewUrl: resizedImage.uri, scale};
    } catch (error) {
      console.error('Error generating preview image', error);
      return {previewUrl: uri, scale: 1};
    }
  }, []);

  // Load preview image
  useEffect(() => {
    if (imageSrc) {
      generatePreviewImage(imageSrc).then(({previewUrl, scale}) => {
        setPreviewImageSrc(previewUrl);
        scaleFactorRef.current = scale;
        setIsImageLoaded(true);
      });
    }
  }, [imageSrc, generatePreviewImage]);

  // Save crop data
  useEffect(() => {
    const saveCropData = async () => {
      try {
        await AsyncStorage.setItem('cropData', JSON.stringify(cropData));
      } catch (error) {
        console.error('Error saving crop data', error);
      }
    };

    saveCropData();
  }, [cropData]);

  // Initialize crop data for new image
  useEffect(() => {
    if (imageSrc && !cropData[fileId]) {
      setCropData(prev => ({
        ...prev,
        [fileId]: {
          zoom: 1,
          minZoom: 1,
          panOffset: {x: 0, y: 0},
          croppedAreaPixels: null,
        },
      }));
    }
  }, [fileId, imageSrc]);

  // Create debounced crop function
  useEffect(() => {
    debouncedCropDoneRef.current = _.debounce((fileId, croppedImage) => {
      onCropDone(fileId, croppedImage);
    }, 300);
  }, [onCropDone]);

  // Get cropped image from current state
  const getCroppedImage = useCallback(async () => {
    if (!previewImageSrc) return null;

    try {
      // Calculate crop area based on pan and zoom
      const scale = currentScaleRef.current;
      const {x, y} = panOffsetRef.current;

      // Calculate visible area in original image coordinates
      const imageWidth = cropperWidth / scale;
      const imageHeight = cropperHeight / scale;

      // Center offset calculation
      const centerOffsetX = (cropperWidth - imageWidth * scale) / 2;
      const centerOffsetY = (cropperHeight - imageHeight * scale) / 2;

      // Calculate crop area in original image coordinates
      const cropX = Math.max(0, (-x - centerOffsetX) / scale);
      const cropY = Math.max(0, (-y - centerOffsetY) / scale);
      const cropWidth = cropperWidth / scale;
      const cropHeight = cropperHeight / scale;

      // Apply scaling factor for original image
      const originalCropX = cropX / scaleFactorRef.current;
      const originalCropY = cropY / scaleFactorRef.current;
      const originalCropWidth = cropWidth / scaleFactorRef.current;
      const originalCropHeight = cropHeight / scaleFactorRef.current;

      // Store crop area pixels for reference
      const croppedAreaPixels = {
        x: originalCropX,
        y: originalCropY,
        width: originalCropWidth,
        height: originalCropHeight,
      };

      // Update crop data
      setCropData(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          croppedAreaPixels,
        },
      }));

      // Perform actual image crop
      const croppedImage = await ImageManipulator.manipulateAsync(
        imageSrc,
        [
          {
            crop: {
              originX: originalCropX,
              originY: originalCropY,
              width: originalCropWidth,
              height: originalCropHeight,
            },
          },
        ],
        {compress: 1, format: ImageManipulator.SaveFormat.JPEG},
      );

      return croppedImage.uri;
    } catch (error) {
      console.error('Error cropping image', error);
      return null;
    }
  }, [previewImageSrc, fileId, imageSrc, cropperWidth, cropperHeight]);

  // Debounced crop update
  const debouncedCropUpdate = useMemo(
    () =>
      _.debounce(async () => {
        const croppedImage = await getCroppedImage();
        if (croppedImage) {
          onCropDone(fileId, croppedImage);
        }
      }, 200),
    [fileId, getCroppedImage, onCropDone],
  );

  // Handle image zoom and pan
  const handleImageZoom = useCallback(
    cropperEvent => {
      currentScaleRef.current = cropperEvent.scale;
      panOffsetRef.current = {
        x: cropperEvent.positionX,
        y: cropperEvent.positionY,
      };
      debouncedCropUpdate();
    },
    [debouncedCropUpdate],
  );

  // Clean up
  useEffect(() => {
    return () => {
      debouncedCropUpdate.cancel();
    };
  }, [debouncedCropUpdate]);

  // Handle image load
  const handleImageLoaded = useCallback(() => {
    const loadPreviousState = async () => {
      try {
        const storedFirstTime = await AsyncStorage.getItem(`isFirst_${fileId}`);
        const isFirstTime = storedFirstTime
          ? JSON.parse(storedFirstTime)
          : true;

        if (isFirstTime) {
          // First time loading - center the image
          await AsyncStorage.setItem(
            `isFirst_${fileId}`,
            JSON.stringify(false),
          );

          // Initialize with default values
          // This would typically be calculated based on image dimensions
          currentScaleRef.current = 1;
          panOffsetRef.current = {x: 0, y: 0};

          // Trigger initial crop
          debouncedCropUpdate();
        }
      } catch (error) {
        console.error('Error handling image load', error);
      }
    };

    loadPreviousState();
  }, [fileId, debouncedCropUpdate]);

  return (
    <View style={styles.cropContainer}>
      {!isImageLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      )}

      {isImageLoaded && previewImageSrc && (
        <View style={styles.fadeIn}>
          <View style={styles.cropperHeader}>
            <Text style={styles.cropperTitle}>Crop Image</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                debouncedCropUpdate();
                if (setIsCropOpen) setIsCropOpen(false);
              }}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ImageZoom
            cropWidth={cropperWidth}
            cropHeight={cropperHeight}
            imageWidth={cropperWidth}
            imageHeight={cropperHeight}
            minScale={0.5}
            maxScale={3}
            onMove={handleImageZoom}
            onStartShouldSetPanResponder={() => true}
            style={styles.imageCropper}>
            <Image
              ref={imageRef}
              source={{uri: previewImageSrc}}
              style={{
                width: cropperWidth,
                height: cropperHeight,
              }}
              resizeMode="contain"
              onLoad={handleImageLoaded}
            />
          </ImageZoom>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cropContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    height: 500,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  fadeIn: {
    opacity: 1,
    flex: 1,
  },
  imageCropper: {
    backgroundColor: '#000',
  },
  cropperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cropperTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ImageCropper;
