import React, {createContext, useState, useEffect} from 'react';
import {isLoggedIn as getIsLoggedInFromStorage} from '../utils/tokenStorage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLogin = async () => {
    const result = await getIsLoggedInFromStorage();
    setIsLoggedIn(result);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, checkLogin}}>
      {children}
    </AuthContext.Provider>
  );
};
