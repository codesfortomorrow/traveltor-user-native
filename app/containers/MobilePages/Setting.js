import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Notification from 'react-native-vector-icons/MaterialCommunityIcons';
import Constant from '../../utils/constant';
import {setSuccess} from '../../redux/Slices/successPopup';
import {setError} from '../../redux/Slices/errorPopup';

const Setting = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {logout} = useAuth();
  const {profileLinks} = Constant();
  const badgeCount = 0; // Placeholder for badge count

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        // dispatch(cleanSuccess());
        dispatch(
          setSuccess({
            open: true,
            custom_message:
              ' logged out but we are waiting for you to start sharing your journey again.',
          }),
        );
        navigation.navigate('Home');
      }
    } catch (error) {
      dispatch(
        setError({
          open: true,
          custom_message: error,
        }),
      );
    }
  };

  const navigate = path => {
    if (path === '/notification') {
      navigation.navigate('Notification');
    } else if (path.includes('/profile/')) {
      navigation.navigate('Profile', {
        userId: user?.id,
        userType: user?.type.toLowerCase(),
      });
    } else {
      const screenName = path.split('/').pop();
      navigation.navigate(screenName);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigate('/notification')}>
          {/* <Badge visible={badgeCount > 0} size={20} style={styles.badge}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Badge> */}
          <Notification name="bell-ring-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          // onPress={() =>
          //   navigate(`/${user?.type.toLowerCase()}/profile/${user?.id}`)
          // }
        >
          <Image
            source={
              user?.profileImage
                ? {uri: `${user?.profileImage}?tr=w-200,h-200,q-100`}
                : require('../../../public/images/dpPlaceholder.png')
            }
            style={styles.profileImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user.firstname} {user.lastname}
          </Text>
          <Text style={styles.walletAmount}>
            {Number(user?.wallet?.[0]?.amount || 0)?.toLocaleString('en-US')}{' '}
            tvtor
          </Text>
        </View>
        <View style={styles.daysContainer}>
          <Text style={styles.daysCount}>
            {moment().diff(moment(user?.createdAt), 'days')}
          </Text>
          <Text style={styles.daysLabel}>Days as Treksters</Text>
        </View>
      </View>

      <View style={styles.userTypeContainer}>
        <Text style={styles.userTypeLabel}>
          {user?.type === 'User' ? 'Travelor' : user?.type}
        </Text>
      </View>

      <View style={styles.linksContainer}>
        {profileLinks?.map((item, index) => (
          <View key={index} style={styles.linkSection}>
            <Text style={styles.sectionTitle}> {item.title}</Text>
            <View>
              {item.children?.map((link, i) => (
                <TouchableOpacity
                  // onPress={() =>
                  //   link.name === 'Logout'
                  //     ? handleLogout()
                  //     : link.name === 'Blogs'
                  //     ? Linking.openURL('https://blog.traveltor.io')
                  //     : navigation.navigate(link.path)
                  // }
                  onPress={() => {
                    link?.name === 'Logout'
                      ? handleLogout()
                      : navigation.navigate(link?.path);
                  }}
                  key={i}
                  style={styles.linkButton}>
                  {link?.icon}
                  <Text style={styles.linkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
    marginBottom: 50,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E93C00',
    color: 'white',
    zIndex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
  },
  walletAmount: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysCount: {
    backgroundColor: '#FF8D65',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 26,
    fontWeight: '300',
    borderRadius: 8,
    textAlign: 'center',
  },
  daysLabel: {
    fontFamily: 'Inter-Light',
    fontSize: 10,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 12,
  },
  userTypeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    backgroundColor: '#FF8D65',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  linksContainer: {
    marginTop: 10,
  },
  linkSection: {
    borderTopWidth: 1,
    borderTopColor: '#878080',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconText: {
    fontSize: 25,
    marginRight: 8,
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  linkText: {
    fontFamily: 'Inter-Light',
    fontSize: 16,
  },
});

export default Setting;
