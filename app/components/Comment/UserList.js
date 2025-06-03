import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Constant from '../../utils/constant';

const UserList = ({users, selectUser, userlistref}) => {
  const {optimizeImageKitUrl} = Constant();
  return (
    <ScrollView
      ref={userlistref}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      overScrollMode="never"
      onTouchStart={e => e.stopPropagation()}>
      {users &&
        users?.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.userRow}
            onPress={() => selectUser(user?.username)}>
            <View style={styles.profileImageContainer}>
              <FastImage
                source={
                  user?.profileImage
                    ? {uri: optimizeImageKitUrl(user?.profileImage, 200, 200)}
                    : require('../../../public/images/dpPlaceholder.png')
                }
                style={styles.profileImage}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstname} {user?.lastname}
              </Text>
              <Text style={styles.userHandle}>{user?.username}</Text>
            </View>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16, // equivalent to px-4
    marginTop: 24, // equivalent to mt-6
    maxHeight: '95%',
  },
  contentContainer: {
    paddingBottom: 20, // equivalent to pb-[60px]
    gap: 8, // equivalent to gap-2
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // equivalent to gap-2
    marginBottom: 8, // equivalent to mb-2
  },
  profileImageContainer: {
    width: 30,
    height: 30,
    borderRadius: 15, // making it rounded (half of width/height)
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    color: '#000000', // text-black
    fontSize: 14, // text-sm
    fontWeight: '600', // font-semibold
  },
  userHandle: {
    color: '#64748b', // text-slate-700
    fontSize: 12, // text-xs
    fontWeight: '400', // font-normal
  },
});

export default UserList;
