import React from 'react';
import './Error.css';

const Error = ({ error, setError }) => {
  return (
    <div className='error-container'>
      <h3>Error</h3>
      <h4>{error}</h4>
      <button onClick={() => setError(null) + window.location.reload()}>Close</button>
    </div>
  );
};

export default Error;
