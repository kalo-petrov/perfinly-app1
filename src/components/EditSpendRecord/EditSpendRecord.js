import React, { useState, useEffect } from 'react';
import './EditSpendRecord.css';
import moment from 'moment';
import httpProvider from '../../providers/httpProvider';
import { BASE_URL } from '../../common/constants';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import CloseButtoon from 'react-bootstrap/esm/CloseButton';
import Form from 'react-bootstrap/esm/Form';
import Loader from './../Base/Loader/Loader';
import currencyList from '../../providers/currencyList.json';

const EditSpendRecord = ({
  selectedSpend,
  setToggleEdit,
  setThisMonthSpendRecords,
  categories,
  subcategories,
}) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const [description, setDescription] = useState(selectedSpend.description);
  const [amount, setAmount] = useState(selectedSpend.amount);
  const [currency, setCurrency] = useState(selectedSpend.currency);
  const [date, setDate] = useState(moment(selectedSpend.date.slice(0, 10)).format('yyyy-MM-DD'));
  const [category, setCategory] = useState(selectedSpend.category_id);
  const [subcategory, setSubcategory] = useState(selectedSpend.subcategory_id);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(selectedSpend.category_id);
  const [balance, setBalance] = useState(selectedSpend.balance_id);
  const [balances, setBalances] = useState([]);
  const [paidWithBalance, setPaidWithBalance] = useState(selectedSpend.balance_id ? true : false);
  const [isReccurring, setIsRecurring] = useState(selectedSpend.recurrence ? true : false);
  const [repeatingPeriod, setRepeatingPeriod] = useState(selectedSpend.recurrence);

  useEffect(() => {
    async function fetchData() {
      await httpProvider
        .get(`${BASE_URL}/balances`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setBalances(data);
          }
        })
        .catch((error) => setError(error.toString()));
    }

    fetchData();

    return () => {
      setError('');
      setSelectedCategory('');
    };
  }, []);

  const submitEditedRecord = async (e) => {
    e.preventDefault();
    setLoading(true);

    const recordObject = {
      description,
      amount: Number(amount),
      currency,
      date,
      category_id: category,
      subcategory_id: subcategory,
      balance_id: balance || null,
      recurrence: isReccurring ? repeatingPeriod : null,
      recurrence_id: selectedSpend.recurrence_id,
    };

    for (const [key, value] of Object.entries(recordObject)) {
      if (key === 'description' && (!value || value === 'init')) {
        setVerificationMessage(`${key} `);
        setLoading(false);
        return;
      } else if (key === 'amount' && (!value || value === 'init' || value <= 0)) {
        setVerificationMessage(`${key} and should be number larger than 0`);
        setLoading(false);
        return;
      } else if (key === 'category_id' && (!value || value === 'init')) {
        setVerificationMessage(`Please select a category `);
        setLoading(false);
        return;
      } else if (key === 'date' && (!value || value === 'init')) {
        setVerificationMessage(`Please select a date `);
        setLoading(false);
        return;
      } else {
        setVerificationMessage('');
      }
    }

    await httpProvider
      .put(`${BASE_URL}/spending/${selectedSpend._id}`, recordObject)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setToggleEdit(false);
          setThisMonthSpendRecords((prev) =>
            prev.map((sr) => {
              if (sr._id === selectedSpend._id) {
                return { ...sr, ...recordObject };
              } else {
                return sr;
              }
            })
          );
        }
      })
      .catch((e) => console.error(e));

    setLoading(false);
  };

  const deleteRecord = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      window.confirm(`Are you sure you want to delete this record ${selectedSpend.description}?`)
    ) {
      await httpProvider
        .deleteReq(`${BASE_URL}/spending/${selectedSpend._id}`)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setToggleEdit(false);
            setThisMonthSpendRecords((prev) => prev.filter((r) => r._id !== selectedSpend._id));
          }
        })
        .catch((error) => setError(error.toString()));
    } else {
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    setSelectedSubcategories(subcategories.filter((sc) => sc.category_id === selectedCategory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, selectedCategory]);

  return (
    <div className='edit-spend-modal'>
      {error && <Error error={error} setError={setError} />}
      {loading && <Loader height={'3.5em'} width={'2.5em'} />}
      <CloseButtoon className='close-btn' onClick={() => setToggleEdit(false)} />
      <h4>Edit Spend Record</h4>
      <br />
      {verificationMessage && <p>{verificationMessage} required</p>}
      <div className='edit-spend-fields-container'>
        <div className='editable-spend-item'>
          <Form.Group>
            {/* <Form.Label>Description</Form.Label> */}
            <Form.Control
              name='description'
              value={description}
              type='text'
              className={verificationMessage.includes('description') ? 'unverified-input' : 'ok'}
              placeholder='add description of your spend'
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description === '.' && setDescription('')}
            />
          </Form.Group>
        </div>
        <div className='editable-spend-item'>
          <Form.Group>
            {/* <Form.Label>Amount</Form.Label> */}
            <Form.Control
              name='Amount'
              type='number'
              value={amount}
              className={verificationMessage.includes('amount') ? 'unverified-input' : 'ok'}
              placeholder='add the amount'
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => amount === 1 && setAmount(0)}
            />
          </Form.Group>
        </div>
        <div className='editable-spend-item'>
          <Form.Select
            aria-label='currency'
            name='currency'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option key={0.1} value='none' disabled hidden>
              Select Currency
            </option>
            {currencyList?.currencyList?.map((c) => {
              return (
                <option key={c} value={c}>
                  {c}
                </option>
              );
            })}
          </Form.Select>
        </div>

        <div className='editable-spend-item'>
          <Form.Group>
            <Form.Control
              name='date'
              type='date'
              value={moment(date).format('yyyy-MM-DD')}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
        </div>

        <div className='editable-spend-item'>
          <Form.Select
            aria-label='category'
            name='category'
            onChange={(e) => setSelectedCategory(e.target.value) + setCategory(e.target.value)}
            value={category}
          >
            {categories?.map((c) => {
              return (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              );
            })}
          </Form.Select>
        </div>

        <div className='editable-spend-item'>
          <Form.Select
            aria-label='subcategory'
            name='subcategory'
            onChange={(e) => setSubcategory(e.target.value)}
            value={subcategory}
          >
            <option key={0.1} value='default'>
              Select Subcategory
            </option>
            {selectedSubcategories?.map((sc) => {
              return (
                <option key={sc._id} value={sc._id}>
                  {sc.name}
                </option>
              );
            })}
          </Form.Select>
        </div>
        {/* {!isReccurring ? (
          <div className='edit-spend-input-checkbox'>
            {' '}
            <Form.Check
              type={'checkbox'}
              checked={paidWithBalance}
              label={'Paid With Balance'}
              onChange={() => setPaidWithBalance((prev) => !prev)}
            />
          </div>
        ) : (
          <></>
        )}
        <div className='edit-spend-input-item'>
          {paidWithBalance && !isReccurring ? (
            <Form.Select
              aria-label='balances'
              name='balances'
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              style={{ overflow: 'scroll' }}
            >
              {balances?.map((b) => {
                return (
                  <option key={b._id} value={b._id}>
                    {b.description} - {b.amount} | {b.currency}
                  </option>
                );
              })}
            </Form.Select>
          ) : (
            <></>
          )}
        </div>
        {!paidWithBalance ? (
          <div className='edit-spend-input-checkbox'>
            {' '}
            <Form.Check
              type={'checkbox'}
              label={'Is a Recurring Payment?'}
              checked={isReccurring}
              onChange={() => setIsRecurring((prev) => !prev)}
            />
          </div>
        ) : (
          <></>
        )}

        <div className='edit-spend-input-item'>
          {isReccurring && !paidWithBalance ? (
            <Form.Select
              aria-label='repeating'
              name='repeating'
              value={repeatingPeriod}
              onChange={(e) => setRepeatingPeriod(e.target.value)}
              style={{ overflow: 'scroll' }}
            >
              {['monthly', 'weekly', 'daily', 'annualy']?.map((p, i) => {
                return (
                  <option key={i} value={p}>
                    {p}
                  </option>
                );
              })}
            </Form.Select>
          ) : (
            <></>
          )}
        </div> */}
        <br />
        <br />
        <div className='editable-spend-item'>
          <Button variant='primary' onClick={(e) => submitEditedRecord(e)}>
            Submit
          </Button>{' '}
          <Button variant='secondary' onClick={() => setToggleEdit(false)}>
            Cancel
          </Button>{' '}
          <Button variant='outline-danger' onClick={(e) => deleteRecord(e)}>
            Delete Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSpendRecord;
