import { extractUser } from '../context/AuthContext';

export const getCurrencyRates = () => JSON.parse(localStorage.getItem('currency_rates')) || {};
export const getMainCurrency = () => extractUser(localStorage.getItem('token'))?.currency || '';

const sumToMainCurrency = (arrayOfAmountsWithCurrencies = [{ amount: 0, currency: 'USD' }]) => {
  return arrayOfAmountsWithCurrencies
    .reduce((acc, obj) => {
      acc += (obj.amount * 1) / getCurrencyRates()[`${obj.currency}`];

      return acc;
    }, 0)
    .toFixed(2);
};

const convertToMainCurrency = (amountObject = { amount: 0, currency: 'USD' }) => {
  const result = {}

   result.amount = Number((amountObject.amount  /  getCurrencyRates()[`${amountObject.currency}`]).toFixed(2))
   result.currency = `${getMainCurrency()}`

   return result
};

const currencyProvider = {
  sumToMainCurrency,
  convertToMainCurrency,
};
export default currencyProvider;
