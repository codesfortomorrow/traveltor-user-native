import React, {useCallback, useContext, useEffect} from 'react';
import {SafeAreaView, View} from 'react-native';
import Header from './components/Layout/Header';
import Footer from './components/Mobile/Footer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useDispatch, useSelector} from 'react-redux';
import {setLocation} from './redux/Slices/geoLocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './context/AuthContext';
import {postAuthReq} from './utils/apiHandlers';

const Layout = ({children}) => {
  const dispatch = useDispatch();
  const {isLoggedIn} = useContext(AuthContext);
  const {fcmToken} = useSelector(state => state?.firebase);

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

  const getLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      dispatch(
        setLocation({
          latitude: null,
          longitude: null,
          response: {
            code: -1,
            message: 'Geolocation permission denied or unsupported.',
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
  }, [dispatch, requestLocationPermission]);

  useEffect(() => {
    getLocation();
  }, []);

  const setFirebaseToken = async token => {
    const response = await postAuthReq('/users/notification-token', {token});
    if (!response?.status) {
      console.log(response?.error?.message);
    }
    return response;
  };

  useEffect(() => {
    const syncFCMToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('fcmToken');

        const isNewToken = savedToken !== fcmToken;

        if (isLoggedIn && fcmToken && !savedToken) {
          await AsyncStorage.setItem('fcmToken', fcmToken);
          await setFirebaseToken(fcmToken);
        } else if (isLoggedIn && fcmToken && savedToken && isNewToken) {
          const response = await setFirebaseToken(fcmToken);
          if (response?.status) {
            await AsyncStorage.setItem('fcmToken', fcmToken);
          }
        }
      } catch (err) {
        console.error('Error syncing FCM token:', err);
      }
    };

    syncFCMToken();
  }, [fcmToken, isLoggedIn]);

  return (
    <View>
      <Header />
      <View>{children}</View>
    </View>
  );
};

export const FooterLayout = ({children}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            position: 'relative',
            flex: 1,
          }}>
          <View style={{flex: 1}}>{children}</View>
          <Footer />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Layout;
