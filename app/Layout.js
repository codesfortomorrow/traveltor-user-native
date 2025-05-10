import React from 'react';
import {SafeAreaView, View} from 'react-native';
import Header from './components/Layout/Header';
import Footer from './components/Mobile/Footer';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Layout = ({children}) => {
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
