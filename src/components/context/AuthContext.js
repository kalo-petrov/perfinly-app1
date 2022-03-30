import { createContext } from 'react';
import jwtDecode from 'jwt-decode';

export const getToken = () => localStorage.getItem('token') || '';      
export const getCurrencyRates = () => JSON.parse(localStorage.getItem('currency_rates')) || {};      

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


export default  AuthContext;
