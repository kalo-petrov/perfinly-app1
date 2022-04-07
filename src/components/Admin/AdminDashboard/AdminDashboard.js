import React from 'react';
import './AdminDashboard.css';
import httpProvider from './../../../providers/httpProvider';
import { BASE_URL } from '../../../common/constants';
import moment, { now } from 'moment';
import useSortableData from './../../../hooks/useSortableData';

const AdminDashboard = () => {
  const [activeUsers1Hour, setActiveUsers1Hour] = React.useState([]);
  const [activeUsers1Day, setActiveUsers1Day] = React.useState([]);
  const [activeUsers1Month, setActiveUsers1Month] = React.useState([]);
  const [feedback, setFeedback] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      await httpProvider.get(`${BASE_URL}/auth/users`).then((data) => {
        if (data.error) {
          return;
        }
        setActiveUsers1Hour(
          data.users.filter(
            (u) => u.last_login && moment(u.last_login).add(1, 'hours') >= moment(new Date())
          )
        );
        setActiveUsers1Day(
          data.users.filter(
            (u) => u.last_login && moment(u.last_login).add(1, 'day') >= moment(new Date())
          )
        );
        setActiveUsers1Month(
          data.users.filter(
            (u) => u.last_login && moment(u.last_login).add(1, 'month') >= moment(new Date())
          )
        );
      });

      await httpProvider.get(`${BASE_URL}/feedback/all`).then((data) => {
        if (data.error) {
          return;
        }
        setFeedback(data.slice(0, 5));
      });
    };

    fetchData();
  }, []);

  const { items, requestSort } = useSortableData(feedback);

  return (
    <div>
      <h3>Admin Dashboard</h3>

      <div className='admin-dashboar-container'>
        <div className='admin-dashboard-item'>
          <div>
            <h5>Active Users in Last 1 hours</h5>
          </div>{' '}
          <div>
            <h1> {activeUsers1Hour.length}</h1>
          </div>
        </div>
        <div className='admin-dashboard-item'>
          <div>
            <h5>Active Users in Last 1 Day</h5>
          </div>{' '}
          <div>
            <h1> {activeUsers1Day.length}</h1>
          </div>
        </div>
        <div className='admin-dashboard-item'>
          <div>
            <h5>Active Users in Last 1 Month</h5>
          </div>{' '}
          <div>
            <h1> {activeUsers1Month.length}</h1>
          </div>
        </div>
      </div>
      <div>
        <div>
          <h5>Latest Rating</h5>
        </div>
        <div className='latest-rating-container'>
          <table>
            <tr>
              <th onClick={() => requestSort('username')}>User</th>
              <th onClick={() => requestSort('rating')}>Rating</th>
              <th onClick={() => requestSort('date_created')}>Date</th>
            </tr>
            <tbody>
              {items?.map((f) => {
                return (
                  <tr className='dashboard-feedback-item' key={f._id}>
                    <td>{f.username}</td>
                    <td>{f.rating}</td>
                    <td>{f.date_created.slice(0,10)}</td>
                  </tr>
                );
              })}
              <tr>
                <th>Average</th>
                <th>{feedback.reduce((acc, f) => {
                  acc += f.rating
                  return acc;
                }, 0)/feedback.length}</th>
              </tr>
            </tbody>
          </table>{' '}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
