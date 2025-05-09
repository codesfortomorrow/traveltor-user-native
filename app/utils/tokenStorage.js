// utils/tokenStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const LOGIN_KEY = '__users__isLoggedIn';

export const saveToken = async token => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(LOGIN_KEY, JSON.stringify({token}));
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const getToken = async () => {
  try {
    const tokenn = await AsyncStorage.getItem(LOGIN_KEY);
    if (!tokenn) return false;

    try {
      const {token} = JSON.parse(tokenn);
      return token;
    } catch (e) {
      return false;
    }
  } catch (e) {
    console.error('Error retrieving token', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(LOGIN_KEY);
  } catch (e) {
    console.error('Error removing token', e);
  }
};

export const isLoggedIn = async () => {
  const data = await AsyncStorage.getItem(LOGIN_KEY);
  if (!data) return false;

  try {
    const {token} = JSON.parse(data);
    return !!token;
  } catch (e) {
    return false;
  }
};
