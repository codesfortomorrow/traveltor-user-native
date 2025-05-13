import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  latitude: '',
  longitude: '',
  response: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.response = action.payload.response;
    },
  },
});

export const {setLocation} = locationSlice.actions;

export default locationSlice.reducer;
