import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAuth from '../../hooks/useAuth';

const {width, height} = Dimensions.get('window');

const FeedReactionList = ({
  open,
  onClose,
  list,
  type,
  isLoading,
  setReactionData,
}) => {
  const userDetails = useSelector(state => state?.user);
  const navigation = useNavigation();
  const [followUnfollow, setFollowUnfollow] = useState({});
  const {userFollowUnFollow} = useAuth();
  const isMobile = width <= 768;

  // Animation values for the drawer
  const [pan] = useState(new Animated.ValueXY());
  const [drawerHeight] = useState(height * 0.6);

  // Custom drawer animation
  useEffect(() => {
    if (open) {
      Animated.spring(pan.y, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(pan.y, {
        toValue: drawerHeight,
        useNativeDriver: true,
      }).start();
    }
  }, [open, drawerHeight, pan.y]);

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        pan.y.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(pan.y, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Navigate to user profile
  const navigateToProfile = (userType, userId) => {
    navigation.navigate('Profile', {
      userType: userType,
      id: userId,
    });
    onClose();
  };

  const handleFollowUnFollow = async (userId, id) => {
    setFollowUnfollow(prev => ({
      ...prev,
      [id]: true,
    }));
    const response = await userFollowUnFollow(userId);
    if (response?.status) {
      if (response?.status && response?.data?.hasOwnProperty('follow')) {
        const isNowFollowed = response.data.follow;
        setReactionData(prev =>
          prev?.map(item =>
            item?.id === id ? {...item, isFollowed: isNowFollowed} : item,
          ),
        );
        setFollowUnfollow(prev => ({
          ...prev,
          [id]: false,
        }));
      } else {
        setFollowUnfollow(prev => ({
          ...prev,
          [id]: false,
        }));
        console.log('Failed to follow or unfollow');
      }
    }
  };

  if (!open) return null;

  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.closeArea} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{translateY: pan.y}],
              height: drawerHeight,
              width: isMobile ? '100%' : 393,
            },
          ]}
          {...panResponder.panHandlers}>
          <View style={styles.drawerHandle} />

          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{type}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#e93c00" />
              </View>
            ) : list?.length > 0 ? (
              list?.map(user => (
                <View key={user.id} style={styles.userItemContainer}>
                  <View style={styles.userDetailContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        navigateToProfile(user?.user?.type, user?.user?.id)
                      }>
                      <Image
                        source={{uri: user?.user?.profileImage}}
                        style={styles.avatar}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.userInfo}
                      onPress={() =>
                        navigateToProfile(user?.user?.type, user?.user?.id)
                      }>
                      <Text numberOfLines={1} style={styles.username}>
                        {user?.user?.username}
                      </Text>
                      <Text numberOfLines={1} style={styles.fullName}>
                        {user?.user?.firstname} {user?.user?.lastname}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {userDetails?.id !== user?.user?.id && (
                    <TouchableWithoutFeedback
                      disabled={followUnfollow[user?.id]}
                      onPress={() =>
                        handleFollowUnFollow(user?.user?.id, user?.id)
                      }>
                      <View
                        style={[
                          styles.followButton,
                          user?.isFollowed
                            ? styles.unfollowButton
                            : styles.followActiveButton,
                        ]}>
                        {followUnfollow[user?.id] ? (
                          <ActivityIndicator
                            size="small"
                            color={user?.isFollowed ? '#e93c00' : '#FFFFFF'}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.followButtonText,
                              user?.isFollowed
                                ? styles.unfollowButtonText
                                : styles.followActiveButtonText,
                            ]}>
                            {user?.isFollowed ? 'Unfollow' : 'Follow'}
                          </Text>
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No {type?.toLowerCase()} yet
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeArea: {
    flex: 1,
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'center',
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  listContainer: {
    marginTop: 10,
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    width: '100%',
  },
  userDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  fullName: {
    fontSize: 12,
    color: '#6B7280',
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 32,
    minWidth: 80,
    maxWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followActiveButton: {
    backgroundColor: '#e93c00',
  },
  unfollowButton: {
    backgroundColor: '#D1D5DB', // slate-300 equivalent
  },
  followButtonText: {
    fontSize: 13,
  },
  followActiveButtonText: {
    color: '#FFFFFF',
  },
  unfollowButtonText: {
    color: '#000000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    height: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default FeedReactionList;
