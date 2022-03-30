import React from 'react';
import * as SVGLoaders from 'svg-loaders-react';

const Loader = ({ width = '7.5em', height = '9.5em', color = '#0096FF' }) => {
  return (
    <div>
      <SVGLoaders.Oval
        className='absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
        width={width}
        height={height}
        stroke={color}
        strokeWidth='20px'
      />
    </div>
  );
};

export default Loader;
