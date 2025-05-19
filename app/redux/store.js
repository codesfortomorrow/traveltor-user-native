// app/store.js
import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../redux/Slices/userSlice';
import geoReducer from '../redux/Slices/geoLocation';
import successReducer from './Slices/successPopup';
import errorReducer from './Slices/errorPopup';
import firebaseReducer from './Slices/firebase';

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: geoReducer,
    successModule: successReducer,
    errorModule: errorReducer,
    firebase: firebaseReducer,
  },
});
