import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  badgeCount: 0,
};

const badgeSlice = createSlice({
  name: 'badge',
  initialState,
  reducers: {
    setBadge: (state, action) => {
      state.badgeCount = action.payload;
    },
  },
});

export const {setBadge} = badgeSlice.actions;
export default badgeSlice.reducer;
