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

const Balances = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState([]);
  const [balancesByType, setBalancesByType] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(false);

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
      let mapped = new Map();

      await httpProvider
        .get(`${BASE_URL}/balances`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setBalances([...data.sort((a, b) => b.amount - a.amount)]);

            for (const element of data) {
              const amount = mapped.get(element.type_id) || 0;
              mapped.set(
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
            for (const [key, value] of mapped) {
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
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading(false);
    };

    fetchData();
  }, []);

  const currency = useContext(AuthContext).user.currency;

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
              data={balances.filter((d) => !d.is_liability).map((b) => b.amount)}
              labels={balances.filter((d) => !d.is_liability).map((b) => b.description)}
              height={'375px'}
              width={'355px'}
              title={`Current Balances Total: ${currency} ${currencyProvider.sumToMainCurrency(
                balances.filter((b) => !b.is_liability)
              )}`}
            />
            <PieChart
              data={balancesByType.filter((d) => !d.is_liability).map((b) => b.amount)}
              labels={balancesByType.filter((d) => !d.is_liability).map((b) => b.name)}
              height={'345px'}
              width={'325px'}
              title={`Current Balances By Type:${currency} ${currencyProvider.sumToMainCurrency(
                balances.filter((b) => !b.is_liability)
              )}`}
            />
          </div>

          <div className='balances-table-container'>
            <table>
              <thead>
                <tr>
                  <th>Balance Type</th>
                  <th>Balances</th>
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
                                {balance.is_liability ? `(${balance.amount})` : balance.amount}
                              </div>
                            );
                          } else {
                            return <span key={i}></span>;
                          }
                        })}
                      </th>
                      <th>
                        {currency}{' '}
                        {currencyProvider.sumToMainCurrency(
                          balances.filter((b) => b.type_id === type._id)
                        )}{' '}
                      </th>
                    </tr>
                  );
                })}
                <tr>
                  <th colSpan={2}>Totals</th>
                  <th>
                    {currency}{' '}
                    {currencyProvider.sumToMainCurrency(balances.filter((b) => !b.is_liability))}
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
