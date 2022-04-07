import React, { useContext, useEffect, useState } from 'react';
import './Dashboard.css';
import { BASE_URL } from '../../common/constants';
import httpProvider from '../../providers/httpProvider';
import moment from 'moment';
import Error from '../Base/Error/Error';
import PieChart from '../Charts/PieChart/PieChart';
import LineChart from '../Charts/LineChart/LineChart';
import Loader from '../Base/Loader/Loader';
import currencyProvider from '../../providers/CurrencyProvider';
import AuthContext from '../../context/AuthContext';
import useComponentVisible from './../../hooks/useComponentVisible';
import Button from 'react-bootstrap/esm/Button';
import CreateSpendRecord from './../CreateSpendRecord/CreateSpendRecord';
import CreateBalance from './../CreateBalance/CreateBalance';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSpendRecords } from './../../actions/index';
import getSymbolFromCurrency from 'currency-symbol-map';

function Dashboard() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spendByCategoryThisMonth, setSpendByCategoryThisMonth] = useState([]);
  const [lastSixMonthsSpend, setLastSixMonthsSpend] = useState([]);
  const [balancesByType, setBalancesByType] = useState([]);
  const [balances, setBalances] = useState([]);
  const [categories, setCategories] = useState([]);

  const currency = useContext(AuthContext).user.currency;

  const dispatch = useDispatch();
  const allSpendRecords = useSelector((state) => state.spendRecords);

  const sixMonthsLabels = () => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = moment().subtract(i, 'months').startOf('month').format('yyyy-MM-DD');
      const monthEnd = moment().subtract(i, 'months').endOf('month').format('yyyy-MM-DD');
      arr.push({ monthStart, monthEnd });
    }
    return arr;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const thisMonthStart = moment().startOf('month').format('yyyy-MM-DD');
      const thisMonthEnd = moment().endOf('month').format('yyyy-MM-DD');

      await httpProvider
        .get(`${BASE_URL}/spending?start_date=${thisMonthStart}&end_date=${thisMonthEnd}`)
        .then(async (data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            dispatch(getAllSpendRecords(data));

            const mapped = new Map();

            for (const element of data) {
              const amount = mapped.get(element.category_id) || 0;
              mapped.set(
                element.category_id,
                amount +
                  currencyProvider.convertToMainCurrency({
                    amount: element.amount,
                    currency: element.currency,
                  }).amount
              );
            }

            const OBJArr = [];

            const fetchD = async () => {
              await httpProvider
                .get(`${BASE_URL}/spend-categories`)
                .then((categories) => {
                  if (categories.error) {
                    setError(categories.error.toString());
                  } else {
                    setCategories(categories);
                    for (const [key, value] of mapped) {
                      OBJArr.push({
                        category_id: key,
                        amount: value,
                        name: categories.find((c) => c._id === key)?.name,
                        currency: getSymbolFromCurrency(currency),
                      });
                    }
                    setSpendByCategoryThisMonth(OBJArr.sort((a, b) => b.amount - a.amount));
                  }
                })
                .catch((error) => console.log(error) + setError(error.toString()));
            };
            await fetchD();
          }
        })
        .catch((error) => setError(error.toString()));

      const sixMonthsAgo = moment().subtract(5, 'months').startOf('month').format('yyyy-MM-DD');
      const thisMonth = moment().endOf('month').format('yyyy-MM-DD');

      await httpProvider
        .get(`${BASE_URL}/spending?start_date=${sixMonthsAgo}&end_date=${thisMonth}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            const sixMonthData = [];

            for (let i = 0; i < sixMonthsLabels().length; i++) {
              sixMonthData.push(
                currencyProvider.sumToMainCurrency(
                  data.filter(
                    (d) =>
                      d.date.slice(0, 10) >= sixMonthsLabels()[i].monthStart.slice(0, 10) &&
                      d.date.slice(0, 10) <= sixMonthsLabels()[i].monthEnd.slice(0, 10)
                  )
                )
              );
            }
            setLastSixMonthsSpend(sixMonthData);
          }
        })
        .catch((error) => setError(error.toString()));

      await httpProvider
        .get(`${BASE_URL}/balances`)
        .then(async (data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setBalances(data);
            const mapped = new Map();

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

            const fetch2 = async () => {
              await httpProvider
                .get(`${BASE_URL}/balance-types`)
                .then((balance_types) => {
                  if (balance_types.error) {
                    setError(balance_types.error.toString());
                  } else {
                    setBalancesByType([]);
                    for (const [key, value] of mapped) {
                      setBalancesByType((prev) => [
                        ...prev,
                        {
                          type_id: key,
                          amount: value,
                          name: balance_types.find((type) => type._id === key)?.name,
                        },
                      ]);
                    }
                  }
                })
                .catch((error) => setError(error.toString()));
            };

            await fetch2();
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading(false);
    };

    fetchData();
  }, []);

  const {
    ref,
    isComponentVisible: toggleAddSpend,
    setIsComponentVisible: setToggleAddSpend,
  } = useComponentVisible(false);

  const {
    ref: ref2,
    isComponentVisible: toggleAddBalance,
    setIsComponentVisible: setToggleAddBalance,
  } = useComponentVisible(false);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='dashboard-container'>
      <h3>Dashboard</h3>
      {error && <Error error={error} setError={setError} />}
      <br />
      <br />
      {toggleAddSpend && (
        <div ref={ref}>
          <CreateSpendRecord setToggleAddSpend={setToggleAddSpend} />
        </div>
      )}
      {toggleAddBalance && (
        <div ref={ref2}>
          <CreateBalance setToggleAddBalance={setToggleAddBalance} setBalances={setBalances} />
        </div>
      )}

      <div>
        <div className='total-spend-dashboard'>
          {' '}
          <div className='total-spend-dashboard-item'>
            {spendByCategoryThisMonth.length > 0 ? (
              <PieChart
                data={spendByCategoryThisMonth.map((s) => s.amount)}
                labels={spendByCategoryThisMonth.map(
                  (s) => `${s.name} (${getSymbolFromCurrency(currency)})`
                )}
                height={'345px'}
                width={'325px'}
                title={`Spend By Category This Month: Total:  ${currency} ${currencyProvider.sumToMainCurrency(
                  allSpendRecords
                ).toLocaleString()}`}
              />
            ) : (
              <div className='no-info-text'>
                NO SPEND RECORDS THIS MONTH.
                <br />
                <Button variant='primary' onClick={() => setToggleAddSpend((prev) => !prev)}>
                  Add You First Spend
                </Button>
              </div>
            )}
          </div>
          <div className='total-spend-dashboard-item'>
            <LineChart
              labelArray={sixMonthsLabels().map((l) => l.monthEnd)}
              dataArray={lastSixMonthsSpend}
              label={`monthly spend (in ${currency})`}
              // height={'100px'}
              // width={'100px'}
              title='Last 6 Months Expenditure'
            />
          </div>
        </div>
        <div className='total-spend-dashboard'>
          {' '}
          <div className='total-spend-dashboard-item'>
            {balancesByType.length > 0 ? (
              <PieChart
                data={balancesByType.map((b) => b.amount)}
                labels={balancesByType.map((b) => `${b.name} (${getSymbolFromCurrency(currency)})`)}
                height={'345px'}
                width={'325px'}
                title={`Current Balances Total: ${currency} ${currencyProvider
                  .sumToMainCurrency(balances)
                  .toLocaleString()}`}
              />
            ) : (
              <div className='no-info-text'>
                NO BALANCES ADDED.
                <br />
                <Button variant='primary' onClick={() => setToggleAddBalance((prev) => !prev)}>
                  Add You First Balance
                </Button>
                <br />
                <br />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
