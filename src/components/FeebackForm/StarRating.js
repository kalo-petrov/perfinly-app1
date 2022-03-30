import React, { useState } from 'react';
import './StarRating.css';
import FeatherIcon from 'feather-icons-react';

const StarRating = ({rating, setRating}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className='star-rating'>
      {[...Array(10)].map((star, index) => {
        index += 1;
        return (
          <FeatherIcon
            icon='star'
            color='orange'
            fill={index <= (hover || rating) ? 'orange' : 'none'}
            key={index}
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
            style={{cursor: 'pointer'}}
          />

        );
      })}
    </div>
  );
};

export default StarRating;
