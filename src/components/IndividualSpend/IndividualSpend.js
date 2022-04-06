import React from 'react';
import './IndividualSpend.css';
import getSymbolFromCurrency from 'currency-symbol-map'

const IndividualSpend = ({ spendRecord, keys, setToggleEdit, setSelectedSpend }) => {
  return (
    <div key={keys} onClick={() => setSelectedSpend(spendRecord)}>
      <div
        className='individual-spend-record'
        key={spendRecord?._id}
        onClick={() => setToggleEdit((prev) => !prev)}
      >
        {' '}
        {`${spendRecord?.description}: ${getSymbolFromCurrency(spendRecord.currency)}${spendRecord.amount}`}
      </div>
    </div>
  );
};

export default IndividualSpend;
