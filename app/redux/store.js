// app/store.js
import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../redux/Slices/userSlice';
import geoReducer from '../redux/Slices/geoLocation';
import successReducer from './Slices/successPopup';
import errorReducer from './Slices/errorPopup';
import firebaseReducer from './Slices/firebase';
import myfeedScrollReducer from './Slices/myfeedScroll';
import badgeReducer from './Slices/badgeCount';

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: geoReducer,
    successModule: successReducer,
    errorModule: errorReducer,
    firebase: firebaseReducer,
    myfeedScroll: myfeedScrollReducer,
    badge: badgeReducer,
  },
});
