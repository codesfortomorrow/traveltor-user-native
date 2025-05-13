import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import useAuth from '../../hooks/useAuth';
import Constant from '../../utils/constant';

const UploadProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user);
  const {uploadImage, uploadProfile} = useAuth();
  const {requestStoragePermission} = Constant();

  const handlePickImage = async () => {
    const hasPermission = await requestStoragePermission();
    console.log(hasPermission, 'hasPermission');
    if (!hasPermission) {
      // Toast.show({
      //   type: 'error',
      //   text1: 'Permission denied',
      // });
      return;
    }

    const result = await launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      async response => {
        console.log(response, 'response');
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: response.errorMessage || 'Image picker error',
          });
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.fileSize > 15728640) {
          Toast.show({
            type: 'error',
            text1: 'File size should not exceed 15MB',
          });
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
          if (res && res[0]?.url !== '') {
            await uploadProfile({
              profileImage: res[0]?.meta?.filename,
            });
          } else {
            Toast.show({type: 'error', text1: res?.error?.message});
          }
        } catch (err) {
          console.log(err);
        }
      },
    );
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileImageContainer}>
        <Image
          source={
            user?.profileImage
              ? {uri: user?.profileImage}
              : require('../../../public/images/profile.png')
          }
          style={styles.profileImage}
        />
      </View>
      <TouchableOpacity
        style={styles.uploadContainer}
        onPress={handlePickImage}>
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
});

export default UploadProfile;
