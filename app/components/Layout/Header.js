import React, {useContext, useEffect, useState} from 'react';
// import {getAuthReq, isLoggedIn} from '@/utils/apiHandlers';
// import useAuth from '@/hooks/useAuth';
// import {cleanSuccess, setSuccess} from '@/redux/actions';
// import {useDispatch} from 'react-redux';
// import ReactionCounter from '../ReactionCounter';
// import InstallPWA from '@/utils/InstallPWA';
// import {setBadge} from '@/redux/slices/badgeCount';
import {TouchableOpacity, Image, StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {AuthContext} from '../../context/AuthContext';
import {getUser} from '../../redux/Slices/userSlice';

const Header = ({handleSignUp, handleSignIn}) => {
  // const isLogin = isLoggedIn();
  const {navigate} = useNavigation();
  // const {logout} = useAuth();
  const dispatch = useDispatch();
  const route = useRoute();
  const [data, setData] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const user = useSelector(state => state.user);
  const {isLoggedIn} = useContext(AuthContext);

  useEffect(() => {
    dispatch(getUser(isLoggedIn));
  }, [isLoggedIn]);

  const hiddenPaths = [
    '/profile',
    '/create-checkin',
    '/create-general-checkin',
    '/trailpoint',
    '/mobile',
    '/referral',
    '/edit-profile',
    '/wallet',
    '/trekscapes',
    '/trekscape',
    '/notification',
    '/schedule-post',
    '/trailpoint',
    '/details',
  ];
  const isHiddenPath = path => {
    return hiddenPaths.some(hiddenPath => {
      const regex = new RegExp(`^${hiddenPath.replace(':search', '.*')}$`);
      return (
        regex.test(path) ||
        path.startsWith('/trekscapes') ||
        path.startsWith('/trekscape') ||
        path.startsWith('/trekscape-feed') ||
        path.startsWith('/trailpoint') ||
        path.startsWith('/details') ||
        path.startsWith('/create-checkin') ||
        path.startsWith('/create-general-checkin')
      );
    });
  };

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        dispatch(cleanSuccess());
        dispatch(
          setSuccess({
            open: true,
            custom_message:
              ' logged out but we are waiting for you to start sharing your journey again.',
          }),
        );
        navigate('/');
      }
    } catch (error) {
      toast.error('Error', error);
    }
  };

  //   if (isHiddenPath(route.name)) {
  //     return null;
  //   }

  useEffect(() => {
    const fetchCounts = async () => {
      const res = await getAuthReq('/notifications/count');
      if (
        res?.status &&
        (res?.data?.mustGo > 0 ||
          res?.data?.comment > 0 ||
          res?.data?.newFollower > 0)
      ) {
        setData(res?.data);
        const badgeCount =
          res?.data?.mustGo + res?.data?.comment + res?.data?.newFollower;
        dispatch(setBadge(badgeCount));

        setShowTooltip(true);

        setTimeout(() => setAnimateIn(true), 50);

        setTimeout(() => setAnimateOut(true), 4500);

        setTimeout(() => {
          setShowTooltip(false);
          setAnimateIn(false);
          setAnimateOut(false);
        }, 5000);
      }
    };

    // fetchCounts();
  }, [data?.mustGo, data?.comment, data?.newFollower]);

  useEffect(() => {
    AsyncStorage.getAllKeys().then(keys => {
      AsyncStorage.multiGet(keys).then(result => {
        console.log('Stored items:', result);
      });
    });
  }, []);

  // const checkIsLoggedIn = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('__users__isLoggedIn');
  //     console.log('__users__isLoggedIn:', value);
  //   } catch (error) {
  //     console.error('Error reading isLoggedIn value:', error);
  //   }
  // };

  // useEffect(() => {
  //   checkIsLoggedIn();
  // }, []);

  return (
    <View style={style.container}>
      <Image
        style={{width: 220, height: 50, resizeMode: 'contain'}}
        source={require('../../../public/images/logo-1.png')}
      />
      <TouchableOpacity>
        <Icon name="bell-ring-outline" size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
