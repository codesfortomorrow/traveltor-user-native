import messaging from '@react-native-firebase/messaging';
import {setToken} from '../redux/Slices/firebase';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

export const requestUserPermission = async dispatch => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);
    dispatch(setToken(fcmToken));
    return fcmToken;
  }
  return null;
};

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('🔔 Notification permission granted');
    } else {
      Alert.alert(
        'Permission Denied',
        'Cannot show notifications without permission.',
      );
      console.log('🚫 Notification permission denied');
    }
  }
};
