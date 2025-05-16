import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView, View, StyleSheet} from 'react-native';
import HeroSection from '../../Home/HeroSection';
import TrekScapes from '../../Home/TrekScapes';
import Trailblazers from '../../Home/Trailblazers';
import Layout, {FooterLayout} from '../../Layout';

const HomePage = () => {
  return (
    <View style={styles.container}>
      <FooterLayout>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Layout>
            <HeroSection />
          </Layout>
          <TrekScapes />
          <Trailblazers />
        </ScrollView>
      </FooterLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
});

export default HomePage;
