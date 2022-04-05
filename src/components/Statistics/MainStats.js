import './MainStats.css';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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
      setLoading(true);
      await httpProvider
        .get(`${BASE_URL}/spend-categories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setCategories(data);
          }
        })
        .catch((error) => setError(error.toString()));

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
            dispatch(getAllSpendRecords(data))
            setThisMonthSpendRecords(data)
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

  const applyDates = () => {
    setLoading(true);
    const from = moment(fromDate).format('yyyy-MM-DD');
    const to = moment(toDate).format('yyyy-MM-DD');
    setConfirmedFromDate(from);
    setConfirmedToDate(to);

    httpProvider
      .get(`${BASE_URL}/spending?start_date=${from}&end_date=${to}`)
      .then((data) => {
        if (data.error) {
          setError(data.error.toString());
        } else {
          setThisMonthSpendRecords(data);
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
              moment(d).startOf('day').format('yyyy-MM-DD')
          )
        );
      });
    } else if (history.location.pathname.includes('week')) {
      return dateProvider.anyPeriodWeekly(confirmedFromDate, confirmedToDate)?.map((d) => {
        return currencyProvider.sumToMainCurrency(
          allSpendRecords.filter(
            (sr) =>
              moment(sr.date).format('yyyy-MM-DD') >= d.weekStart &&
              moment(sr.date).format('yyyy-MM-DD') <= d.weekEnd
          )
        );
      });
    } else if (history.location.pathname.includes('month')) {
      return dateProvider.anyPeriodMonthly(confirmedFromDate, confirmedToDate)?.map((d) => {
        return currencyProvider.sumToMainCurrency(
          allSpendRecords.filter(
            (sr) =>
              moment(sr.date).format('yyyy-MM-DD') >= d &&
              moment(sr.date).format('yyyy-MM-DD') <= moment(d).add(1, 'month').format('yyyy-MM-DD')
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
    </div>
  );
};

export default MainStats;
