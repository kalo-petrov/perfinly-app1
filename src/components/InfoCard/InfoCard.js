import React from 'react'
import './InfoCard.css';

const InfoCard = ({ title, currency, amount}) => {
  return (
    <div className='info-card'>
      <h3>{title}</h3>
      <h2>{amount} {currency}</h2>
    </div>
  )
}

export default InfoCard
