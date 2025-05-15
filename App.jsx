import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomePage from './app/containers/HomePage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {AuthProvider} from './app/context/AuthContext';
import {Provider} from 'react-redux';
import {store} from './app/redux/store';
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
import {SafeAreaView} from 'react-native';
import TrekscapeDetails from './app/containers/Trekscapes/TrekscapeDetails';
import TrekscapeFeed from './app/containers/Trekscapes/TrekscapeFeed';
import SuccessMessage from './app/components/Modal/SuccessMessage';
import ErrorMessage from './app/components/Modal/ErrorMessage';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <FeedProvider>
          <AuthProvider>
            <SafeAreaProvider>
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
                </Stack.Navigator>
              </NavigationContainer>
              <Toast />
              <SuccessMessage />
              <ErrorMessage />
            </SafeAreaProvider>
          </AuthProvider>
        </FeedProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
