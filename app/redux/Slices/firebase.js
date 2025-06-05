import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  fcmToken: '',
};

const firebaseSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    clearToken: (state, action) => {
      state.fcmToken = null;
    },
  },
});

export const {setToken, clearToken} = firebaseSlice.actions;
export default firebaseSlice.reducer;
