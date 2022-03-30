     
export const getCurrencyRates = () => JSON.parse(localStorage.getItem('currency_rates')) || {};      

const sumToMainCurrency = (arrayOfAmountsWithCurrencies) => {

  return arrayOfAmountsWithCurrencies.reduce((acc, obj) => {
    acc += obj.amount * 1/getCurrencyRates()[`${obj.currency}`];

    return acc;
  }, 0).toFixed(2);
};

const currencyProvider = {
  sumToMainCurrency,
};
export default currencyProvider;
