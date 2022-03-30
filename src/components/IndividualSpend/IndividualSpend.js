import React from 'react';
import './IndividualSpend.css';

const IndividualSpend = ({ spendRecord, keys, setToggleEdit, setSelectedSpend }) => {
  return (
    <div key={keys} onClick={() => setSelectedSpend(spendRecord)}>
      <div
        className='individual-spend-record'
        key={spendRecord?._id}
        onClick={() => setToggleEdit((prev) => !prev)}
      >
        {' '}
        {`${spendRecord?.description}: ${spendRecord.currency} ${spendRecord.amount}`}
      </div>
    </div>
  );
};

export default IndividualSpend;
