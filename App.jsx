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
import Community from './app/containers/links/Community';
import HowItWorks from './app/containers/links/HowItWorks';
import AlpinistProgram from './app/containers/links/AlphinistProgram';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
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
              </Stack.Navigator>
            </NavigationContainer>
            <Toast />
          </SafeAreaProvider>
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
