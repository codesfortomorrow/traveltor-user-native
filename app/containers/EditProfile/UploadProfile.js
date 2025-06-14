import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import useAuth from '../../hooks/useAuth';
import {AuthContext} from '../../context/AuthContext';
import {getUser} from '../../redux/Slices/userSlice';
import Constant from '../../utils/constant';
import FastImage from 'react-native-fast-image';

const UploadProfile = () => {
  const user = useSelector(state => state?.user);
  const {uploadImage, uploadProfile} = useAuth();
  const dispatch = useDispatch();
  const {isLoggedIn} = useContext(AuthContext);
  const {optimizeImageKitUrl} = Constant();
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    setIsUploading(true);

    const options = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
      includeBase64: false,
    };

    const result = await launchImageLibrary(options);
    if (result.didCancel) {
      setIsUploading(false);
      return;
    }

    if (result.errorCode) {
      Toast.show({
        type: 'error',
        text1: result.errorMessage || 'Image picker error',
      });
      setIsUploading(false);
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.fileSize > 15728640) {
      Toast.show({
        type: 'error',
        text1: 'File size should not exceed 15MB',
      });
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.type,
      name: asset.fileName || 'profile-image.jpg',
    });

    try {
      const res = await uploadImage(formData);
      if (res && res?.url !== '') {
        await uploadProfile({
          profileImage: res?.meta?.filename,
        });
        dispatch(getUser(isLoggedIn));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileImageContainer}>
        <FastImage
          source={
            user?.profileImage
              ? {uri: optimizeImageKitUrl(user?.profileImage, 200, 200)}
              : require('../../../public/images/profile.png')
          }
          style={styles.profileImage}
        />
      </View>
      <TouchableOpacity
        style={styles.uploadContainer}
        disabled={isUploading}
        onPress={handlePickImage}>
        {!isUploading ? (
          <>
            <View style={styles.uploadContent}>
              <Image
                source={require('../../../public/images/icons/upload.png')}
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadTitle}>Change your avatar</Text>
            </View>
            <Text style={styles.uploadDescription}>
              Tap here to upload and update your profile picture.
            </Text>
          </>
        ) : (
          <View style={styles.isUploading}>
            <ActivityIndicator size="small" color="#e93c00" />
            <Text>Uploading...</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 56,
    height: 56,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  uploadContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'black',
    padding: 8,
    flex: 1,
    height: 58,
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadIcon: {
    width: 24,
    height: 24,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '300',
  },
  uploadDescription: {
    fontSize: 10,
    fontWeight: '300',
  },
  isUploading: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 'auto',
    paddingHorizontal: 4,
  },
});

export default UploadProfile;
