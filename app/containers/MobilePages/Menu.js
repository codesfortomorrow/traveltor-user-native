import React, {useRef, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Constant from '../../utils/constant';
import Link from 'react-native-vector-icons/Ionicons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.65;

const MenuPage = ({open, close, setIsLoginOpen, setIsSignUpOpen}) => {
  const {navigate} = useNavigation();
  const {MenuLinks} = Constant();

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH - DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [open]);

  // Close with animation
  const handleCloseWithAnimation = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      close();
    });
  };

  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      onRequestClose={handleCloseWithAnimation}>
      <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}>
        <TouchableOpacity
          style={{flex: 1}}
          activeOpacity={1}
          onPress={handleCloseWithAnimation}
        />
      </Animated.View>
      <Animated.View style={[styles.drawer, {left: slideAnim}]}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../../public/images/logo-1.png')}
              resizeMode="contain"
            />
          </View>

          <View style={styles.authButtons}>
            <TouchableOpacity
              onPress={() => setIsSignUpOpen(true)}
              style={styles.signUpButton}>
              <Text style={styles.signUpText}>SIGN UP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLoginOpen(true)}
              style={styles.loginButton}>
              <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
          </View>

          {MenuLinks?.map((item, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {item.children?.map((link, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.linkButton}
                  onPress={() => {
                    close();
                    if (link.name === 'Blogs') {
                      Linking.openURL('https://blog.traveltor.io');
                    } else {
                      navigate(link.path);
                    }
                  }}>
                  {typeof link.icon === 'object' ? (
                    <View style={styles.iconContainer}>{link.icon}</View>
                  ) : (
                    <Link name="link" size={22} color="#000" />
                  )}
                  <Text style={styles.linkText}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00000088',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: -2, height: 0},
  },
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 60,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: '#e93c00',
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#000',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#e93c00',
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 15,
  },
  section: {
    borderTopWidth: 1,
    borderColor: '#878080',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconContainer: {
    fontSize: 24,
  },
  linkIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  linkText: {
    fontSize: 16,
  },
});

export default MenuPage;
