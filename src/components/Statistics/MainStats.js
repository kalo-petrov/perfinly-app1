import './MainStats.css';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import httpProvider from '../../providers/httpProvider';
import { BASE_URL } from '../../common/constants';
import CreateSpendRecord from './../CreateSpendRecord/CreateSpendRecord';
import 'react-day-picker/lib/style.css';
import EditSpendRecord from '../EditSpendRecord/EditSpendRecord';
import Error from '../Base/Error/Error';
import StatsHeader from './StatsHeader';
import ByDayTable from '../ByDayTable/ByDayTable';
import WeekMonthTable from '../WeekMonthTable/WeekMonthTable';
import LineChart from '../Charts/LineChart/LineChart';
import dateProvider from '../../providers/dateProvider';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSpendRecords } from './../../actions/index';
import AllExpenses from '../AllExpenses/AllExpenses';
import Loader from './../Base/Loader/Loader';
import useComponentVisible from './../../hooks/useComponentVisible';
import currencyProvider from '../../providers/CurrencyProvider';
import PieChart from '../Charts/PieChart/PieChart';
import AuthContext from '../../context/AuthContext';
import getSymbolFromCurrency from 'currency-symbol-map';

const MainStats = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSpend, setSelectedSpend] = useState({});
  const [fromDate, setFromDate] = useState(new Date(moment().subtract(6, 'days').startOf('day')));
  const [toDate, setToDate] = useState(new Date(moment().startOf('day')));
  const [confirmedFromDate, setConfirmedFromDate] = useState(
    new Date(moment().subtract(6, 'days').startOf('day'))
  );
  const [confirmedToDate, setConfirmedToDate] = useState(new Date(moment().startOf('day')));

  const [thisMonthSpendRecords, setThisMonthSpendRecords] = useState([]);
  const [refreshed, setRefreshed] = useState(false);
  const [spendByCategoryThisMonth, setSpendByCategoryThisMonth] = useState([]);
  const dispatch = useDispatch();

  const {
    ref: ref2,
    isComponentVisible: toggleAddSpend,
    setIsComponentVisible: setToggleAddSpend,
  } = useComponentVisible(false);
  const {
    ref: ref3,
    isComponentVisible: toggleEdit,
    setIsComponentVisible: setToggleEdit,
  } = useComponentVisible(false);

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const mapped = new Map();
      const OBJArr = [];

      setLoading(true);

      await httpProvider
        .get(`${BASE_URL}/spend-categories/1/all-subcategories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSubcategories(data);
          }
        })
        .catch((error) => setError(error.toString()));

      await httpProvider
        .get(`${BASE_URL}/spending?start_date=${confirmedFromDate}&end_date=${confirmedToDate}`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            dispatch(getAllSpendRecords(data));
            setThisMonthSpendRecords(data);

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

          }
        })
        .catch((error) => setError(error.toString()));

        await httpProvider
        .get(`${BASE_URL}/spend-categories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setCategories(data);
            for (const [key, value] of mapped) {
              OBJArr.push({
                category_id: key,
                amount: value,
                name: data.find((c) => c._id === key)?.name,
                currency: getSymbolFromCurrency(currency),
              });
            }
            setSpendByCategoryThisMonth(OBJArr.sort((a, b) => b.amount - a.amount));
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading(false);
    };

    fetchData();

    // return () => {
    //     setCategories([]);
    //     setSubcategories([]);
    //     setThisMonthSpendRecords([]);
    //     setError(null);
    // };
  }, [confirmedFromDate, confirmedToDate, refreshed]);

  const currency = useContext(AuthContext).user.currency;

  const applyDates = async () => {
    setLoading(true);
    const from = moment(fromDate).format('yyyy-MM-DD');
    const to = moment(toDate).format('yyyy-MM-DD');
    setConfirmedFromDate(from);
    setConfirmedToDate(to);

    await httpProvider
      .get(`${BASE_URL}/spending?start_date=${from}&end_date=${to}`)
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setThisMonthSpendRecords(data);
          dispatch(getAllSpendRecords(data));
          setLoading(false);
        }
      })
      .catch((error) => setError(error.toString()));
  };

  const labelArray = () => {
    if (history.location.pathname.includes('daily')) {
      return dateProvider.anyPeriod(confirmedFromDate, confirmedToDate)?.map((d) => d);
    } else if (history.location.pathname.includes('week')) {
      return dateProvider
        .anyPeriodWeekly(confirmedFromDate, confirmedToDate)
        ?.map((d) => `${d.weekStart}-${d.weekEnd}`);
    } else if (history.location.pathname.includes('month')) {
      return dateProvider.anyPeriodMonthly(confirmedFromDate, confirmedToDate)?.map((d) => d);
    } else {
      return [0, 1];
    }
  };

  const allSpendRecords = useSelector((state) => state.spendRecords);

  const dataArray = () => {
    if (history.location.pathname.includes('daily')) {
      return dateProvider.anyPeriod(confirmedFromDate, confirmedToDate)?.map((d) => {
        return currencyProvider.sumToMainCurrency(
          allSpendRecords.filter(
            (sr) =>
              moment(sr.date.slice(0, 10)).format('yyyy-MM-DD') ===
              moment(d.slice(0, 10)).startOf('day').format('yyyy-MM-DD')
          )
        );
      });
    } else if (history.location.pathname.includes('week')) {
      return dateProvider.anyPeriodWeekly(confirmedFromDate, confirmedToDate)?.map((d) => {
        return currencyProvider.sumToMainCurrency(
          allSpendRecords.filter(
            (sr) =>
              moment(sr.date.slice(0, 10)).format('yyyy-MM-DD') >= d.weekStart &&
              moment(sr.date.slice(0, 10)).format('yyyy-MM-DD') <= d.weekEnd
          )
        );
      });
    } else if (history.location.pathname.includes('month')) {
      return dateProvider.anyPeriodMonthly(confirmedFromDate, confirmedToDate)?.map((d) => {
        return currencyProvider.sumToMainCurrency(
          allSpendRecords.filter(
            (sr) =>
              moment(sr.date.slice(0, 10)).format('yyyy-MM-DD') >= d.slice(0, 10) &&
              moment(sr.date.slice(0, 10)).format('yyyy-MM-DD') <
                moment(d.slice(0, 10)).add(1, 'month').format('yyyy-MM-DD')
          )
        );
      });
    } else {
      return [0, 1];
    }
  };

  const lineChartTitle = () => {
    const title = history.location.pathname;
    if (title.includes('daily-table')) {
      return 'daily';
    } else if (title.includes('weekly-table')) {
      return 'weekly';
    } else if (title.includes('monthly-table')) {
      return 'monthly';
    }
  };
  return (
    <div className='stats-container'>
      <h3>Statistics</h3>
      {error && <Error error={error} setError={setError} />}

      {toggleAddSpend && (
        <div ref={ref2}>
          <CreateSpendRecord
            setToggleAddSpend={setToggleAddSpend}
            selectedDate={selectedDate}
            selectedCat={selectedCategory}
            categories={categories}
            subcategories={subcategories}
          />
        </div>
      )}
      {toggleEdit && (
        <div ref={ref3}>
          <EditSpendRecord
            categories={categories}
            subcategories={subcategories}
            setToggleEdit={setToggleEdit}
            selectedSpend={selectedSpend}
            setThisMonthSpendRecords={setThisMonthSpendRecords}
          />
        </div>
      )}
      <StatsHeader
        fromDate={fromDate}
        toDate={toDate}
        applyDates={applyDates}
        setFromDate={setFromDate}
        setToDate={setToDate}
        setRefreshed={setRefreshed}
      />

      {loading ? (
        <Loader />
      ) : (
        (history.location.pathname.includes('daily-table') && (
          <ByDayTable
            categories={categories}
            subcategories={subcategories}
            confirmedFromDate={confirmedFromDate}
            confirmedToDate={confirmedToDate}
            toggleEdit={toggleEdit}
            thisMonthSpendRecords={thisMonthSpendRecords}
            setToggleEdit={setToggleEdit}
            setSelectedSpend={setSelectedSpend}
            setSelectedDate={setSelectedDate}
            setSelectedCategory={setSelectedCategory}
            setToggleAddSpend={setToggleAddSpend}
          />
        )) ||
        ((history.location.pathname.includes('weekly-table') ||
          history.location.pathname.includes('monthly-table')) && (
          <WeekMonthTable
            confirmedFromDate={confirmedFromDate}
            confirmedToDate={confirmedToDate}
            thisMonthSpendRecords={thisMonthSpendRecords}
            categories={categories}
            subcategories={subcategories}
            view={history.location.pathname.includes('weekly-table') ? 'week' : 'month'}
          />
        )) ||
        (history.location.pathname.includes('all-expenses') && (
          <AllExpenses
            categories={categories}
            subcategories={subcategories}
            setToggleEdit={setToggleEdit}
            setSelectedSpend={setSelectedSpend}
            thisMonthSpendRecords={thisMonthSpendRecords}
            confirmedFromDate={confirmedFromDate}
            confirmedToDate={confirmedToDate}
          />
        ))
      )}
      {history.location.pathname.includes('table') && (
        <LineChart
          labelArray={labelArray()}
          dataArray={dataArray()}
          label=''
          title={lineChartTitle()}
        />
      )}
      {history.location.pathname.includes('table') && (
        <PieChart
          data={spendByCategoryThisMonth.map((s) => s.amount)}
          labels={spendByCategoryThisMonth.map(
            (s) => `${s.name} (${getSymbolFromCurrency(currency)})`
          )}
          height={'445px'}
          width={'425px'}
          title={`Spend By Category This Month: Total:  ${currency} ${currencyProvider
            .sumToMainCurrency(allSpendRecords)
            .toLocaleString()}`}
        />
      )}
    </div>
  );
};

export default MainStats;
