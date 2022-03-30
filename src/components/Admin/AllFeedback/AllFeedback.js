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

  const { items, requestSort, sortConfig } = useSortableData(feedback);

  return (
    <div>
      <h3>All Feedback</h3>

      <div className='feedback-container'>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('username')}>Username</th>
              <th onClick={() => requestSort('title')}>Title</th>
              <th onClick={() => requestSort('rating')}>Rating</th>
              <th onClick={() => requestSort('feedback')}>Feedback1</th>
              <th onClick={() => requestSort('feedback')}>Feedback2</th>
              <th onClick={() => requestSort('feedback')}>Feedback3</th>
              <th onClick={() => requestSort('feedback')}>Feedback4</th>
              <th onClick={() => requestSort('date_created')}>Date Created </th>
              <th onClick={() => requestSort('date_edited')}>Date Edited </th>
            </tr>
          </thead>
          <tbody>
        {items?.map((f) => {
          return (
            <tr key={f._id}>
              <td>{f.username}</td>
              <td>{f.title}</td>
              <td>{f.rating}</td>
              <td>{f.feedback[0]}</td>
              <td>{f.feedback[1]}</td>
              <td>{f.feedback[2]}</td>
              <td>{f.feedback[3]}</td>
              <td>{moment(f.date_created).format('DD-MMM-YYYY')}</td>
              <td>{f.date_edited && moment(f.date_edited).format('DD-MMM-YYYY')}</td>
            </tr>
          );
        })}
          
        </tbody>
        </table>
        

      </div>
    </div>
  );
};

export default AllFeedback;
