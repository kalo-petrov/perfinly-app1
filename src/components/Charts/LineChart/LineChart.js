import React from 'react';
import { Line } from 'react-chartjs-2';
import './LineChart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ labelArray, dataArray, label = 'label', title = 'title', height, width }) => {
  const data = {
    labels: labelArray,
    datasets: [
      {
        label: label,
        data: dataArray,
        backgroundColor: ['#FF5F15'],
        borderColor: ['#FF5F15'],
        borderWidth: 3,
        tension: 0.2,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      datalabels: {
        display: 'auto',
        color: 'black',
        align: 'top',
        padding: '5px',
      },
    },
  };
  return (
    <div className='bar-chart-container'>
      <h3>{title}</h3>
      <Line
        data={data}
        plugins={[ChartDataLabels]}
        height={height}
        width={width}
        options={options}
      />
    </div>
  );
};

export default LineChart;
