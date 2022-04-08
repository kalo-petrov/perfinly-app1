import './WeekMonthTable.css';
import moment from 'moment';
import dateProvider from '../../providers/dateProvider';
import { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { useSelector, useDispatch } from 'react-redux';
import { getAllSpendRecords } from '../../actions';
import currencyProvider from '../../providers/CurrencyProvider';
import AuthContext from '../../context/AuthContext';
import getSymbolFromCurrency from 'currency-symbol-map';

const WeekMonthTable = ({
  confirmedFromDate,
  confirmedToDate,
  thisMonthSpendRecords,
  categories,
  subcategories,
  view,
}) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState(subcategories);

  const allSpendRecords = useSelector((state) => state.spendRecords);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllSpendRecords(thisMonthSpendRecords));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedSubcategories(subcategories.filter((sc) => sc.category_id === category));
    setSubcategory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filterResults = () => {
    dispatch(getAllSpendRecords(thisMonthSpendRecords));

    if (category && !subcategory) {
      dispatch(
        getAllSpendRecords(thisMonthSpendRecords.filter((sr) => sr.category_id === category))
      );
    } else if (category && Boolean(subcategory)) {
      dispatch(
        getAllSpendRecords(
          thisMonthSpendRecords.filter(
            (sr) => sr.category_id === category && sr.subcategory_id === subcategory
          )
        )
      );
    } else if (!Boolean(category) && !Boolean(subcategory)) {
      dispatch(getAllSpendRecords(thisMonthSpendRecords));
    }
  };

  const resetResults = () => {
    dispatch(getAllSpendRecords(thisMonthSpendRecords));
    setSelectedSubcategories([]);
    setCategory('');
  };

  const currency = useContext(AuthContext).user.currency;

  return (
    <div className='week-month-table-section'>
      <div className='by-week-table-options'>
        <div className='by-week-table-option'>
          <div htmlFor='category'>Category</div>
          <select name='category' value={category} onChange={(e) => setCategory(e.target.value)}>
            <option key={0.1} value={''}>
              Select...
            </option>
            {categories?.map((c) => {
              return (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className='by-week-table-option'>
          <div htmlFor='subcategory'>Subcategory</div>
          <select name='subcategory' onChange={(e) => setSubcategory(e.target.value)}>
            <option key={0.1} value={''}>
              Select...
            </option>
            {selectedSubcategories?.map((sc) => {
              return (
                <option key={sc._id} value={sc._id}>
                  {sc.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className='by-week-table-option'>
          <Button variant='outline-primary' onClick={() => filterResults()}>Filter</Button>
        </div>
        <div className='by-week-table-option'>
          <Button variant='outline-secondary' onClick={() => resetResults()}>
            Clear Filter
          </Button>
        </div>
      </div>
      <div className='week-month-table-container'>
        <table className='week-month-table'>
          <thead>
            <tr>
              <th className='table-header-cell' style={{ minWidth: '120px' }} key={1} scope='col'>
                Date
              </th>
              <th className='table-header-cell' style={{ minWidth: '100px' }} key={2} scope='col'>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {view === 'week'
              ? dateProvider.anyPeriodWeekly(confirmedFromDate, confirmedToDate)?.map((d) => {
                  return (
                    <tr key={d.weekStart}>
                      <th>
                        {' '}
                        {d.weekStart} / {d.weekEnd}
                      </th>
                      <th>
                        {' '}
                        {getSymbolFromCurrency(currency)}{' '}
                        {currencyProvider
                          .sumToMainCurrency(
                            allSpendRecords.filter(
                              (sp) =>
                                sp.date.slice(0, 10) >= d.weekStart.slice(0, 10) &&
                                sp.date.slice(0, 10) <= d.weekEnd.slice(0, 10)
                            )
                          )
                          .toLocaleString()}
                      </th>
                    </tr>
                  );
                })
              : dateProvider.anyPeriodMonthly(confirmedFromDate, confirmedToDate)?.map((d) => {
                  return (
                    <tr key={d}>
                      <th> {moment(d).format('MMMM YYYY')}</th>
                      <th>
                        {getSymbolFromCurrency(currency)}{' '}
                        {currencyProvider
                          .sumToMainCurrency(
                            allSpendRecords.filter(
                              (sp) =>
                                sp.date.slice(0, 10) >= d.slice(0, 10) &&
                                sp.date.slice(0, 10) <=
                                  moment(d).endOf('month').format('yyyy-MM-DD')
                            )
                          )
                          .toLocaleString()}
                      </th>
                    </tr>
                  );
                })}
              <tr className='daily-table-bottom-row'>
              <th> Total On Page</th>
              <th>
                {getSymbolFromCurrency(currency)}{' '}
                {currencyProvider.sumToMainCurrency(thisMonthSpendRecords).toLocaleString()}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeekMonthTable;
