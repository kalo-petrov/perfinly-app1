import './ByDayTable.css';
import IndividualSpend from '../IndividualSpend/IndividualSpend';
import dateProvider from '../../providers/dateProvider';
import React, { useState,  useContext } from 'react';
import Button from 'react-bootstrap/esm/Button';
import {  useSelector } from 'react-redux';
import AuthContext from '../../context/AuthContext';
import currencyProvider from '../../providers/CurrencyProvider';

const ByDayByCategoryTable = ({
  categories,
  subcategories,
  confirmedFromDate,
  confirmedToDate,
  toggleEdit,
  setToggleEdit,
  setSelectedSpend,
  setSelectedCategory,
  setSelectedDate,
  setToggleAddSpend,
}) => {
  const [catOrSubCat, setCatOrSubcat] = useState('cat');

  const allSpendRecords = useSelector((state) => state.spendRecords);


  const currency = useContext(AuthContext).user.currency;

  return (
    <div className='by-day-table-container'>
      <div className='by-day-table-options'>
        <div className='by-day-table-option'>
          <Button variant='outline-dark' onClick={() => setCatOrSubcat('cat')}>
            Categories
          </Button>
        </div>
        <div className='by-day-table-option'>
          <Button variant='outline-dark' onClick={() => setCatOrSubcat('subcat')}>
            Subcategories
          </Button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th className='table-header-cell' style={{ width: '100px' }} key={1} scope='col'>
              Date
            </th>
            <th className='table-header-cell' style={{ width: '80px' }} key={2} scope='col'>
              Total
            </th>
            {(catOrSubCat === 'cat' ? categories : subcategories)?.map((c) => {
              return (
                <th className='table-header-cell' key={c._id} id={c.name}>
                  {c.name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dateProvider.anyPeriod(confirmedFromDate, confirmedToDate)?.map((d) => {
            return (
              <tr key={d}>
                <th> {d}</th>
                <th>
                  {currencyProvider.sumToMainCurrency(
                    allSpendRecords.filter(
                      (sp) => new Date(sp.date).getDate() === new Date(d).getDate()
                    )
                  )}
                </th>
                {(catOrSubCat === 'cat' ? categories : subcategories)?.map((c) => {
                  const spendsForDayAndCategory = allSpendRecords.filter((r) => {
                    return (
                      (catOrSubCat === 'cat' ? r.category_id : r.subcategory_id) === c._id &&
                      new Date(r.date).getDate() === new Date(d).getDate()
                    );
                  });
                  return spendsForDayAndCategory[0] ? (
                    <td className='table-cell-with-spend' key={c._id}>
                      {spendsForDayAndCategory?.map((s, i) => (
                        <IndividualSpend
                          key={i}
                          keys={c._id}
                          spendRecord={s}
                          toggleEdit={toggleEdit}
                          setToggleEdit={setToggleEdit}
                          setSelectedSpend={setSelectedSpend}
                        />
                      ))}
                      <Button
                        className='button-add-spend-incell'
                        onClick={() =>
                          setSelectedDate(d) + setSelectedCategory(c._id) + setToggleAddSpend(true)
                        }
                      >
                        +
                      </Button>
                    </td>
                  ) : (
                    <td className='table-cell-without-spend' key={c._id}>
                      <Button
                        className='button-add-spend-incell'
                        onClick={() =>
                          setSelectedDate(d) + setSelectedCategory(c._id) + setToggleAddSpend(true)
                        }
                      >
                        +
                      </Button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <th> Total On Page</th>
            <th>
              {currency} {currencyProvider.sumToMainCurrency(allSpendRecords)}
            </th>
            {(catOrSubCat === 'cat' ? categories : subcategories)?.map((c) => {
              return (
                <td key={c._id}>
                  {currencyProvider.sumToMainCurrency(
                    allSpendRecords.filter(
                      (sp) => (catOrSubCat === 'cat' ? sp.category_id : sp.subcategory_id) === c._id
                    )
                  ) || '0'}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ByDayByCategoryTable;
