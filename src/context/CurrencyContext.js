import { createContext } from 'react';

const CurrencyContext = createContext({
    currency_rates: null,
    setCurrencyState: () => {},
  });
  

  export default CurrencyContext;