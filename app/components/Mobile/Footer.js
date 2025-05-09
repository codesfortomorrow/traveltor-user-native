import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Constant from '../../utils/constant';
import {useRoute} from '@react-navigation/native';
import Login from '../Modal/Login';
import Signup from '../Signup';
import Menu from '../../containers/MobilePages/Menu';
import CheckInIcon from '../../../public/images/footer/footerCheckinIcon.svg';
import {AuthContext} from '../../context/AuthContext';
import useAuth from '../../hooks/useAuth';

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const {loginItems, logoutItems} = Constant();
  const [menuItems, setMenuItems] = useState(null);
  const route = useRoute();
  const {logout} = useAuth();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const {isLoggedIn} = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      setMenuItems(loginItems);
    } else {
      setMenuItems(logoutItems);
    }
  }, [isLoggedIn]);

  const isActive = (path, children) => {
    return false;
  };

  const handleSignIn = async item => {
    if (item.title === 'Menu') {
      setIsOpen(true);
    } else if (item.title === 'MyFeeds') {
      await logout();
    } else {
      setIsLoginOpen(true);
    }
  };

  const moveToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const moveToSignup = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 300,
          easing: Easing.bezier(0.8, 0, 1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  return (
    <>
      <View style={styles.footerContainer}>
        {menuItems?.map((item, index) => {
          const active = isActive(item.path, item.children);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSignIn(item)}
              // onPress={() => {
              //   if (item?.title === 'Log In') {
              //     handleSignIn();
              //   } else if (item?.title === 'Menu') {
              //     setIsOpen(true);
              //   } else if (item?.title == 'Profile' && user?.id) {
              //     navigate(`/${user?.type?.toLowerCase()}/profile/${user?.id}`);
              //   } else {
              //     if (
              //       item?.title == 'My Feeds' &&
              //       location.pathname === '/my-feed'
              //     ) {
              //       dispatch(updateScroll(true));
              //     }
              //     navigate(item?.path);
              //   }
              // }}
              style={styles.menuItem}>
              <View style={{position: 'relative'}}>
                {item.title === 'CheckIn' ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -50,
                      transform: [{translateX: -25}],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Animated.View
                      style={{transform: [{translateY: bounceAnim}]}}>
                      <CheckInIcon width={50} height={50} />
                    </Animated.View>
                  </View>
                ) : route?.name === item?.path ? (
                  item.activeIcon
                ) : (
                  item.icon
                )}
              </View>
              <Text
                style={[
                  styles.itemTitle,
                  {color: route?.name === item?.path ? '#e93c00' : '#000'},
                ]}>
                {item?.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {isOpen && (
        <Menu
          open={isOpen}
          close={() => setIsOpen(false)}
          setIsSignUpOpen={setIsSignUpOpen}
          setIsLoginOpen={setIsLoginOpen}
        />
      )}
      <Login
        visible={isLoginOpen}
        onRequestClose={() => setIsLoginOpen(false)}
        setIsLoginOpen={setIsLoginOpen}
        setStep1open={setIsSignUpOpen}
        moveToSignup={moveToSignup}
        onCloseMenu={() => setIsOpen(false)}
      />
      <Signup
        step1open={isSignUpOpen}
        handleCloseStep1={() => setIsSignUpOpen(false)}
        setStep1open={setIsSignUpOpen}
        moveToLogin={moveToLogin}
        onCloseMenu={() => setIsOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 60,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  checkInSpacing: {
    justifyContent: 'space-between',
  },
  checkInIconWrapper: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{translateX: -17.5}],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInIcon: {
    width: 35,
    height: 35,
    resizeMode: 'cover',
    animation: 'bounce',
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'cover',
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: 2,
    color: '#000',
  },
  activeColor: {
    color: '#ff5a5f',
  },
  inactiveColor: {
    color: '#000000',
  },
});

export default Footer;
