import React, {useEffect} from 'react';
import {SafeAreaView, View} from 'react-native';
import Header from './components/Layout/Header';
import Footer from './components/Mobile/Footer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useDispatch} from 'react-redux';
import {setLocation} from './redux/Slices/geoLocation';

const Layout = ({children}) => {
  return (
    <View>
      <Header />
      <View>{children}</View>
    </View>
  );
};

export const FooterLayout = ({children}) => {
  const dispatch = useDispatch();
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      console.log({granted}, PermissionsAndroid.RESULTS);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return result === RESULTS.GRANTED;
    }
  };

  const getLocation = async () => {
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
        console.log('Position:', position);
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

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <View
          style={{
            position: 'relative',
            flex: 1,
          }}>
          <View
            style={{
              flex: 1,
              // paddingBottom: 60,
            }}>
            {children}
          </View>
          <Footer />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Layout;
