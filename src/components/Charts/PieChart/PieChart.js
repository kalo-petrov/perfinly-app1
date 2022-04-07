import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
Chart.register(ArcElement);

const PieChart = ({
  data,
  labels,
  height,
  width,
  title,
  backgroundColor = [
    '#00aaff',
    '#00e600',
    '#3a4e48',
    '#DFFF00',
    '#19697b',
    '#ffcc00',
    '#40E0D0',
    '#003300',
    '#ff9900',
    '#009999',
    '#ff6666',
    '#000066',
    '#99ff66',
  ],
}) => {
  const data1 = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor,
        // borderColor: [
        //   '#00aaff',
        //   '#3a4e48',
        //   '#DFFF00',
        //   '#19697b',
        //   '#40E0D0',
        //   '#cfdee3',
        //   '#FFBF00',
        //   '#DE3163',
        //   '#f5f5d5',
        // ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <div className='App'>
        <h3>{title} </h3>
        {data1.labels.length < 1 ? (
          <div></div>
        ) : (
          <div style={{ height, width, margin: '0 auto' }}>
            <Pie data={data1} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;
