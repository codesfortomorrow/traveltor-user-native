import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomePage from './app/containers/HomePage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import UserProfile from './app/components/Mobile/UserProfile';
import {FooterLayout} from './app/Layout';
import Setting from './app/containers/MobilePages/Setting';
import EditProfile from './app/containers/EditProfile';
import Wallet from './app/containers/MobilePages/Wallet';
import ComingSoon from './app/containers/MobilePages/ComingSoon';
import MyActivity from './app/containers/MobilePages/MyActivity';
import Referral from './app/containers/MobilePages/Referral';
import Community from './app/containers/Links/Community';
import HowItWorks from './app/containers/Links/HowItWorks';
import AlpinistProgram from './app/containers/Links/AlphinistProgram';
import {FeedProvider} from './app/context/FeedContext';
import MyFeeds from './app/containers/MobilePages/MyFeeds';
import Trekscapes from './app/containers/Trekscapes/Trekscapes';
import Notification from './app/containers/MobilePages/Notification';
import TrekscapeDetails from './app/containers/Trekscapes/TrekscapeDetails';
import TrekscapeFeed from './app/containers/Trekscapes/TrekscapeFeed';
import SuccessMessage from './app/components/Modal/SuccessMessage';
import ErrorMessage from './app/components/Modal/ErrorMessage';
import TrailpointDetails from './app/containers/Trailpoint/TrailpointDetails';
import TrailpointReview from './app/containers/Trailpoint/TrailpointReview';
import SingleCheckIn from './app/containers/MobilePages/SingleCheckIn';
import GeneralCheckIn from './app/containers/GeneralCheckIn';
import {Provider as PaperProvider} from 'react-native-paper';
import {requestUserPermission} from './app/notifications/NotificationService';
import {useForegroundNotification} from './app/notifications/ForegroundHandler';
import {useNotificationRedirect} from './app/notifications/NotificationRedirect';
import ForegroundToast from './app/components/FirebaseToaster/ForegroundToast';
import {AuthContext} from './app/context/AuthContext';
import {setupBackgroundTasks} from './app/utils/Setup';
import TrailpointCheckIn from './app/containers/TrailpointCheckIn';
import {initBackgroundTask} from './app/utils/BackgroundTaskService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './app/NoInternet';
import {Buffer} from 'buffer';
global.Buffer = Buffer;

import process from 'process';
global.process = process;

const Stack = createNativeStackNavigator();

const SESSION_KEYS = [
  'categoryScrollPosition',
  'categoryId',
  'pageNumber',
  'hasMore',
  'feedScrollPos',
  'refresh',
  'reloaded',
  'feedScrollPos',
  'croppedImages',
  'cropData',
];

const clearSessionKeys = async () => {
  try {
    await AsyncStorage.multiRemove(SESSION_KEYS);
    console.log('Session keys cleared on app start');
  } catch (e) {
    console.log('Error clearing session keys', e);
  }
};

function App() {
  const [isConnected, setIsConnected] = useState(true);
  const {isLoggedIn} = useContext(AuthContext);
  const dispatch = useDispatch();
  useForegroundNotification();
  useNotificationRedirect();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return <NoInternet />;
  }

  useEffect(() => {
    if (isLoggedIn) {
      initBackgroundTask();
      setupBackgroundTasks();
      requestUserPermission(dispatch);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    clearSessionKeys();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <FeedProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1, backgroundColor: '#e5e7eb'}}>
            <PaperProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                  <Stack.Screen
                    name="Home"
                    component={HomePage}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Profile"
                    children={() => (
                      <FooterLayout>
                        <UserProfile />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Setting"
                    children={() => (
                      <FooterLayout>
                        <Setting />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="EditProfile"
                    children={() => (
                      <FooterLayout>
                        <EditProfile />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Wallet"
                    children={() => (
                      <FooterLayout>
                        <Wallet />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="ComingSoon"
                    children={() => (
                      <FooterLayout>
                        <ComingSoon />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="MyActivity"
                    children={() => (
                      <FooterLayout>
                        <MyActivity />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Referral"
                    children={() => (
                      <FooterLayout>
                        <Referral />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Community"
                    children={() => (
                      <FooterLayout>
                        <Community />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="HowItWorks"
                    children={() => (
                      <FooterLayout>
                        <HowItWorks />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="AlpinistProgram"
                    children={() => (
                      <FooterLayout>
                        <AlpinistProgram />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="MyFeeds"
                    children={() => (
                      <FooterLayout>
                        <MyFeeds />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Trekscapes"
                    children={() => (
                      <FooterLayout>
                        <Trekscapes />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Notification"
                    children={() => (
                      <FooterLayout>
                        <Notification />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TrekscapeDetail"
                    children={() => (
                      <FooterLayout>
                        <TrekscapeDetails />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TrekscapeFeed"
                    children={() => (
                      <FooterLayout>
                        <TrekscapeFeed />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TrailpointDetails"
                    children={() => (
                      <FooterLayout>
                        <TrailpointDetails />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TrailpointReview"
                    children={() => (
                      <FooterLayout>
                        <TrailpointReview />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="SingleCheckIn"
                    children={() => (
                      <FooterLayout>
                        <SingleCheckIn />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="GeneralCheckIn"
                    children={() => (
                      <FooterLayout>
                        <GeneralCheckIn />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TrailpointCheckIn"
                    children={() => (
                      <FooterLayout>
                        <TrailpointCheckIn />
                      </FooterLayout>
                    )}
                    options={{headerShown: false}}
                  />
                </Stack.Navigator>
              </NavigationContainer>
              <Toast
                config={{
                  customNotification: ({props}) => (
                    <ForegroundToast {...props} />
                  ),
                }}
              />
              <SuccessMessage />
              <ErrorMessage />
            </PaperProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </FeedProvider>
    </GestureHandlerRootView>
  );
}

export default App;
