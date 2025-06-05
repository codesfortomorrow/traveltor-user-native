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
import {
  requestUserPermission,
  requestNotificationPermission,
} from './app/notifications/NotificationService';
import {useForegroundNotification} from './app/notifications/ForegroundHandler';
import ForegroundToast from './app/components/FirebaseToaster/ForegroundToast';
import {AuthContext} from './app/context/AuthContext';
import {setupBackgroundTasks} from './app/utils/Setup';
import TrailpointCheckIn from './app/containers/TrailpointCheckIn';
import {initBackgroundTask} from './app/utils/BackgroundTaskService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './app/NoInternet';
import {navigationRef} from './app/notifications/RootNavigation';
import {Buffer} from 'buffer';
global.Buffer = Buffer;

import process from 'process';
global.process = process;

const Stack = createNativeStackNavigator();

const SESSION_KEYS = [
  'categoryScrollPosition',
  'categoryId',
  'refresh',
  'reloaded',
  'croppedImages',
  'cropData',
];

const clearSessionKeys = async () => {
  try {
    await AsyncStorage.multiRemove(SESSION_KEYS);
  } catch (e) {
    console.log('Error clearing session keys', e);
  }
};

// Screens that should NOT have footer (if any)
const SCREENS_WITHOUT_FOOTER = [
  // Add screen names here if you want to exclude them from having footer
  // Example: 'SomeModalScreen', 'FullScreenView'
];

// Higher-order component to wrap screens with FooterLayout conditionally
const withFooterLayout = (Component, screenName) => {
  const WrappedComponent = React.memo(props => {
    const shouldShowFooter = !SCREENS_WITHOUT_FOOTER.includes(screenName);

    if (shouldShowFooter) {
      return (
        <FooterLayout>
          <Component {...props} />
        </FooterLayout>
      );
    }

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withFooterLayout(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WrappedComponent;
};

// Wrapped components with FooterLayout
const WrappedComponents = {
  HomePage: withFooterLayout(HomePage, 'Home'),
  UserProfile: withFooterLayout(UserProfile, 'Profile'),
  Setting: withFooterLayout(Setting, 'Setting'),
  EditProfile: withFooterLayout(EditProfile, 'EditProfile'),
  Wallet: withFooterLayout(Wallet, 'Wallet'),
  ComingSoon: withFooterLayout(ComingSoon, 'ComingSoon'),
  MyActivity: withFooterLayout(MyActivity, 'MyActivity'),
  Referral: withFooterLayout(Referral, 'Referral'),
  Community: withFooterLayout(Community, 'Community'),
  HowItWorks: withFooterLayout(HowItWorks, 'HowItWorks'),
  AlpinistProgram: withFooterLayout(AlpinistProgram, 'AlpinistProgram'),
  MyFeeds: withFooterLayout(MyFeeds, 'MyFeeds'),
  Trekscapes: withFooterLayout(Trekscapes, 'Trekscapes'),
  Notification: withFooterLayout(Notification, 'Notification'),
  TrekscapeDetails: withFooterLayout(TrekscapeDetails, 'TrekscapeDetail'),
  TrekscapeFeed: withFooterLayout(TrekscapeFeed, 'TrekscapeFeed'),
  TrailpointDetails: withFooterLayout(TrailpointDetails, 'TrailpointDetails'),
  TrailpointReview: withFooterLayout(TrailpointReview, 'TrailpointReview'),
  SingleCheckIn: withFooterLayout(SingleCheckIn, 'SingleCheckIn'),
  GeneralCheckIn: withFooterLayout(GeneralCheckIn, 'GeneralCheckIn'),
  TrailpointCheckIn: withFooterLayout(TrailpointCheckIn, 'TrailpointCheckIn'),
};

function App() {
  const [isConnected, setIsConnected] = useState(true);
  const {isLoggedIn} = useContext(AuthContext);
  const dispatch = useDispatch();
  useForegroundNotification();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      initBackgroundTask();
      setupBackgroundTasks();
      requestUserPermission(dispatch);
      requestNotificationPermission();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    clearSessionKeys();
  }, []);

  if (!isConnected) {
    return <NoInternet />;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <FeedProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            <PaperProvider>
              <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={{
                    headerShown: false,
                  }}>
                  <Stack.Screen
                    name="Home"
                    component={WrappedComponents.HomePage}
                  />
                  <Stack.Screen
                    name="Profile"
                    component={WrappedComponents.UserProfile}
                  />
                  <Stack.Screen
                    name="Setting"
                    component={WrappedComponents.Setting}
                  />
                  <Stack.Screen
                    name="EditProfile"
                    component={WrappedComponents.EditProfile}
                  />
                  <Stack.Screen
                    name="Wallet"
                    component={WrappedComponents.Wallet}
                  />
                  <Stack.Screen
                    name="ComingSoon"
                    component={WrappedComponents.ComingSoon}
                  />
                  <Stack.Screen
                    name="MyActivity"
                    component={WrappedComponents.MyActivity}
                  />
                  <Stack.Screen
                    name="Referral"
                    component={WrappedComponents.Referral}
                  />
                  <Stack.Screen
                    name="Community"
                    component={WrappedComponents.Community}
                  />
                  <Stack.Screen
                    name="HowItWorks"
                    component={WrappedComponents.HowItWorks}
                  />
                  <Stack.Screen
                    name="AlpinistProgram"
                    component={WrappedComponents.AlpinistProgram}
                  />
                  <Stack.Screen
                    name="MyFeeds"
                    component={WrappedComponents.MyFeeds}
                  />
                  <Stack.Screen
                    name="Trekscapes"
                    component={WrappedComponents.Trekscapes}
                  />
                  <Stack.Screen
                    name="Notification"
                    component={WrappedComponents.Notification}
                  />
                  <Stack.Screen
                    name="TrekscapeDetail"
                    component={WrappedComponents.TrekscapeDetails}
                  />
                  <Stack.Screen
                    name="TrekscapeFeed"
                    component={WrappedComponents.TrekscapeFeed}
                  />
                  <Stack.Screen
                    name="TrailpointDetails"
                    component={WrappedComponents.TrailpointDetails}
                  />
                  <Stack.Screen
                    name="TrailpointReview"
                    component={WrappedComponents.TrailpointReview}
                  />
                  <Stack.Screen
                    name="SingleCheckIn"
                    component={WrappedComponents.SingleCheckIn}
                  />
                  <Stack.Screen
                    name="GeneralCheckIn"
                    component={WrappedComponents.GeneralCheckIn}
                  />
                  <Stack.Screen
                    name="TrailpointCheckIn"
                    component={WrappedComponents.TrailpointCheckIn}
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
