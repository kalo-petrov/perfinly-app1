import './StatsHeader.css';
import moment from 'moment';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import useComponentVisible from './../../hooks/useComponentVisible';

const StatsHeader = ({ fromDate, toDate, applyDates, setFromDate, setToDate, setRefreshed }) => {
  const [enteredTo, setEnteredTo] = useState(null);
  const history = useHistory();
  const [selectedStats, setSelectedStats] = useState(history.location.pathname.slice(12));
  const {
    ref,
    isComponentVisible: toggleDayPicker,
    setIsComponentVisible: setToggleDayPicker,
  } = useComponentVisible(false);

  const modifiers = {
    start: new Date(fromDate),
    end: new Date(toDate),
    betweenDays: {
      before: new Date(fromDate) && new Date(toDate) ? new Date(toDate) : undefined,
      after: new Date(fromDate) && new Date(toDate) ? new Date(fromDate) : undefined,
    },
  };

  const modifiersStyles = {
    start: {
      color: 'white',
      backgroundColor: '#0096FF',
    },
    end: {
      color: 'white',
      backgroundColor: '#0096FF',
    },
    betweenDays: {
      color: '#0096FF',
      backgroundColor: '#e1f2ff',
    },
  };

  const { url } = useRouteMatch();

  const isSelectingFirstDay = (from, to, day) => {
    const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
    const isRangeSelected = from && to;
    return !from || isBeforeFirstDay || isRangeSelected;
  };

  const handleResetClick = () => {
    setEnteredTo(null);
    setFromDate(null);
    setToDate(null);
  };

  const handleDayMouseEnter = (day) => {
    if (!isSelectingFirstDay(fromDate, toDate, day)) {
      setEnteredTo(day);
    }
  };

  const handleDayClick = (day) => {
    if (fromDate && toDate && day >= fromDate && day <= toDate) {
      handleResetClick();
      return;
    }
    if (isSelectingFirstDay(fromDate, toDate, day)) {
      setFromDate(day);
      setToDate(null);
      setEnteredTo(null);
    } else {
      setToDate(day);
      setEnteredTo(day);
    }
  };

  const last7Days = () => {
    setFromDate(new Date(moment().subtract(6, 'days')));
    setToDate(new Date(moment()));
  };

  const thisWeek = () => {
    setFromDate(new Date(moment().startOf('isoWeek')));
    setToDate(new Date(moment().endOf('isoWeek')));
  };

  const monthToDate = () => {
    setFromDate(new Date(moment().startOf('month')));
    setToDate(new Date(moment()));
  };
  const last30dDays = () => {
    setFromDate(new Date(moment().subtract(1, 'month')));
    setToDate(new Date(moment()));
  };
  const lastMonth = () => {
    setFromDate(new Date(moment().subtract(1, 'month').startOf('month')));
    setToDate(new Date(moment().subtract(1, 'month').endOf('month')));
  };
  const last6Months = () => {
    setFromDate(new Date(moment().subtract(5, 'month').startOf('month')));
    setToDate(new Date(moment().endOf('month')));
  };

  return (
    <div>
      <div className='stats-header-section'>
        <div className='stats-header-section-item'>
          <Link to={`${url}/daily-table`}>
            {' '}
            <Button
              variant={selectedStats === 'daily-table' ? 'primary' : 'outline-primary'}
              name='daily-table'
              onClick={() => history.push(`/daily-table`) + setSelectedStats('daily-table')}
            >
              Daily Table
            </Button>{' '}
          </Link>
        </div>
        <div className='stats-header-section-item'>
          <Link to={`${url}/weekly-table`}>
            <Button
              variant={selectedStats === 'weekly-table' ? 'primary' : 'outline-primary'}
              name='weekly-table'
              onClick={() => history.push(`/weekly-table`) + setSelectedStats('weekly-table')}
            >
              Weekly Table
            </Button>
          </Link>
        </div>
        <div className='stats-header-section-item'>
          <Link to={`${url}/monthly-table`}>
            <Button
               variant={selectedStats === 'monthly-table' ? 'primary' : 'outline-primary'}
              name='monthly-table'
              onClick={() => history.push(`/monthly-table`) + setSelectedStats('monthly-table')}
            >
              Monthly Table
            </Button>
          </Link>
        </div>
        <div className='stats-header-section-item'>
          <Link to={`${url}/all-expenses`}>
            <Button
              variant={selectedStats === 'all-expenses' ? 'primary' : 'outline-primary'}
              name='all-expenses'
              onClick={() => history.push(`/all-expenses`) + setSelectedStats('all-expenses`')}
            >
              All Expenses
            </Button>
          </Link>
        </div>
      </div>
      <div className='stats-filters-section'>
        <div className='stats-filter-item'>
          <div>
            <input
              className='input-date-picker'
              type='text'
              value={`${moment(fromDate).format('yyyy-MM-DD')} -- ${moment(toDate).format(
                'yyyy-MM-DD'
              )}`}
              onClick={() => setToggleDayPicker((prev) => !prev)}
              onChange={() => {}}
            />
          </div>
          <div>
            {' '}
            {toggleDayPicker && (
              <div className='day-picker-component' ref={ref}>
                <DayPicker
                  className='Range'
                  numberOfMonths={2}
                  month={fromDate}
                  onDayClick={handleDayClick}
                  selectedDays={[fromDate, { fromDate, to: toDate }, toDate]}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  onDayMouseEnter={(e) => handleDayMouseEnter(e)}
                  firstDayOfWeek={1}
                />

                <div className='day-picker-options'>
                  <Button variant='outline-dark' onClick={last7Days}>
                    Last 7 Days
                  </Button>
                  <Button variant='outline-dark' onClick={thisWeek}>
                    This Week
                  </Button>
                  <Button variant='outline-dark' onClick={monthToDate}>
                    Month To Date
                  </Button>
                  <Button variant='outline-dark' onClick={last30dDays}>
                    Last 30 days
                  </Button>
                  <Button variant='outline-dark' onClick={lastMonth}>
                    Last Month
                  </Button>
                  <Button variant='outline-dark' onClick={last6Months}>
                    Last 6 Months
                  </Button>
                  <div>-------</div>
                  <div></div>
                  <Button
                    disabled={!(fromDate && toDate)}
                    onClick={() => applyDates() + setToggleDayPicker(false)}
                  >
                    Apply
                  </Button>
                  <Button variant='secondary' onClick={handleResetClick}>
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='stats-filter-item'>
          <Button variant='outline-primary' onClick={() => setRefreshed((prev) => !prev)}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
