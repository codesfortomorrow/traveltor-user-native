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
import {useNavigation, useRoute} from '@react-navigation/native';
import Login from '../Modal/Login';
import Signup from '../Signup';
import Menu from '../../containers/MobilePages/Menu';
import CheckInIcon from '../../../public/images/footer/footerCheckinIcon.svg';
import {AuthContext} from '../../context/AuthContext';
import {useDispatch, useSelector} from 'react-redux';
import {updateScroll} from '../../redux/Slices/myfeedScroll';

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const {loginItems, logoutItems} = Constant();
  const [menuItems, setMenuItems] = useState(null);
  const route = useRoute();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [forgotPopup, setForgotPopup] = useState(false);
  const {isLoggedIn} = useContext(AuthContext);
  const {navigate} = useNavigation();
  const user = useSelector(state => state?.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      setMenuItems(loginItems);
    } else {
      setMenuItems(logoutItems);
    }
  }, [isLoggedIn]);

  const handleSignIn = async item => {
    const {title, path} = item;

    switch (title) {
      case 'Menu':
        return setIsOpen(true);

      case 'Profile':
        return navigate('Profile', {
          userType: user?.type,
          id: user?.id,
        });

      case 'Login':
        return setIsLoginOpen(true);

      case 'My Feeds':
        if (route.name === 'MyFeeds') {
          return dispatch(updateScroll(true));
        } else {
          navigate(path);
        }

      default:
        if (path) {
          return navigate(path);
        }
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
          toValue: -14,
          duration: 400,
          easing: Easing.bezier(0.8, 0, 1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
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
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSignIn(item)}
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
        moveToSignup={moveToSignup}
      />
      <Signup
        step1open={isSignUpOpen}
        handleCloseStep1={() => setIsSignUpOpen(false)}
        setStep1open={setIsSignUpOpen}
        moveToLogin={moveToLogin}
      />
      {forgotPopup && (
        <ForgotPassword
          visible={forgotPopup}
          onRequestClose={() => setForgotPopup(false)}
          setForgotPopup={setForgotPopup}
          setIsLoginOpen={setIsLoginOpen}
        />
      )}
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
