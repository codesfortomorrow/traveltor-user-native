import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  open: false,
  custom_message: '',
  sorryMsg: true,
  errorMsg: true,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    cleanError: () => {
      return initialState;
    },
  },
});

export const {setError, cleanError} = errorSlice.actions;

export default errorSlice.reducer;
