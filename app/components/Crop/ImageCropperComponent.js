import React, {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {ImageEditor} from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const ImageCropper = ({fileId, originalFile, imageSrc, onCropDone}) => {
  console.log({fileId, originalFile, imageSrc, onCropDone});
  // Define crop dimensions
  const cropBoxWidth = Math.min(300, screenWidth - 40);
  const cropBoxHeight = 400;
  const aspectRatio = cropBoxWidth / cropBoxHeight;

  // Animated values for gestures
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const minZoomRef = useRef(1);

  // State variables
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({width: 0, height: 0});
  const scaleFactorRef = useRef(1);
  const debouncedCropDoneRef = useRef();

  // Store crop data
  const [cropData, setCropData] = useState({});
  const [previewImageSrc, setPreviewImageSrc] = useState(imageSrc);

  // Initialize AsyncStorage
  useEffect(() => {
    const loadStoredCropData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('cropData');
        if (storedData) {
          setCropData(JSON.parse(storedData));
        }
      } catch (error) {
        console.log('Error loading stored crop data:', error);
      }
    };

    loadStoredCropData();
  }, []);

  // Save crop data to AsyncStorage when it changes
  useEffect(() => {
    const saveCropData = async () => {
      try {
        await AsyncStorage.setItem('cropData', JSON.stringify(cropData));
      } catch (error) {
        console.log('Error saving crop data:', error);
      }
    };

    saveCropData();
  }, [cropData]);

  // Generate a preview of the image
  const generatePreviewImage = async (uri, maxWidth = 1000) => {
    try {
      // Get image dimensions
      const {width, height} = await new Promise((resolve, reject) => {
        Image.getSize(uri, (width, height) => resolve({width, height}), reject);
      });

      // Calculate scale factor
      const scaleFactor = Math.min(maxWidth / width, 1);
      scaleFactorRef.current = scaleFactor;

      // For simplicity, we'll just return the original URI in this version
      return {previewUrl: uri, scale: scaleFactor};
    } catch (error) {
      console.error('Error generating preview image:', error);
      return {previewUrl: uri, scale: 1};
    }
  };

  // Load and prepare the image
  useEffect(() => {
    let isMounted = true;

    const prepareImage = async () => {
      if (imageSrc) {
        try {
          const {previewUrl, scale: previewScale} = await generatePreviewImage(
            imageSrc,
          );

          console.log({previewUrl, previewScale});

          if (isMounted) {
            setPreviewImageSrc(previewUrl);
            scaleFactorRef.current = previewScale;

            // Get image dimensions
            Image.getSize(previewUrl, (width, height) => {
              console.log({previewUrl, width, height});
              if (isMounted) {
                setImageSize({width, height});
                setIsImageLoaded(true);

                // Calculate initial zoom to fit
                const imageRatio = width / height;
                const zoomToFit =
                  imageRatio > aspectRatio
                    ? cropBoxHeight / height
                    : cropBoxWidth / width;

                minZoomRef.current = zoomToFit;
                scale.value = zoomToFit;
                savedScale.value = zoomToFit;

                // Initialize or restore stored crop settings
                const storedData = cropData[fileId];
                if (storedData) {
                  scale.value = storedData.zoom;
                  savedScale.value = storedData.zoom;
                  translateX.value = storedData.crop.x;
                  translateY.value = storedData.crop.y;
                } else {
                  // Center the image
                  translateX.value = 0;
                  translateY.value = 0;

                  setCropData(prev => ({
                    ...prev,
                    [fileId]: {
                      crop: {x: 0, y: 0},
                      zoom: zoomToFit,
                      minZoom: zoomToFit,
                      croppedAreaPixels: null,
                    },
                  }));
                }
              }
            });
          }
        } catch (error) {
          console.error('Error preparing image:', error);
          if (isMounted) setIsImageLoaded(true);
        }
      }
    };

    prepareImage();

    return () => {
      isMounted = false;
    };
  }, [imageSrc, fileId]);

  // Set up debounced crop function
  useEffect(() => {
    debouncedCropDoneRef.current = _.debounce((fileId, croppedImage) => {
      onCropDone(fileId, croppedImage);
    }, 300);

    return () => {
      if (debouncedCropDoneRef.current) {
        debouncedCropDoneRef.current.cancel();
      }
    };
  }, [onCropDone]);

  // Process the crop area and generate cropped image
  const processCrop = useCallback(async () => {
    if (!isImageLoaded || !imageSrc) return;

    // Get current values safely outside of render
    const currentScale = scale.value;
    const currentTranslateX = translateX.value;
    const currentTranslateY = translateY.value;

    // Calculate crop area in pixels
    const cropWidth = cropBoxWidth / currentScale;
    const cropHeight = cropBoxHeight / currentScale;

    // Calculate the center of the image and visible area
    const centerX = imageSize.width / 2;
    const centerY = imageSize.height / 2;

    // Calculate the crop coordinates
    const cropX = centerX - currentTranslateX / currentScale - cropWidth / 2;
    const cropY = centerY - currentTranslateY / currentScale - cropHeight / 2;

    const croppedAreaPixels = {
      x: Math.max(0, cropX),
      y: Math.max(0, cropY),
      width: cropWidth,
      height: cropHeight,
    };

    // Save crop data
    setCropData(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        crop: {x: currentTranslateX, y: currentTranslateY},
        zoom: currentScale,
        croppedAreaPixels,
      },
    }));

    // Generate cropped image using React Native's ImageEditor
    try {
      const cropData = {
        offset: {
          x: croppedAreaPixels.x / scaleFactorRef.current,
          y: croppedAreaPixels.y / scaleFactorRef.current,
        },
        size: {
          width: croppedAreaPixels.width / scaleFactorRef.current,
          height: croppedAreaPixels.height / scaleFactorRef.current,
        },
        displaySize: {
          width: croppedAreaPixels.width / scaleFactorRef.current,
          height: croppedAreaPixels.height / scaleFactorRef.current,
        },
        resizeMode: 'contain',
      };

      const croppedImageURI = await ImageEditor.cropImage(
        originalFile || imageSrc,
        cropData,
      );

      console.log({croppedImageURI});

      // Call the crop done callback
      if (debouncedCropDoneRef.current) {
        debouncedCropDoneRef.current(fileId, croppedImageURI);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [
    fileId,
    imageSrc,
    isImageLoaded,
    imageSize,
    scale,
    translateX,
    translateY,
    originalFile,
    cropBoxWidth,
    cropBoxHeight,
  ]);

  // Debounced crop function
  const debouncedProcessCrop = useMemo(
    () => _.debounce(processCrop, 200),
    [processCrop],
  );

  // Clean up
  useEffect(() => {
    return () => {
      debouncedProcessCrop.cancel();
    };
  }, [debouncedProcessCrop]);

  // Set up gesture handlers using the new API
  const panGesture = Gesture.Pan()
    .minDistance(10) // Add a minimum distance to prevent accidental pans
    .maxPointers(1) // Limit to single finger pan
    .onStart(() => {
      // No additional setup needed
    })
    .onUpdate(event => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(debouncedProcessCrop)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // Save the current scale when starting a new pinch
      savedScale.value = scale.value;
      // Store the focal point
      focalX.value = 0;
      focalY.value = 0;
    })
    .onUpdate(event => {
      // Apply scaling but ensure it doesn't go below minimum zoom
      scale.value = Math.max(
        minZoomRef.current,
        savedScale.value * event.scale,
      );

      // Calculate focal point adjustment for zooming in/out at the pinch point
      // These are the deltas from the center of the pinch
      const deltaX = event.focalX - cropBoxWidth / 2;
      const deltaY = event.focalY - cropBoxHeight / 2;

      // Only update focal adjustments on first update to prevent continuous focal point shifting
      if (focalX.value === 0 && focalY.value === 0) {
        focalX.value = deltaX;
        focalY.value = deltaY;
      }

      // Adjust translation to maintain the focal point during zoom
      const pinchAdjustmentX = focalX.value * (1 - event.scale);
      const pinchAdjustmentY = focalY.value * (1 - event.scale);

      // Apply small adjustments during pinch to maintain focal point
      translateX.value += pinchAdjustmentX * 0.05;
      translateY.value += pinchAdjustmentY * 0.05;
    })
    .onEnd(() => {
      runOnJS(debouncedProcessCrop)();
    });

  // Create a composite gesture that allows pan and pinch to work together
  const gesture = Gesture.Race(panGesture, pinchGesture);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translateX.value},
        {translateY: translateY.value},
        {scale: scale.value},
      ],
    };
  });

  // If the image is not loaded yet, show a loading indicator
  if (!isImageLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading image...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View
        style={[
          styles.cropContainer,
          {width: cropBoxWidth, height: cropBoxHeight},
        ]}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={styles.imageContainer}>
            <Animated.Image
              source={{uri: previewImageSrc}}
              style={[
                styles.image,
                {width: imageSize.width, height: imageSize.height},
                animatedImageStyle,
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>

        {/* Overlay to show crop area */}
        <View style={styles.cropOverlay}>
          <View style={styles.cropBox} />
        </View>
      </View>
      {/* Optional: Debug information - commented out to avoid the shared value warning */}
      {/* 
  <View style={styles.debugInfo}>
    <Text>Scale: {scale._value.toFixed(2)}</Text>
    <Text>TranslateX: {translateX._value.toFixed(0)}</Text>
    <Text>TranslateY: {translateY._value.toFixed(0)}</Text>
  </View>
  */}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropContainer: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#000',
  },
  loadingContainer: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  cropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropBox: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 5,
  },
});

export default ImageCropper;
