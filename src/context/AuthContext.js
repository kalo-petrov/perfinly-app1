import { createContext } from 'react';
import jwtDecode from 'jwt-decode';

export const getToken = () => localStorage.getItem('token') || '';
export const getCurrencyRates = () => {
  try {
    return JSON.parse(localStorage.getItem('currency_rates') || { '': '' }) || '';
  } catch {
    return { '': ' ' };
  }
};

export const extractUser = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  currency_rates: {},
  setLoginState: () => {},
});

export default AuthContext;
