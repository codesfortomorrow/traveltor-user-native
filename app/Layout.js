import React from 'react';
import {View} from 'react-native';
import Header from './components/Layout/Header';
import Footer from './components/Mobile/Footer';

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
    <View>
      <View>{children}</View>
      <Footer />
    </View>
  );
};

export default Layout;
