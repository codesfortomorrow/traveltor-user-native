import messaging from '@react-native-firebase/messaging';
import {setToken} from '../redux/Slices/firebase';

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
