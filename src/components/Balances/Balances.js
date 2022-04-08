import React, { useState, useEffect, useContext } from 'react';
import './Balances.css';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import CreateBalance from '../CreateBalance/CreateBalance';
import EditBalance from './../EditBalance/EditBalance';
import Loader from './../Base/Loader/Loader';
import PieChart from './../Charts/PieChart/PieChart';
import useComponentVisible from './../../hooks/useComponentVisible';
import currencyProvider from '../../providers/CurrencyProvider';
import AuthContext from '../../context/AuthContext';
import getSymbolFromCurrency from 'currency-symbol-map';

const Balances = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState([]);
  const [balancesByType, setBalancesByType] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(false);
  const [liabilities, setLiabilities] = useState([]);
  const [liabilitiesByType, setLiabilitiesByType] = useState([]);

  const {
    ref: ref1,
    isComponentVisible: toggleAddBalance,
    setIsComponentVisible: setToggleAddBalance,
  } = useComponentVisible(false);
  const {
    ref: ref2,
    isComponentVisible: toggleEditBalance,
    setIsComponentVisible: setToggleEditBalance,
  } = useComponentVisible(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let mappedBalances = new Map();
      let mappedLiabilities = new Map();

      await httpProvider
        .get(`${BASE_URL}/balances`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setBalances([
              ...data.filter((d) => !d.is_liability).sort((a, b) => b.amount - a.amount),
            ]);
            setLiabilities([
              ...data.filter((d) => d.is_liability).sort((a, b) => b.amount - a.amount),
            ]);

            for (const element of data.filter((d) => !d.is_liability)) {
              const amount = mappedBalances.get(element.type_id) || 0;
              mappedBalances.set(
                element.type_id,
                amount +
                  currencyProvider.convertToMainCurrency({
                    amount: element.amount,
                    currency: element.currency,
                  }).amount
              );
            }
            for (const element of data.filter((d) => d.is_liability)) {
              const amount = mappedLiabilities.get(element.type_id) || 0;
              mappedLiabilities.set(
                element.type_id,
                amount +
                  currencyProvider.convertToMainCurrency({
                    amount: element.amount,
                    currency: element.currency,
                  }).amount
              );
            }
          }
        })
        .catch((error) => setError(error.toString()));

      await httpProvider
        .get(`${BASE_URL}/balance-types`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setTypes(data);
            setBalancesByType([]);
            for (const [key, value] of mappedBalances) {
              setBalancesByType((prev) =>
                [
                  ...prev,
                  {
                    type_id: key,
                    amount: value,
                    name: data.find((type) => type._id === key)?.name,
                  },
                ].sort((a, b) => b.amount - a.amount)
              );
            }
            setLiabilitiesByType([]);
            for (const [key, value] of mappedLiabilities) {
              setLiabilitiesByType((prev) =>
                [
                  ...prev,
                  {
                    type_id: key,
                    amount: value,
                    name: data.find((type) => type._id === key)?.name,
                  },
                ].sort((a, b) => b.amount - a.amount)
              );
            }
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading(false);
    };

    fetchData();
  }, []);

  const currency = useContext(AuthContext).user.currency;

  const liabilityColors = [
    '#ff5050',
    '#FFBF00',
    '#CCCCFF',
    '#6495ED',
    '#9FE2BF',
    '#DFFF00',
    '#990033',
    '#6666ff',
    '#0000b3',
  ]
  return (
    <div>
      {error && <Error error={error} setError={setError} />}
      <h3>Balances</h3>

      {toggleEditBalance && (
        <div ref={ref2}>
          <EditBalance
            setToggleEditBalance={setToggleEditBalance}
            setBalances={setBalances}
            selectedBalance={selectedBalance}
            setBalancesByType={setBalancesByType}
            types={types}
            balances={balances}
          />
        </div>
      )}
      {toggleAddBalance && (
        <div ref={ref1}>
          <CreateBalance
            setToggleAddBalance={setToggleAddBalance}
            setBalances={setBalances}
            balances={balances}
            types={types}
            setBalancesByType={setBalancesByType}
            liabilities={liabilities}
            setLiabilities={setLiabilities}
            setLiabilitiesByType={setLiabilitiesByType}
          />
        </div>
      )}
      <Button onClick={() => setToggleAddBalance(true)}>Add New Balance </Button>
      <br />
      <br />
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className='balances-chart-section'>
            <PieChart
              data={balances.map((b) => b.amount)}
              labels={balances.map((b) => `${b.description} (${getSymbolFromCurrency(currency)})`)}
              height={'375px'}
              width={'355px'}
              title={`Balances Total: ${currency} ${currencyProvider
                .sumToMainCurrency(balances)
                .toLocaleString()}`}
            />
            <PieChart
              data={balancesByType.map((b) => b.amount)}
              labels={balancesByType.map((b) =>  `${b.name} (${getSymbolFromCurrency(currency)})`)}
              height={'375px'}
              width={'355px'}
              title={`Balances By Type: ${currency} ${currencyProvider
                .sumToMainCurrency(balances)
                .toLocaleString()}`}
            />
          </div>
          <div className='balances-chart-section'>
            <PieChart
              data={liabilities.map((b) => b.amount)}
              labels={liabilities.map((b) =>  `${b.description} (${getSymbolFromCurrency(currency)})`)}
              height={'375px'}
              width={'355px'}
              title={`Liabilites Total: ${currency} (${currencyProvider
                .sumToMainCurrency(liabilities)
                .toLocaleString()})`}
              backgroundColor={liabilityColors}
            />
            <PieChart
              data={liabilitiesByType.map((b) => b.amount)}
              labels={liabilitiesByType.map((b) =>  `${b.name} (${getSymbolFromCurrency(currency)})`)}
              height={'375px'}
              width={'355px'}
              title={`Liabilites By Type: ${currency} (${currencyProvider
                .sumToMainCurrency(liabilities)
                .toLocaleString()})`}
              backgroundColor={liabilityColors}
            />
          </div>

          <div className='balances-table-container'>
            <table className='balances-table'>
              <thead>
                <tr className='balances-header'>
                  <th>Balance Type</th>
                  <th style={{minWidth: '250px'}}>Balances</th>
                  <th>Totals</th>
                </tr>
              </thead>
              <tbody>
                {types?.map((type) => {
                  return (
                    <tr key={type._id}>
                      <th>{type.name}</th>
                      <th className='balances-container-cell'>
                        {balances?.map((balance, i) => {
                          if (balance.type_id === type._id) {
                            return (
                              <div
                                key={balance._id}
                                className='individual-balance'
                                onClick={() =>
                                  setSelectedBalance(balance) + setToggleEditBalance(true)
                                }
                              >
                                {balance.description} - {balance.currency}{' '}
                                {balance.amount.toLocaleString()}
                              </div>
                            );
                          } else {
                            return <span key={i}></span>;
                          }
                        })}
                        {liabilities?.map((l, i) => {
                          if (l.type_id === type._id) {
                            return (
                              <div
                                key={l._id}
                                className='individual-balance'
                                onClick={() => setSelectedBalance(l) + setToggleEditBalance(true)}
                              >
                                {l.description} - {l.currency} ({l.amount.toLocaleString()})
                              </div>
                            );
                          } else {
                            return <span key={i}></span>;
                          }
                        })}
                      </th>
                      <th>
                        {currency}{' '}
                        {(
                          currencyProvider.sumToMainCurrency(
                            balances.filter((b) => b.type_id === type._id)
                          ) -
                          currencyProvider.sumToMainCurrency(
                            liabilities.filter((b) => b.type_id === type._id)
                          )
                        ).toLocaleString()}{' '}
                      </th>
                    </tr>
                  );
                })}
                <tr className='balances-table-bottom-row'>
                  <th colSpan={2}>Total Net Worth</th>
                  <th>
                    {currency}{' '}
                    {(
                      currencyProvider.sumToMainCurrency(balances) -
                      currencyProvider.sumToMainCurrency(liabilities)
                    ).toLocaleString()}
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Balances;
