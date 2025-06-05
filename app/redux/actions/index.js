import * as types from './actionConstants';
export const setUI = payload => ({
  type: types.SET_UI,
  payload,
});
export const init = () => ({
  type: types.INIT,
});

export const cleanup = () => ({
  type: types.CLEANUP,
});

export const setUser = payload => ({
  type: types.SET_USER,
  payload,
});

export const refreshUserDetails = () => ({
  type: types.REFRESH_USER_DETAILS,
});

export const setSuccess = payload => ({
  type: types.SET_SUCCESS,
  payload,
});

export const setError = payload => ({
  type: types.SET_ERROR,
  payload,
});

export const cleanSuccess = () => ({
  type: types.CLEAN_SUCCESS,
});

export const cleanError = () => ({
  type: types.CLEAN_ERROR,
});

export const setToken = payload => ({
  type: types.SET_TOKEN,
  payload,
});

export const setLocation = payload => ({
  type: types.SET_LOCATION,
  payload,
});
