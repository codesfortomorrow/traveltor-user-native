import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import {getToken} from './tokenStorage';

const isProductionApp = process.env.APP_ENV === 'production';
const apiUrl = process.env.API_URL;

export const setAuthToken = async () => {
  const key = !isProductionApp
    ? 'test__users__isLoggedIn'
    : '__users__isLoggedIn';

  await AsyncStorage.setItem(key, 'true');
};

export const removeAuthToken = async () => {
  const key = !isProductionApp
    ? 'test__users__isLoggedIn'
    : '__users__isLoggedIn';

  await AsyncStorage.removeItem(key);
};

export const isLoggedIn = async () => {
  const data = await AsyncStorage.getItem('__users__isLoggedIn');
  if (!data) {
    return Boolean(data);
  } else {
    const {token} = JSON.parse(data);
    return token ? true : false;
  }
};

const unauthorizedHandler = async () => {
  const key = !isProductionApp
    ? 'test__users__isLoggedIn'
    : '__users__isLoggedIn';

  await AsyncStorage.removeItem(key);
};

const responseFormatter = (status, data, error) => {
  return {status, data, error};
};

export const postReq = async (url, data) => {
  const route_url = apiUrl + url;
  return await axios
    .post(route_url, data, {
      headers: {
        Accept: 'application/json',
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const getReq = async url => {
  const route_url = apiUrl + url;
  return await axios
    .get(route_url, {
      headers: {
        Accept: 'application/json',
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const getAuthReq = async url => {
  const route_url = apiUrl + url;
  const token = await getToken();

  return await axios
    .get(route_url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e?.response?.status === 401) {
        unauthorizedHandler();
      } else if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const postAuthReq = async (url, data) => {
  const route_url = apiUrl + url;
  const token = await getToken();

  try {
    const response = await axios.post(route_url, data, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return responseFormatter(true, response.data, null);
  } catch (e) {
    if (e?.response?.status === 401) {
      unauthorizedHandler();
    }
    return responseFormatter(false, null, e?.response?.data || null);
  }
};

export const putApiReq = async (url, data) => {
  const route_url = apiUrl + url;
  const token = await getToken();

  return await axios
    .put(route_url, data, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e?.response?.status === 401) {
        unauthorizedHandler();
      } else if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const patchApiReq = async (url, data) => {
  const route_url = apiUrl + url;
  const token = await getToken();

  return await axios
    .patch(route_url, data, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e?.response?.status === 401) {
        unauthorizedHandler();
      } else if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const deleteApiReq = async url => {
  const route_url = apiUrl + url;
  const token = await getToken();

  return await axios
    .delete(route_url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    .then(response => {
      return responseFormatter(true, response.data, null);
    })
    .catch(e => {
      if (e?.response?.status === 401) {
        unauthorizedHandler();
      } else if (e) {
        return responseFormatter(false, null, e?.response?.data || null);
      } else {
        return responseFormatter(false, null, e?.response?.data || null);
      }
    });
};

export const postFile = async (endpoint, data) => {
  const url = process.env.API_URL + endpoint;
  const token = await getToken();

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };

  try {
    const response = await axios.post(url, data, {
      withCredentials: true,
      headers,
    });
    return responseFormatter(true, response.data, null);
  } catch (e) {
    if (e?.response?.status === 401) {
      unauthorizedHandler();
    } else if (e) {
      return responseFormatter(false, null, e?.response?.data || null);
    } else {
      return responseFormatter(false, null, e?.response?.data || null);
    }
  }
};

export const showErrorMessage = message => {
  if (Array.isArray(message)) {
    message.forEach(msg =>
      Toast.show({type: 'error', text1: 'Error', text2: msg}),
    );
  } else {
    Toast.show({type: 'error', text1: 'Error', text2: message});
  }
};
