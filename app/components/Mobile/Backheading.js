import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Notification from 'react-native-vector-icons/MaterialCommunityIcons';
import {setError} from '../../redux/Slices/errorPopup';
import {isLoggedIn} from '../../utils/tokenStorage';
import CheckIn from '../../../public/images/mobtrekscape/checkin.svg';
import Filter from 'react-native-vector-icons/AntDesign';

const Backheading = ({
  heading,
  handleFilter,
  addFilter,
  subHeading,
  loading = false,
  notifyIcon = false,
  setting = false,
  nextTrip = false,
  CheckInPoint = false,
  trailPoints,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  //   const { badgeCount } = useSelector((state) => state.badgeSlice);

  const renderSkeleton = (width, height) => {
    return <View style={[styles.skeleton, {width, height}]} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#000" />
        </TouchableOpacity>
        {loading ? (
          renderSkeleton(150, 30)
        ) : (
          <Text
            style={styles.headingText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {heading}
          </Text>
        )}
      </View>

      {addFilter && (
        <TouchableOpacity onPress={handleFilter} style={styles.filterButton}>
          <Filter name="filter" size={24} color="#000" />
        </TouchableOpacity>
      )}

      {subHeading && (
        <View style={styles.subHeadingContainer}>
          {loading ? (
            renderSkeleton(100, 20)
          ) : (
            <Text style={styles.subHeadingText}>{subHeading}</Text>
          )}
        </View>
      )}

      {(nextTrip || notifyIcon) && (
        <View style={styles.rightIconsContainer}>
          {nextTrip && (
            <TouchableOpacity
              onPress={() => navigation.navigate('NearbyPlaces')}
              style={styles.nearbyButton}>
              <Compass width={16} height={16} color="#E93C00" />
              <Text style={styles.nearbyText}>Nearby Destinations</Text>
            </TouchableOpacity>
          )}

          {notifyIcon && (
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() => navigation.navigate('Notification')}>
              {/* <Badge count={0} style={styles.badge}>
                <NotificationsActiveIcon size={30} />
              </Badge> */}
              <Notification name="bell-ring-outline" size={26} color="black" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {setting && route.name === 'Profile' && (
        <View style={styles.settingsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            {/* <Badge
              count={0}
              style={styles.badge}>
              <NotificationsActiveIcon size={30} />
            </Badge> */}
            <Notification name="bell-ring-outline" size={28} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
            <Icon name="settings-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {CheckInPoint && (
        <View style={styles.topBarRight}>
          <Text style={styles.checkInCount}>
            {trailPoints?._count?.checkIn || 0} Check In
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (isLoggedIn()) {
                navigation.navigate('TrailpointCheckIn', {
                  id: trailPoints?.slug,
                  trailpointId: trailPoints?.id,
                });
              } else {
                dispatch(
                  setError({
                    open: true,
                    custom_message: 'Please login first to check in this place',
                  }),
                );
              }
            }}>
            <CheckIn width={24} height={24} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: 'white',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android shadow
    elevation: 8,

    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  headingText: {
    fontFamily: 'Inter',
    fontSize: 18,
    textTransform: 'capitalize',
    maxWidth: 290,
    overflow: 'hidden',
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    fontSize: 24,
    color: 'black',
  },
  subHeadingContainer: {
    justifyContent: 'center',
  },
  subHeadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E93C00',
    fontFamily: 'Inter',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nearbyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notificationIcon: {
    padding: 4,
  },
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#E93C00',
    color: 'white',
  },
  skeleton: {
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginVertical: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkInCount: {
    fontFamily: 'Jakarta',
    fontWeight: '500',
    fontSize: 10,
  },
});

export default Backheading;
