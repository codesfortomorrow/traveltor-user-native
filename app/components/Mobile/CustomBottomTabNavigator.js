import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';

// Import your components and utilities
import Constant from '../../utils/constant';
import Login from '../Modal/Login';
import Signup from '../Signup';
import Menu from '../../containers/MobilePages/Menu';
import CheckInIcon from '../../../public/images/footer/footerCheckinIcon.svg';
import {AuthContext} from '../../context/AuthContext';
import {updateScroll} from '../../redux/Slices/myfeedScroll';

// Import your screen components
import HomeScreen from '../../containers/HomePage';
import MyFeedsScreen from '../../containers/MobilePages/MyFeeds';
import ProfileScreen from '../../components/Mobile/UserProfile';
import CheckInScreen from '../../containers/GeneralCheckIn';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({state, descriptors, navigation}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(null);

  // Context and Redux
  const {isLoggedIn} = useContext(AuthContext);
  const user = useSelector(state => state?.user);
  const dispatch = useDispatch();

  // Constants
  const {loginItems, logoutItems} = Constant();

  // Animation ref
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Set menu items based on authentication status
  useEffect(() => {
    if (isLoggedIn) {
      setMenuItems(loginItems);
    } else {
      setMenuItems(logoutItems);
    }
  }, [isLoggedIn, loginItems, logoutItems]);

  // Bounce animation for CheckIn icon
  useEffect(() => {
    const bounceAnimation = Animated.loop(
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
    );

    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, [bounceAnim]);

  // Handle navigation and actions
  const handleTabPress = async (item, routeName) => {
    const {title, path} = item;

    switch (title) {
      case 'Menu':
        return setIsOpen(true);

      case 'Profile':
        return navigation.navigate('Profile', {
          userType: user?.type,
          id: user?.id,
        });

      case 'Login':
        return setIsLoginOpen(true);

      case 'My Feeds':
        const currentRoute = state.routes[state.index].name;
        if (currentRoute === 'MyFeeds') {
          return dispatch(updateScroll(true));
        } else {
          navigation.navigate(routeName);
        }
        break;

      default:
        if (routeName) {
          return navigation.navigate(routeName);
        }
    }
  };

  // Modal navigation helpers
  const moveToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const moveToSignup = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  return (
    <>
      <View style={styles.footerContainer}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          // Find corresponding menu item
          const menuItem = menuItems?.find(
            item => item.path === route.name || item.title === route.name,
          );

          if (!menuItem) return null;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleTabPress(menuItem, route.name)}
              style={styles.menuItem}>
              <View style={{position: 'relative'}}>
                {menuItem.title === 'CheckIn' ? (
                  <View style={styles.checkInWrapper}>
                    <Animated.View
                      style={{transform: [{translateY: bounceAnim}]}}>
                      <CheckInIcon width={50} height={50} />
                    </Animated.View>
                  </View>
                ) : isFocused ? (
                  menuItem.activeIcon
                ) : (
                  menuItem.icon
                )}
              </View>
              <Text
                style={[
                  styles.itemTitle,
                  {color: isFocused ? '#e93c00' : '#000'},
                ]}>
                {menuItem?.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modals */}
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
    </>
  );
};

// Main Tab Navigator
const CustomBottomTabNavigator = () => {
  const {isLoggedIn} = useContext(AuthContext);
  const {loginItems, logoutItems} = Constant();

  // Get current menu items based on auth status
  const currentMenuItems = isLoggedIn ? loginItems : logoutItems;

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // Hide headers if you don't need them
      }}>
      {currentMenuItems.map((item, index) => {
        // Map your menu items to actual screen components
        let ScreenComponent;

        switch (item.title) {
          case 'Home':
            ScreenComponent = HomeScreen;
            break;
          case 'My Feeds':
            ScreenComponent = MyFeedsScreen;
            break;
          case 'CheckIn':
            ScreenComponent = CheckInScreen;
            break;
          case 'Profile':
            ScreenComponent = ProfileScreen;
            break;
          default:
            ScreenComponent = HomeScreen;
        }

        return (
          <Tab.Screen
            key={index}
            name={item.path || item.title}
            component={ScreenComponent}
            options={{
              tabBarLabel: item.title,
            }}
          />
        );
      })}
    </Tab.Navigator>
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
  checkInWrapper: {
    position: 'absolute',
    top: -50,
    transform: [{translateX: -25}],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: 2,
    color: '#000',
  },
});

export default CustomBottomTabNavigator;
