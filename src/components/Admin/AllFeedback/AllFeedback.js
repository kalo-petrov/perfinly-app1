import React from 'react';
import './AllFeedback.css';
import httpProvider from './../../../providers/httpProvider';
import { BASE_URL } from '../../../common/constants';
import moment from 'moment';
import useSortableData from '../../../hooks/useSortableData';

const AllFeedback = () => {
  const [feedback, setFeedback] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      await httpProvider.get(`${BASE_URL}/feedback/all`).then((data) => {
        if (data.error) {
          return;
        }
        console.log(data);
        setFeedback(data);
      });
    };

    fetchData();
  }, []);

  const { items, requestSort } = useSortableData(feedback);

  return (
    <div>
      <h3>All Feedback</h3>

      <div className='feedback-container'>
        <table className='feedback-table'>
          <thead>
            <tr>
              <th onClick={() => requestSort('username')}>Username</th>
              <th onClick={() => requestSort('title')}>Title</th>
              <th onClick={() => requestSort('rating')}>Rating</th>
              <th onClick={() => requestSort('usage')}>Will Use</th>
              <th onClick={() => requestSort('financialHabits')}>Financial Habits</th>
              <th onClick={() => requestSort('intuitiveUse')}>Inituitive Use</th>
              <th onClick={() => requestSort('careAboutDesign')}>Cares About Design</th>
              <th onClick={() => requestSort('design')}>Design</th>
              <th onClick={() => requestSort('recommend')}>Recommend To Friend</th>
              <th onClick={() => requestSort('feedback')}>Feedback1</th>
              <th onClick={() => requestSort('feedback')}>Feedback2</th>
              <th onClick={() => requestSort('feedback')}>Feedback3</th>
              <th onClick={() => requestSort('feedback')}>Feedback4</th>
              <th onClick={() => requestSort('date_created')}>Date Created </th>
            </tr>
          </thead>
          <tbody>
            {items?.map((f) => {
              return (
                <tr key={f._id}>
                  <td>{f.username}</td>
                  <td>{f.title}</td>
                  <td>{f.rating}</td>
                  <td>{f.usage}</td>
                  <td>{f.financialHabits}</td>
                  <td>{f.intuitiveUse}</td>
                  <td>{f.careAboutDesign}</td>
                  <td>{f.design}</td>
                  <td>{f.recommend}</td>
                  <td>{f.feedback[0]}</td>
                  <td>{f.feedback[1]}</td>
                  <td>{f.feedback[2]}</td>
                  <td>{f.feedback[3]}</td>
                  <td>{moment(f.date_created).format('DD-MMM-YYYY')}</td>
                </tr>
              );
            })}
            <tr>
              <th>Averages</th>
              <th>-</th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.rating;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.usage || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.financialHabits || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.intuitiveUse || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.careAboutDesign || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.design || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
              <th>
                {feedback.reduce((acc, f) => {
                  acc += f.recommend || 0;
                  return acc;
                }, 0) / feedback.length}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllFeedback;
