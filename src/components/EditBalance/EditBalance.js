import React, { useState, useEffect } from 'react';
import './EditBalance.css';
import httpProvider from '../../providers/httpProvider';
import { BASE_URL } from '../../common/constants';
import Error from '../Base/Error/Error';
import Button from 'react-bootstrap/esm/Button';
import CloseButtoon from 'react-bootstrap/esm/CloseButton';
import Form from 'react-bootstrap/esm/Form';
import currencyList from '../../providers/currencyList.json';
import Loader from './../Base/Loader/Loader';

const EditBalance = ({
  selectedBalance,
  setBalances,
  setToggleEditBalance,
  types,
}) => {

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');

  const [description, setDescription] = useState(selectedBalance.description);
  const [amount, setAmount] = useState(selectedBalance.amount);
  const [currency, setCurrency] = useState(selectedBalance.currency);
  const [type, setType] = useState(selectedBalance.type_id);


  const submitEditedBalance = async (e) => {
    e.preventDefault();
    setLoading(true)
    const balanceObject = {
      description,
      amount: Number(amount),
      currency,
      type_id: type,
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

    await httpProvider.put(`${BASE_URL}/balances/${selectedBalance._id}`, balanceObject).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setToggleEditBalance(false);
        setBalances((prev) =>
          prev.map((sr) => {
            if (sr._id === selectedBalance._id) {
              return { ...sr, ...balanceObject };
            } else {
              return sr;
            }
          })
        );
      }
    });
    setLoading(false)
  };

  const deleteBalance = async (e) => {
    e.preventDefault();
    
    if (
      window.confirm(`Are you sure you want to delete this balance ${selectedBalance.description}?`)
    ) {
      setLoading(true);
      await httpProvider
        .deleteReq(`${BASE_URL}/balances/${selectedBalance._id}`)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setToggleEditBalance(false);
            setBalances((prev) => prev.filter((r) => r._id !== selectedBalance._id));
            
          }
        })
        .catch((error) => setError(error.toString()));
        setLoading(false)
    } else {
      return;
    }
  };

  return (
    <div className='edit-balance-modal'>
      {error && <Error error={error} setError={setError} />}
      {loading && <Loader height={'3.5em'} width={'2.5em'} />}

      <CloseButtoon className='close-btn' onClick={() => setToggleEditBalance(false)} />
      <h4>Edit balance Record</h4>
      <br />
      {verificationMessage && <p>{verificationMessage} required</p>}
      <div className='edit-balance-fields-container'>
        <div className='editable-balance-item'>
          <Form.Group>
            {/* <Form.Label>Description</Form.Label> */}
            <Form.Control
              name='description'
              value={description}
              type='text'
              className={verificationMessage.includes('description') ? 'unverified-input' : 'ok'}
              placeholder='add description of your balance'
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description === '.' && setDescription('')}
            />
          </Form.Group>
        </div>
        <div>{!description && <small>Description is required</small>}</div>
        <div className='editable-balance-item'>
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
        <div>{!amount && <small>Description is required</small>}</div>

        <div className='editable-balance-item'>
          <Form.Select
            aria-label='type'
            name='type'
            className={verificationMessage.includes('type') ? 'unverified-input' : 'ok'}
            onChange={(e) => setType(e.target.value)}
            value={type}
          >
            {types?.map((t) => {
              return (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              );
            })}
          </Form.Select>
        </div>

        <div className='editable-balance-item'>
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

        <div className='editable-balance-item'>
          <Button variant='primary' onClick={(e) => submitEditedBalance(e)}>
            Submit
          </Button>{' '}
          <Button variant='secondary' onClick={() => setToggleEditBalance(false)}>
            Cancel
          </Button>{' '}
          <Button variant='outline-danger' onClick={(e) => deleteBalance(e)}>
            Delete Record
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBalance;
