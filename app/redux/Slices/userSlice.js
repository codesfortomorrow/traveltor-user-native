// features/user/userSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {getAuthReq} from '../../utils/apiHandlers';

// Async thunk for fetching user data
export const getUser = createAsyncThunk(
  'user/getUser',
  async (isLoggedIn, thunkAPI) => {
    try {
      if (isLoggedIn) {
        const response = await getAuthReq('/users/me');
        if (response?.status) {
          return response.data;
        }
      }
      return thunkAPI.rejectWithValue(null);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

const initialState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    cleanup: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
        };
      })
      .addCase(getUser.rejected, () => {
        return initialState;
      });
  },
});

export const {cleanup} = userSlice.actions;

export default userSlice.reducer;
