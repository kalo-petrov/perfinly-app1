import React, { useContext, useEffect, useState } from 'react';
import './CreateBalance.css';
import httpProvider from '../../providers/httpProvider';
import { BASE_URL } from '../../common/constants';
import Error from '../Base/Error/Error';
import AuthContext from '../../context/AuthContext';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/esm/Form';
import currencyList from '../../providers/currencyList.json';
import Loader from './../Base/Loader/Loader';
import currencyProvider from './../../providers/CurrencyProvider';

const CreateBalance = ({
  setToggleAddBalance,
  setBalances,
  balances,
  types,
  setBalancesByType,
  liabilities,
  setLiabilities,
  setLiabilitiesByType,
}) => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [description, setDescription] = useState('init');
  const [amount, setAmount] = useState('init');
  const [currency, setCurrency] = useState(user.currency);
  const [type, setType] = useState('none');
  const [isLiability, setIsLiability] = useState(false);

  const submitBalance = (e) => {
    e.preventDefault();
    setLoading(true);
    const balanceObject = {
      description,
      amount: Number(amount),
      currency,
      type_id: type,
      is_liability: isLiability,
    };

    for (const [key, value] of Object.entries(balanceObject)) {
      if (key === 'description' && (!value || value === 'init')) {
        setVerificationMessage(`${key} `);
        setLoading(false);
        return;
      } else if (key === 'amount' && (!value || value === 'init' || value <= 0)) {
        setVerificationMessage(`${key} and should be number larger than 0`);
        setLoading(false);
        return;
      } else if (key === 'type_id' && (!value || value === 'none')) {
        setVerificationMessage(`Please select a type. `);
        setLoading(false);
        return;
      } else {
        setVerificationMessage('');
      }
    }

    const submitData = async () => {
      await httpProvider.post(`${BASE_URL}/balances`, balanceObject).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setBalances((prev) => [...prev, balanceObject].filter((d) => !d.is_liability).sort((a, b) => b.amount - a.amount));
          setLiabilities((prev) => [...prev, balanceObject].filter((d) => d.is_liability).sort((a, b) => b.amount - a.amount));

          let mappedBalances = new Map();
          let mappedLiabilities = new Map();
          for (const element of [...balances, balanceObject].filter((d) => !d.is_liability)) {
            const amount = mappedBalances.get(element.type_id) || 0;
            mappedBalances.set(
              element.type_id,
              amount +
                currencyProvider.convertToMainCurrency({
                  amount: element.amount,
                  currency: element.currency,
                }).amount
            );
          }
          for (const element of [...liabilities, balanceObject].filter((d) => d.is_liability)) {
            const amount = mappedLiabilities.get(element.type_id) || 0;
            mappedLiabilities.set(
              element.type_id,
              amount +
                currencyProvider.convertToMainCurrency({
                  amount: element.amount,
                  currency: element.currency,
                }).amount
            );
          }

          setBalancesByType([]);
          for (const [key, value] of mappedBalances) {
            setBalancesByType((prev) =>
              [
                ...prev,
                {
                  type_id: key,
                  amount: value,
                  name: types.find((type) => type._id === key)?.name,
                },
              ].sort((a, b) => b.amount - a.amount)
            );
          }
          setLiabilitiesByType([]);
          for (const [key, value] of mappedLiabilities) {
            setLiabilitiesByType((prev) =>
              [
                ...prev,
                {
                  type_id: key,
                  amount: value,
                  name: types.find((type) => type._id === key)?.name,
                },
              ].sort((a, b) => b.amount - a.amount)
            );
          }
          setToggleAddBalance(false);
        }
      });
      setLoading(false);
    };
    submitData();
  };



  return (
    <div className='create-balance-modal'>
      <h4>Add A balance</h4>
      {error && <Error error={error} setError={setError} />}
      {loading && <Loader height={'3.5em'} width={'2.5em'} />}
      <br />
      {verificationMessage && <p>{verificationMessage} required</p>}
      <Form className='create-balance-fields-container'>
        <div className='create-balance-input-item'>
          <Form.Group>
            {/* <Form.Label>Description</Form.Label> */}
            <Form.Control
              type='text'
              name='description'
              placeholder='add description of your balance'
              className={verificationMessage.includes('description') ? 'unverified-input' : 'ok'}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description === '.' && setDescription('')}
            />
          </Form.Group>
        </div>
        {/* <div>{!description && <small>Description is required</small>}</div> */}
        <div className='create-balance-input-item'>
          <Form.Group>
            {/* <Form.Label>Amount</Form.Label> */}
            <Form.Control
              name='Amount'
              type='number'
              className={verificationMessage.includes('amount') ? 'unverified-input' : 'ok'}
              placeholder='add the amount'
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => amount === 1 && setAmount(0)}
            />
          </Form.Group>
        </div>
        {/* <div>{!amount && <small>Amount is required</small>}</div> */}
        <div className='create-balance-input-item'>
          <div className='create-balance-checkbox'>
            <Form.Check
              type='checkbox'
              label={`Is a liability ${
                isLiability ? `(Will be reflected as a negative balance!)` : ''
              }`}
              value={isLiability}
              onChange={() => setIsLiability((prev) => !prev)}
            />
          </div>
        </div>
        <div className='create-balance-input-item'>
          <Form.Select
            aria-label='type'
            name='type'
            className={verificationMessage.includes('type') ? 'unverified-input' : 'ok'}
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={loading2}
          >
            <option key={0.1} value='none' disabled hidden>
              {loading2 ? 'Loading...' : 'Select Type'}
            </option>
            {types?.map((t) => {
              return (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              );
            })}
          </Form.Select>
        </div>

        <div className='create-balance-input-item'>
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

        <br />
        <br />
        <div className='create-balance-input-item'>
          <Button variant='primary' onClick={(e) => submitBalance(e)}>
            Submit
          </Button>{' '}
          <Button variant='secondary' onClick={() => setToggleAddBalance(false)}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateBalance;
