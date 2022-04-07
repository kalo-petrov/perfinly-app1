import React, { useContext, useEffect, useState } from 'react';
import './AllExpenses.css';
import moment from 'moment';
import FeatherIcon from 'feather-icons-react';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import Button from 'react-bootstrap/esm/Button';
import useSortableData from './../../hooks/useSortableData';
import { useSelector, useDispatch } from 'react-redux';
import { getAllSpendRecords } from '../../actions';
import currencyProvider from '../../providers/CurrencyProvider';
import AuthContext from '../../context/AuthContext';

const AllExpenses = ({
  thisMonthSpendRecords,
  categories,
  subcategories,
  setToggleEdit,
  setSelectedSpend,
  confirmedFromDate,
  confirmedToDate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [balances, setBalances] = useState([]);

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


  useEffect(() => {
    httpProvider
      .get(`${BASE_URL}/balances`)
      .then((data) => {
        if (data.error) {
        } else {
          setBalances(data);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSearch = (e) => {
    if (e.keyCode === 13 || e.type === 'click') {
      httpProvider
        .get(
          `${BASE_URL}/spending?search=${searchTerm}&start_date=${confirmedFromDate}&end_date=${confirmedToDate}`
        )
        .then((data) => {
          if (data.error) {
          }
          setCategory(null);
          setSubcategory(null);
          setSelectedSubcategories([]);
          dispatch(getAllSpendRecords(data));
          setSearchTerm('');
          document.getElementById('category-selector').value = '';
        })
        .catch((error) => console.error(error));
    }
  };

  const { items, requestSort } = useSortableData(allSpendRecords);

  useEffect(() => {
    dispatch(getAllSpendRecords(thisMonthSpendRecords));
  }, [dispatch, thisMonthSpendRecords]);

  const currency = useContext(AuthContext).user.currency;

  return (
    <div>
      <h3>All Expenses</h3>

      <div>
        {' '}
        <span>
          <input
            className='expense-search-box'
            type='text'
            id='search-box'
            name='search'
            placeholder='Search by description'
            onKeyUp={(e) => handleSearch(e)}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />{' '}
        </span>
        <Button variant='outline-primary' onClick={(e) => handleSearch(e)}>
          <FeatherIcon icon='search' />{' '}
        </Button>
      </div>
      <div className='by-week-table-options'>
        <div className='by-week-table-option'>
          <div htmlFor='category'>Category</div>
          <select
            id='category-selector'
            name='category'
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
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
          <Button onClick={() => filterResults()}>Filter</Button>
        </div>
        <div className='by-week-table-option'>
          <Button variant='outline-secondary' onClick={() => resetResults()}>
            Clear Filter
          </Button>
        </div>
      </div>
      <br />

      <div className='all-expenses-table-container'>
        <table className='all-expenses-table'>
          <thead>
            <tr>
              <th className='expenses-thead' onClick={() => requestSort('description')}>
                Expense
              </th>
              <th className='expenses-thead' onClick={() => requestSort('amount')}>
                Amount
              </th>
              <th className='expenses-thead' onClick={() => requestSort('currency')}>
                Currency
              </th>
              <th className='expenses-thead' onClick={() => requestSort('date')}>
                Date
              </th>
              <th className='expenses-thead' onClick={() => requestSort('category_id')}>
                Category
              </th>
              <th className='expenses-thead' onClick={() => requestSort('subcategory_id')}>
                Subcategory
              </th>
              <th className='expenses-thead' onClick={() => requestSort('balance_id')}>
                Paid with Balance
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((record) => {
              return (
                <tr key={record._id}>
                  <td>{record.description}</td>
                  <td>{record.amount.toLocaleString()}</td>
                  <td>{record.currency}</td>
                  <td>{(record.date).slice(0,10)}</td>
                  <td>{categories.find((c) => c._id === record.category_id)?.name}</td>
                  <td>{subcategories.find((sc) => sc._id === record.subcategory_id)?.name}</td>
                  <td>{balances.find((b) => b._id === record.balance_id)?.description}</td>
                  <td>
                    <FeatherIcon
                      icon='edit'
                      onClick={() => setSelectedSpend(record) + setToggleEdit(true)}
                    />
                  </td>
                </tr>
              );
            })}
            <tr style={{fontWeight: '700'}}>
              <td>Total</td>
              <td>{currencyProvider.sumToMainCurrency(thisMonthSpendRecords).toLocaleString()}</td>
              <td>{currency}</td>

            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllExpenses;
