import React, { useContext, useEffect, useState } from 'react';
import './CreateSpendRecord.css';
import httpProvider from '../../providers/httpProvider';
import { BASE_URL } from '../../common/constants';
import moment from 'moment';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/esm/Form';
import Loader from '../Base/Loader/Loader';
import currencyList from '../../providers/currencyList.json';
import AuthContext from '../context/AuthContext';

const CreateSpendRecord = ({
  setToggleAddSpend,
  selectedDate,
  selectedCat,
  setThisMonthSpendRecords,
  categories,
  subcategories,
}) => {
  const [Categories, setCategories] = useState(categories || []);
  const [subCategories, setSubCategories] = useState(subcategories || []);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(selectedCat || 'none');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const [description, setDescription] = useState('init');
  const [amount, setAmount] = useState('init');
  const [currency, setCurrency] = useState(useContext(AuthContext).user.currency);
  const [date, setDate] = useState(selectedDate || new Date());
  const [category, setCategory] = useState(selectedCat || '');
  const [subcategory, setSubcategory] = useState('');
  const [paidWithBalance, setPaidWithBalance] = useState(false);
  const [balance, setBalance] = useState('none');
  const [balances, setBalances] = useState([]);
  const [isReccurring, setIsRecurring] = useState(false);
  const [repeatingPeriod, setRepeatingPeriod] = useState('monthly');

  const submitRecord = async (e) => {
    e.preventDefault();
    setLoading(true);

    const recordObject = {
      description,
      amount: Number(amount),
      currency,
      date,
      category_id: category,
      subcategory_id: subcategory,
      balance_id: balance || balance === 'none' ? null : null,
      recurrence: isReccurring ? repeatingPeriod : null,
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
      .post(`${BASE_URL}/spending`, recordObject)
      .then((data) => {
        if (data.error) {
          console.log(data.error);
          setError(data.error);
        } else {
          setToggleAddSpend(false);
          setThisMonthSpendRecords &&
            setThisMonthSpendRecords((prev) => [
              ...prev,
              { ...recordObject, _id: data.newRecord.insertedId },
            ]);
        }
      })
      .catch((e) => console.error(e));
    setLoading(false);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading2(true);
      await httpProvider
        .get(`${BASE_URL}/spend-categories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setCategories(data);
          }
        })
        .catch((error) => console.log(error) + setError(error.toString()));

      await httpProvider
        .get(`${BASE_URL}/spend-categories/1/all-subcategories`)
        .then((data) => {
          if (data.error) {
            setError(data.error.toString());
          } else {
            setSubCategories(data);
          }
        })
        .catch((error) => setError(error.toString()));

      setLoading2(false);
      // await httpProvider
      //   .get(`${BASE_URL}/balances`)
      //   .then((data) => {
      //     if (data.error) {
      //       setError(data.error.toString());
      //     } else {
      //       setBalances(data);
      //     }
      //   })
      //   .catch((error) => setError(error.toString()));
    }

    fetchData();

    return () => {
      setError('');
      setCategories('');
      setSubCategories('');
      setSelectedCategory('');
    };
  }, []);

  useEffect(() => {
    setSelectedSubcategories(subCategories.filter((sc) => sc.category_id === selectedCat));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategories]);

  useEffect(() => {
    setSelectedSubcategories(subCategories.filter((sc) => sc.category_id === selectedCategory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, selectedCategory]);

  return (
    <div className='create-spend-modal'>
      <h4>Add A Spend</h4>
      {error && <Error error={error} setError={setError} />}
      {loading && <Loader height={'3.5em'} width={'2.5em'} />}
      <br />
      {verificationMessage && <p>{verificationMessage} required</p>}
      <Form className='create-spend-fields-container'>
        <div className='create-spend-input-item'>
          <Form.Group>
            {/* <Form.Label>Description</Form.Label> */}
            <Form.Control
              type='text'
              name='description'
              placeholder='add description of your spend'
              className={verificationMessage.includes('description') ? 'unverified-input' : 'ok'}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description === '.' && setDescription('')}
            />
          </Form.Group>
        </div>
        <div className='create-spend-input-item'>
          <Form.Group>
            {/* <Form.Label>Amount</Form.Label> */}
            <Form.Control
              name='Amount'
              type='numb er'
              className={verificationMessage.includes('amount') ? 'unverified-input' : 'ok'}
              placeholder='add the amount'
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => amount === 1 && setAmount(0)}
            />
          </Form.Group>
        </div>

        <div className='create-spend-input-item'>
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

        <div className='create-spend-input-item'>
          <Form.Group>
            <Form.Control
              name='date'
              type='date'
              value={moment(date).format('yyyy-MM-DD')}
              className={verificationMessage.includes('date') ? 'unverified-input' : 'ok'}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className='create-spend-input-item'>
          <Form.Select
            aria-label='category'
            name='category'
            value={selectedCategory}
            className={verificationMessage.includes('category') ? 'unverified-input' : 'ok'}
            onChange={(e) => setSelectedCategory(e.target.value) + setCategory(e.target.value)}
            disabled={loading2}
          >
            <option key={0.1} value='none' disabled hidden>
              {loading2 ? 'Loading...' : 'Select Category'}
            </option>
            {Categories?.map((c) => {
              return (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              );
            })}
          </Form.Select>
        </div>
        <div className='create-spend-input-item'>
          <Form.Select
            aria-label='subcategory'
            name='subcategory'
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={loading2}
          >
            <option key={0.1} value='' disabled hidden>
              {loading2 ? 'Loading...' : 'Select Subcategory'}
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
          <div className='create-spend-input-checkbox'>
            {' '}
            <Form.Check
              type={'checkbox'}
              label={'Paid With Balance'}
              onChange={() => setPaidWithBalance((prev) => !prev)}
            />
          </div>
        ) : (
          <></>
        )}
        <div className='create-spend-input-item'>
          {paidWithBalance && !isReccurring ? (
            <Form.Select
              aria-label='balances'
              name='balances'
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              style={{ overflow: 'scroll' }}
            >
              <option key={0.1} value='' disabled hidden>
                Select Balance
              </option>
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
          <div className='create-spend-input-checkbox'>
            {' '}
            <Form.Check
              type={'checkbox'}
              label={'Is a Recurring Payment?'}
              onChange={() => setIsRecurring((prev) => !prev)}
            />
          </div>
        ) : (
          <></>
        )}

        <div className='create-spend-input-item'>
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
        <div className='create-spend-input-item'>
          <Button variant='primary' onClick={(e) => submitRecord(e)}>
            Submit
          </Button>{' '}
          <Button variant='secondary' onClick={() => setToggleAddSpend(false)}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateSpendRecord;
