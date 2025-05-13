// app/store.js
import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../redux/Slices/userSlice';
import geoReducer from '../redux/Slices/geoLocation';

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: geoReducer,
  },
});
