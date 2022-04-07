import React, { useContext, useState } from 'react';
import './AdminNavbar.css';
import AuthContext from '../../../context/AuthContext';
import httpProvider from './../../../providers/httpProvider';
import { Link, useHistory } from 'react-router-dom';
import { BASE_URL } from './../../../common/constants';
import logo from '../../../assets/FullNameLogo-vec.png';
import useComponentVisible from '../../../hooks/useComponentVisible';

const AdminNavbar = () => {
  const { user, setLoginState } = useContext(AuthContext);

  const history = useHistory();

  const handleLogOut = (e) => {
    e.preventDefault();
    httpProvider.deleteReq(`${BASE_URL}/auth/signout`, {}).then((data) => console.log(data));
    setLoginState(false);
    localStorage.removeItem('token');
    history.push('/login');
  };

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

  return (
    <div className='navbar-container'>
      <div className='top-left-navbar-admin'>
        <div className='top-left-navbar-item'>
          <Link to='/dashboard'>
            <img id='header-full-logo' src={logo} alt='logo'></img>
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          <Link to='/all-feedback' className='text-left-navbar-text'>
            Feedback
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          <Link to='/users' className='text-left-navbar-text'>
            Users
          </Link>
        </div>
      </div>
      <div className='top-right-navbar-admin'>
        <div className='top-right-navbar-item'>
          <img
            className='user-profilepic'
            src={
              user.picture?.toString() ||
              'https://iptc.org/wp-content/uploads/2018/05/avatar-anonymous-300x300.png'
            }
            referrerPolicy='no-referrer'
            alt={user.username}
            onClick={() => setIsComponentVisible((prev) => !prev)}
          />
          {isComponentVisible && (
            <div className='user-info-container' ref={ref}>
              <div className='user-info-item'>{user.username}</div>
              <div
                className='user-info-item'
                onClick={(e) => handleLogOut(e)}
                style={{ cursor: 'pointer' }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
