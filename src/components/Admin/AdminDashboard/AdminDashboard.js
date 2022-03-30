import React from 'react';
import './AdminDashboard.css';
import httpProvider from './../../../providers/httpProvider';
import { BASE_URL } from '../../../common/constants';
import moment, { now } from 'moment';

const AdminDashboard = () => {
  const [activeUsers1Hour, setActiveUsers1Hour] = React.useState([]);
  const [activeUsers1Day, setActiveUsers1Day] = React.useState([]);
  const [feedback, setFeedback] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      await httpProvider.get(`${BASE_URL}/auth/users`).then((data) => {
        if (data.error) {
          return;
        }
        console.log(data);
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
      });

      await httpProvider.get(`${BASE_URL}/feedback/all`).then((data) => {
        if (data.error) {
          return;
        }
        console.log(data);
        setFeedback(data.slice(0, 5));
      });
    };

    fetchData();
  }, []);

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

      </div>
      <div>
          <div>
            <h5>Latest Feedback</h5>
          </div>
          <div>
            {' '}
            {feedback?.map((f) => {
              return (
                <div className='dashboard-feedback-item' key={f._id}>
                  {f.title}
                  <div>{f.feedback}</div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
