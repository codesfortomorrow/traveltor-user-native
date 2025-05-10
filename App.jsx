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
