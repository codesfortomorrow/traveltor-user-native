import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  isScroll: false,
};

const myfeedScroll = createSlice({
  name: 'myfeedScroll',
  initialState,
  reducers: {
    updateScroll: (state, action) => {
      state.isScroll = action.payload;
    },
  },
});

export const {updateScroll} = myfeedScroll.actions;
export default myfeedScroll.reducer;
