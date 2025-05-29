import {useCallback, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuthReq,
  getReq,
  patchApiReq,
  postAuthReq,
  postReq,
} from '../utils/apiHandlers';
import {
  addWalletSchema,
  emailValidation,
  loginSchema,
  passwordSchema,
  updateUserSchema,
  validateData,
} from '../utils/validation';
import {AuthContext} from '../context/AuthContext';
import {useDispatch} from 'react-redux';
import {setSuccess} from '../redux/Slices/successPopup';
import {setError} from '../redux/Slices/errorPopup';
import {useNavigation} from '@react-navigation/native';
import {clearToken} from '../redux/Slices/firebase';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {getToken} from '../utils/tokenStorage';

const useAuth = () => {
  const {setIsLoggedIn} = useContext(AuthContext);
  const dispatch = useDispatch();
  const {navigate} = useNavigation();

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
        try {
          await messaging().deleteToken();
          console.log('Old FCM Token deleted');
        } catch (tokenError) {
          console.log('Error deleting FCM token:', tokenError);
        }
        setIsLoggedIn(false);
        navigate('Home');
        AsyncStorage.clear();
        dispatch(clearToken());
        //   dispatch(cleanup());
        return true;
      }
    } catch (error) {
      console.log(error, 'error');
    }
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
    async (data, onRequestClose, setForm) => {
      const [valid, error] = await validateData(loginSchema, data);
      if (error) return error;
      if (valid) {
        const response = await postReq('/auth/login', data);
        if (response?.status) {
          dispatch(
            setSuccess({
              open: true,
              custom_message: ' logged in to the Traveltor',
            }),
          );
          await setAuthToken(response?.data?.accessToken);
          setIsLoggedIn(true);
          onRequestClose();
          setForm({identifire: '', password: ''});
          //   dispatch(init());
          navigate('MyFeeds');
          requestNotificationPermission();
        } else {
          dispatch(
            setError({
              open: true,
              custom_message: ` ${response?.error?.message}`,
            }),
          );
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
            dispatch(
              setSuccess({
                open: true,
                custom_message: 'OTP has been sent to your email. 📩',
                defaultMsg: false,
              }),
            );
            onRequestClose();
            setOtpPopup(true);
            setOtpTimerData(response?.data?.email);
          } else {
            throw new Error(response?.error?.message || 'Something went wrong');
          }
        } catch (err) {
          dispatch(
            setError({
              open: true,
              custom_message: err.message,
            }),
          );
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
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
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
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const reactionOnFeed = useCallback(async (id, type) => {
    const response = await postAuthReq(`/check-ins/users/${id}/reactions`, {
      type,
    });
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const userFollowUnFollow = async id => {
    const response = await postAuthReq(`/users/${id}/follow`);
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  };

  const updateUser = useCallback(async data => {
    const [valid, error] = await validateData(updateUserSchema, data);
    if (error) return {error};
    if (valid) {
      const response = await patchApiReq('/users/me', data);
      if (response?.status) {
        // dispatch(cleanSuccess());
        dispatch(
          setSuccess({
            open: true,
            custom_message: ' updated your details.',
          }),
        );
        // dispatch(init());
        return {response};
      } else {
        dispatch(
          setError({
            open: true,
            custom_message: ` ${response.error.message}`,
          }),
        );
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
        dispatch(
          setSuccess({
            open: true,
            custom_message: ' updated your password.',
          }),
        );
        // dispatch(init());
      } else {
        dispatch(
          setError({
            open: true,
            custom_message: ` ${response.error.message}`,
          }),
        );
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
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const addWallet = useCallback(async data => {
    const [valid, error] = await validateData(addWalletSchema, data);
    if (error) return error;
    if (valid) {
      const response = await postAuthReq('/users/wallet', data);
      if (response?.status) {
        // dispatch(cleanSuccess());
        dispatch(
          setSuccess({
            open: true,
            custom_message: ' updated your wallet address.',
          }),
        );
        // dispatch(init());
      } else {
        dispatch(
          setError({
            open: true,
            custom_message: ` ${response.error.message}`,
          }),
        );
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
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getMyFeed = useCallback(async (page, refresh) => {
    const url = `/check-ins/users?refresh=${refresh}&skip=${5 * page}&take=5`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const FeedReactionAction = async (id, type) => {
    const response = await postAuthReq(`/check-ins/users/${id}/reactions`, {
      type,
    });
    if (response?.status) {
      return response;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: ` ${response.error.message}`,
      //   }),
      // );

      return response;
    }
  };

  const getTrekscape = useCallback(
    async (search, categoryId, pageNumber, location) => {
      const params = new URLSearchParams({
        ...(search && {search}),
        skip: pageNumber ? pageNumber * 10 : 0 * 10,
        take: 10,
        ...(categoryId && {categoryId}),
        ...(location?.latitude && {latitude: location?.latitude}),
        ...(location?.longitude && {longitude: location?.longitude}),
      });
      const response = await getReq(`/trekscapes/home?${params.toString()}`);
      if (response?.status) {
        return response.data;
      } else {
        dispatch(
          setError({
            open: true,
            custom_message: ` ${response.error.message}`,
          }),
        );
      }
    },
    [],
  );

  const uploadImage = async data => {
    const route_url = process.env.API_URL;
    const token = await getToken();

    const response = await axios.post(`${route_url}/upload`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response, 'response');
    if (response?.status) {
      return response?.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response?.error?.message}`,
        }),
      );
    }
  };

  const uploadProfile = useCallback(async data => {
    const response = await postAuthReq('/users/me/profile-image', data);
    if (response?.status) {
      // dispatch(cleanSuccess());
      dispatch(
        setSuccess({open: true, custom_message: 'updated your profile.'}),
      );
      // dispatch(init());
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getTrailblazer = useCallback(async search => {
    const params = new URLSearchParams({
      ...(search && {search}),
    });
    const response = await getAuthReq(`/trailblazers?${params.toString()}`);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getNotification = useCallback(async page => {
    const url = `/notifications?skip=${page * 50}&take=${50}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getSingleTrekscapeData = useCallback(async (id, userId) => {
    const params = new URLSearchParams({
      ...(userId && {userId}),
    });
    const url = `/trekscapes/${id}?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const followOnTrekscape = async id => {
    const response = await postAuthReq(
      `/user-trekscapes/trekscapeFollowUnFollow/${id}`,
    );
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  };

  const getTrackScapeFeeds = useCallback(async (id, userId, page) => {
    const params = new URLSearchParams({
      skip: 5 * page,
      take: 5,
      ...(userId && {userId}),
    });
    const url = `/trekscapes/${id}/check-ins?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const handleReactionOnTrekscapeFeed = async (id, type) => {
    const response = await postAuthReq(`/check-ins/users/${id}/reactions`, {
      type,
    });
    if (response?.status) {
      return response;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
      return response;
    }
  };

  const getTrailPointDetails = useCallback(async (id, userId) => {
    const params = new URLSearchParams({
      ...(userId && {userId}),
    });
    const url = `/trail-points/${id && id}?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: response?.error?.message,
        }),
      );
    }
  }, []);

  const getTrailPointFeeds = useCallback(async (id, userId) => {
    const params = new URLSearchParams({
      ...(userId && {userId}),
    });
    const url = `/trail-points/${id}/check-ins?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getSingleTrailpointforReview = useCallback(
    async (id, data, userId, page) => {
      const params = new URLSearchParams({
        ...(userId && {userId}),
        orderBy: data?.sortOrder || 0,
        ...(data?.userType && {userType: data?.userType}),
        ...(data?.startDate && {startDate: data?.startDate}),
        ...(data?.endDate && {endDate: data?.endDate}),
        skip: 5 * page,
        take: 5,
      });

      const url = `/trail-points/${id}/check-ins?${params.toString()}`;
      const response = await getAuthReq(url);
      if (response?.status) {
        return response.data;
      } else {
        dispatch(
          setError({
            open: true,
            custom_message: ` ${response.error.message}`,
          }),
        );
      }
    },
    [],
  );

  const getSingleTrailpoint = useCallback(async (id, userId) => {
    const params = new URLSearchParams({
      ...(userId && {userId}),
    });
    const url = `/trail-points/${id && id}?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      dispatch(
        setError({
          open: true,
          custom_message: ` ${response.error.message}`,
        }),
      );
    }
  }, []);

  const getValidatedCheckInPoint = useCallback(async data => {
    const params = new URLSearchParams({
      latitude: data?.latitude || 'asc',
      longitude: data?.longitude,
    });
    const url = `/trekscapes/by-location?${params.toString()}`;
    const response = await getAuthReq(url);
    if (response?.status) {
      return response.data;
    } else {
      // dispatch(
      //   setError({
      //     open: true,
      //     custom_message: response?.error?.message,
      //   }),
      // );
    }
  }, []);

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
    getTrekscape,
    uploadImage,
    uploadProfile,
    getTrailblazer,
    getNotification,
    getSingleTrekscapeData,
    followOnTrekscape,
    getTrackScapeFeeds,
    handleReactionOnTrekscapeFeed,
    getTrailPointDetails,
    getTrailPointFeeds,
    getSingleTrailpointforReview,
    getSingleTrailpoint,
    getValidatedCheckInPoint,
  };
};

export default useAuth;
