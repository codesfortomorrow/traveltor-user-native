import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  open: false,
  custom_message: '',
  defaultMsg: true,
};

const successSlice = createSlice({
  name: 'success',
  initialState,
  reducers: {
    setSuccess: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    cleanSuccess: () => {
      return initialState;
    },
  },
});

export const {setSuccess, cleanSuccess} = successSlice.actions;

export default successSlice.reducer;
