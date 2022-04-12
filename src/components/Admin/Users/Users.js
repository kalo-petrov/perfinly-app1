import React from 'react';
import './Users.css';
import httpProvider from './../../../providers/httpProvider';
import { BASE_URL } from '../../../common/constants';
import moment from 'moment';
import useSortableData from '../../../hooks/useSortableData';

const Users = () => {
  const [activeUsers, setActiveUsers] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      await httpProvider.get(`${BASE_URL}/auth/users`).then((data) => {
        if (data.error) {
          return;
        }
        setActiveUsers(data.users);

      });
    };
    fetchData();
  }, []);

  const { items, requestSort } = useSortableData(activeUsers);



  return (
    <div>
      <h3>Users</h3>
    <h4>Total: {activeUsers.length}</h4>
      <div>
        <table>
          <thead>
            <tr>
              <th className='user-table-head' onClick={() => requestSort('username')}>Username</th>
              <th className='user-table-head' onClick={() => requestSort('email')}>Email</th>
              <th className='user-table-head' onClick={() => requestSort('first_name')}>First Name</th>
              <th className='user-table-head' onClick={() => requestSort('last_name')}>Last Name</th>
              <th className='user-table-head' onClick={() => requestSort('role')}>Role</th>
              <th className='user-table-head' onClick={() => requestSort('last_login')}>Last Login</th>
              <th className='user-table-head' onClick={() => requestSort('logins')}># of Logins</th>
              <th className='user-table-head' onClick={() => requestSort('registration_date')}>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map(au => {
              return (
                <tr key={au._id}>
                  <td>{au.username}</td>
                  <td>{au.email}</td>
                  <td>{au.first_name}</td>
                  <td>{au.last_name}</td>
                  <td>{au.role}</td>
                  <td>{au.last_login && moment(au.last_login).format('h:mm:ss (DD-MMM-YYYY)')}</td>
                  <td>{Number(au?.logins?.length || '')}</td>
                  <td>{au?.registration_date && moment(au?.registration_date).format('h:mm:ss (DD-MMM-YYYY)')}</td>
                  <td></td>
                </tr>
              ) 
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
