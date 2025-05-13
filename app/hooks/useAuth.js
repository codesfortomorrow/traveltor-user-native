import {useCallback, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuthReq,
  getReq,
  patchApiReq,
  postAuthReq,
  postReq,
  removeAuthToken,
} from '../utils/apiHandlers';
import Toast from 'react-native-toast-message';
import {
  addWalletSchema,
  emailValidation,
  loginSchema,
  passwordSchema,
  updateUserSchema,
  validateData,
} from '../utils/validation';
import {AuthContext} from '../context/AuthContext';

const useAuth = () => {
  const {setIsLoggedIn} = useContext(AuthContext);

  const requestNotificationPermission = useCallback(() => {
    if (
      'Notification' in window &&
      (Notification.permission === 'default' ||
        Notification.permission === 'denied')
    ) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notifications allowed');
        } else {
          console.log('Notifications denied');
          localStorage.setItem('hasDeniedNotification', 'true');
        }
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await postAuthReq('/auth/logout');
      if (response?.status) {
        //   removeAuthToken();
        setIsLoggedIn(false);
        AsyncStorage.clear();
        Toast.show({
          type: 'success',
          text1: 'Logout Successfully',
        });
        //   AsyncStorage.removeItem('__users__isLoggedIn');
        //   dispatch(cleanup());
        //   AsyncStorage.removeItem('fcmToken');
        //   dispatch(setToken(''));
        //   deleteToken(messaging).then(() => {
        //     console.log('Old FCM Token deleted');
        //   });
        //   signOut(auth)
        //     .then(function () {
        //       // Sign-out successful.
        //       console.log('sign out firebase success');
        //     })
        //     .catch(function (error) {
        //       // An error happened.
        //       console.log('sign out failed firebase', error);
        //     });
        return true;
      }
    } catch (error) {
      console.log(error, 'error');
    }
    // const auth = getAuth();
  }, []);

  const setAuthToken = async token => {
    const now = new Date();
    const expiresAt = now.setDate(now.getDate() + 30);

    const data = JSON.stringify({
      token,
      expiresAt,
    });

    try {
      await AsyncStorage.setItem('__users__isLoggedIn', data);
    } catch (error) {
      console.error('Error saving token', error);
    }
  };

  const login = useCallback(
    async data => {
      const [valid, error] = await validateData(loginSchema, data);
      if (error) return error;
      if (valid) {
        const response = await postReq('/auth/login', data);
        if (response?.status) {
          //   dispatch(
          //     setSuccess({
          //       open: true,
          //       custom_message: ' logged in to the Traveltor',
          //     }),
          //   );
          await setAuthToken(response?.data?.accessToken);
          setIsLoggedIn(true);
          Toast.show({
            type: 'success',
            text1: 'Login Successfully',
          });
          //   handleClose();
          //   dispatch(init());
          //   navigate('/my-feed');
          requestNotificationPermission();
        } else {
          //   dispatch(
          //     setError({
          //       open: true,
          //       custom_message: ` ${response.error.message}`,
          //     }),
          //   );
          Toast.show({type: 'error', text1: response?.error?.message});
        }
      }
    },
    [requestNotificationPermission],
  );

  const sendOtp = useCallback(
    async (email, onRequestClose, setOtpPopup, setOtpTimerData) => {
      const [valid, error] = await validateData(emailValidation, {
        email,
      });
      if (error) return error;

      if (valid) {
        try {
          const response = await postReq('/auth/forgot-password', {
            email,
          });
          if (response?.status) {
            // dispatch(
            //   setSuccess({
            //     open: true,
            //     custom_message: 'OTP has been sent to your email. 📩',
            //     defaultMsg: false,
            //   }),
            // );
            onRequestClose();
            setOtpPopup(true);
            setOtpTimerData(response?.data?.email);
          } else {
            Toast.show({type: 'error', text1: response?.error?.message});
            throw new Error(response?.error?.message || 'Something went wrong');
          }
        } catch (err) {
          // dispatch(
          //   setError({
          //     open: true,
          //     custom_message: err.message,
          //   }),
          // );
        }
      }
    },
    [],
  );

  const getUserDetails = useCallback(async (id, type, followById) => {
    const params = new URLSearchParams({
      ...(type && {type}),
      ...(followById && {followById}),
    });
    const url = `/users/profile/${id}?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
    }
  }, []);

  const getUserFeeds = useCallback(async (id, reactionUserId, pageNumber) => {
    const params = new URLSearchParams({
      skip: pageNumber * 5,
      take: 5,
      ...(reactionUserId && {reactionUserId}),
    });
    const url = `/check-ins/users/${id}?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
    }
  }, []);

  const reactionOnFeed = useCallback(async (id, type) => {
    const payload = {
      type: type,
    };
    const response = await postAuthReq(
      `/check-ins/users/${id}/reactions`,
      payload,
    );
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
      console.log(response?.error);
    }
  }, []);

  const userFollowUnFollow = async id => {
    const response = await postAuthReq(`/users/${id}/follow`);
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
    }
  };

  const updateUser = useCallback(async data => {
    const [valid, error] = await validateData(updateUserSchema, data);
    if (error) return {error};
    if (valid) {
      const response = await patchApiReq('/users/me', data);
      if (response?.status) {
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message: ' updated your details.',
        //   }),
        // );
        // dispatch(init());
        return {response};
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: ` ${response.error.message}`,
        //   }),
        // );
        return {response};
      }
    }
  }, []);

  const updatePassword = useCallback(async data => {
    const [valid, error] = await validateData(passwordSchema, data);
    if (error) return error;
    if (valid) {
      const response = await postAuthReq('/users/me/change-password', data);
      if (response?.status) {
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message: ' updated your password.',
        //   }),
        // );
        // dispatch(init());
        Toast.show({type: 'success', text1: 'Update Password Successfully'});
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: ` ${response.error.message}`,
        //   }),
        // );
        Toast.show({type: 'error', text1: response?.error?.message});
      }
    }
  }, []);

  const getWalletTransaction = useCallback(async pageNumber => {
    const response = await getAuthReq(
      `/users/me/transactions?skip=${pageNumber * 50}&take=${50}`,
    );
    if (response?.status) {
      return response.data;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
      Toast.show({type: 'error', text1: response?.error?.message});
    }
  }, []);

  const addWallet = useCallback(async data => {
    const [valid, error] = await validateData(addWalletSchema, data);
    if (error) return error;
    if (valid) {
      const response = await postAuthReq('/users/wallet', data);
      if (response?.status) {
        // dispatch(cleanSuccess());
        // dispatch(
        //   setSuccess({
        //     open: true,
        //     custom_message: ' updated your wallet address.',
        //   }),
        // );
        // dispatch(init());
        Toast.show({
          type: 'success',
          text1: 'Wallet Address Updated Successfully',
        });
      } else {
        // dispatch(
        //   setError({
        //     open: true,
        //     custom_message: ` ${response.error.message}`,
        //   }),
        // );
        Toast.show({type: 'error', text1: response?.error?.message});
      }
    }
  }, []);

  const getReferralData = useCallback(async page => {
    const params = new URLSearchParams({
      skip: page * 10,
      take: 10,
    });
    const url = `/users/me/transactions/referrals?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
    }
  }, []);

  const getMyFeed = useCallback(async (page, refresh) => {
    const url = `/check-ins/users?refresh=${refresh}&skip=${5 * page}&take=5`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
      Toast.show({type: 'error', text1: response?.error?.message});
    }
  }, []);

  const FeedReactionAction = async (id, type) => {
    const payload = {
      type: type,
    };
    const response = await postAuthReq(
      `/check-ins/users/${id}/reactions`,
      payload,
    );
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );
      Toast.show({type: 'error', text1: response?.error?.message});

      return response;
    }
  };

  return {
    logout,
    login,
    setAuthToken,
    sendOtp,
    getUserDetails,
    getUserFeeds,
    reactionOnFeed,
    userFollowUnFollow,
    updateUser,
    updatePassword,
    getWalletTransaction,
    addWallet,
    getReferralData,
    getMyFeed,
    FeedReactionAction,
  };
};

export default useAuth;
