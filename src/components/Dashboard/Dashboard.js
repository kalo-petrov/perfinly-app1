import React, { useContext, useEffect, useState } from 'react';
import './Dashboard.css';
import { BASE_URL } from '../../common/constants';
import httpProvider from '../../providers/httpProvider';
import InfoCard from '../InfoCard/InfoCard';
import moment from 'moment';
import Error from '../Base/Error/Error';
import PieChart from '../Charts/PieChart/PieChart';
import LineChart from '../Charts/LineChart/LineChart';
import Loader from '../Base/Loader/Loader';
import currencyProvider from '../../providers/CurrencyProvider';
import AuthContext from '../context/AuthContext';

function Dashboard() {
  const [error, setError] = useState(null);
  const [spendLastMonth, setSpendLastMonth] = useState([]);
  const [spendThisMonth, setSpendThisMonth] = useState([]);
  const [topCategoryThisMonth, setTopCategoryThisMonth] = useState({ category: '', amount: 0 });
  const [loading, setLoading] = useState(false);
  const [spendByCategoryThisMonth, setSpendByCategoryThisMonth] = useState([]);
  const [lastSixMonthsSpend, setLastSixMonthsSpend] = useState([]);
  const [balancesByType, setBalancesByType] = useState([]);
  const [balances, setBalances] = useState([]);

  const currency = useContext(AuthContext).user.currency;

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
      const lastMonthStart = moment().subtract(1, 'months').startOf('month').format('yyyy-MM-DD');
      const lastMonthEnd = moment().subtract(1, 'months').endOf('month').format('yyyy-MM-DD');

      await httpProvider
        .get(`${BASE_URL}/spending?start_date=${lastMonthStart}&end_date=${lastMonthEnd}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSpendLastMonth(data);
          }
        })
        .catch((error) => setError(error.toString()));

      const thisMonthStart = moment().startOf('month').format('yyyy-MM-DD');
      const thisMonthEnd = moment().endOf('month').format('yyyy-MM-DD');

      await httpProvider
        .get(`${BASE_URL}/spending?start_date=${thisMonthStart}&end_date=${thisMonthEnd}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSpendThisMonth(data);

            const mapped = new Map();

            for (const element of data) {
              const amount = mapped.get(element.category_id) || 0;
              mapped.set(element.category_id, amount + Number(element.amount));
            }

            const OBJArr = [];

            httpProvider
              .get(`${BASE_URL}/spend-categories`)
              .then((data1) => {
                if (data1.error) {
                  setError(data1.error.toString());
                } else {
                  for (const [key, value] of mapped) {
                    OBJArr.push({
                      category_id: key,
                      amount: value,
                      name: data1.find((c) => c._id === key)?.name,
                    });
                  }

                  setSpendByCategoryThisMonth(OBJArr);
                  setTopCategoryThisMonth(OBJArr.sort((a, b) => b.amount - a.amount)[0]);
                }
              })
              .catch((error) => console.log(error) + setError(error.toString()));
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
                      moment(d.date).format('yyyy-MM-DD') >=
                        moment(sixMonthsLabels()[i].monthStart).format('yyyy-MM-DD') &&
                      moment(d.date).format('yyyy-MM-DD') <=
                        moment(sixMonthsLabels()[i].monthEnd).format('yyyy-MM-DD')
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
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setBalances(data);
            const mapped = new Map();

            for (const element of data) {
              const amount = mapped.get(element.type_id) || 0;
              mapped.set(element.type_id, amount + Number(element.amount));
            }

            httpProvider
              .get(`${BASE_URL}/balance-types`)
              .then((data1) => {
                if (data1.error) {
                  setError(data1.error.toString());
                } else {
                  setBalancesByType([]);
                  for (const [key, value] of mapped) {
                    setBalancesByType((prev) => [
                      ...prev,
                      {
                        type_id: key,
                        amount: value,
                        name: data1.find((type) => type._id === key)?.name,
                      },
                    ]);
                  }
                }
              })
              .catch((error) => setError(error.toString()));
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className='dashboard-container'>
      <h3>Dashboard</h3>
      {error && <Error error={error} setError={setError} />}
      <br />
      <br />

      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className='total-spend-dashboard'>
            {' '}
            <div className='total-spend-dashboard-item'>
              <PieChart
                data={spendByCategoryThisMonth.map((s) => s.amount)}
                labels={spendByCategoryThisMonth.map((s) => s.name)}
                height={'345px'}
                width={'325px'}
                title={`Spend By Category This Month: Total:  ${currency} ${currencyProvider.sumToMainCurrency(
                  spendThisMonth
                )}`}
              />
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
              <PieChart
                data={balancesByType.map((b) => b.amount)}
                labels={balancesByType.map((b) => b.name)}
                height={'345px'}
                width={'325px'}
                title={`Current Balances Total: ${currency} ${currencyProvider.sumToMainCurrency(
                  balances
                )}`}
              />
            </div>
          </div>

          <div className='info-card-container'>
            <InfoCard
              title={'TOTAL SPEND LAST MONTH'}
              currency={currency}
              amount={currencyProvider.sumToMainCurrency(spendLastMonth)}
            />
            <InfoCard
              title={'TOTAL SPEND THIS MONTH'}
              currency={currency}
              amount={currencyProvider.sumToMainCurrency(spendThisMonth)}
            />
            <InfoCard
              title={`TOP SPEND CATEGORY THIS MONTH: ${
                topCategoryThisMonth?.name?.toUpperCase() || `None`
              }`}
              currency={currency}
              amount={topCategoryThisMonth?.amount.toFixed(2)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
