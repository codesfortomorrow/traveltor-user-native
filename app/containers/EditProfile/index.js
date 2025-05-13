import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import UpdateProfile from './UpdateProfile';
import ChangePassword from './ChangePassword';
import Backheading from '../../components/Mobile/Backheading';

const EditProfile = () => {
  return (
    <View style={styles.container}>
      <Backheading heading={'Edit Profile'} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <UpdateProfile />
        <View style={styles.divider} />
        {/* Change password flow */}
        <ChangePassword />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0DADA',
    marginVertical: 24,
  },
});

export default EditProfile;
