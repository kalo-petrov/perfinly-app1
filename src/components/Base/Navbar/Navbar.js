import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { BASE_URL } from '../../../common/constants';
import httpProvider from '../../../providers/httpProvider';
import AuthContext from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../../assets/FullNameLogo-vec.png';
import Button from 'react-bootstrap/esm/Button';
import CreateSpendRecord from './../../CreateSpendRecord/CreateSpendRecord';
import FeatherIcon from 'feather-icons-react';
import useComponentVisible from './../../../hooks/useComponentVisible';

const Navbar = () => {
  const { user, setLoginState } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  const {
    ref: ref2,
    isComponentVisible: toggleAddSpend,
    setIsComponentVisible: setToggleAddSpend,
  } = useComponentVisible(false);

  const changeMenu = (e) => {
    setSelectedMenu(e.target.name || e.target.id);
  };

  const history = useHistory();

  const handleLogOut = (e) => {
    e.preventDefault();
    httpProvider.deleteReq(`${BASE_URL}/auth/signout`, {}).then((data) => console.log(data));
    setLoginState(false);
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <div className='navbar-container'>
      <div className='top-left-navbar'>
        <div className='top-left-navbar-item'>
          <Link to='/dashboard' onClick={(e) => changeMenu(e)} name='dashboard'>
            <img name='dashboard' id='header-full-logo' src={logo} alt='logo'></img>
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          <Link
            to='/statistics'
            className={
              selectedMenu === 'statistics'
                ? 'text-left-navbar-text-selected'
                : 'text-left-navbar-text'
            }
            onClick={(e) => changeMenu(e)}
            name='statistics'
          >
            Expense Statistics
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          {' '}
          <Link
            to='/categories'
            className={
              selectedMenu === 'categories'
                ? 'text-left-navbar-text-selected'
                : 'text-left-navbar-text'
            }
            onClick={(e) => changeMenu(e)}
            name='categories'
          >
            Expense Categories
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          {' '}
          <Link
            to='/balances'
            className={
              selectedMenu === 'balances'
                ? 'text-left-navbar-text-selected'
                : 'text-left-navbar-text'
            }
            onClick={(e) => changeMenu(e)}
            name='balances'
          >
            Balances
          </Link>
        </div>
        <div className='top-left-navbar-item'>
          {' '}
          <Link
            to='/balance-types'
            className={
              selectedMenu === 'balance-types'
                ? 'text-left-navbar-text-selected'
                : 'text-left-navbar-text'
            }
            onClick={(e) => changeMenu(e)}
            name='balance-types'
          >
            Balance Types
          </Link>
        </div>
        {/* <div className='top-left-navbar-item'>
          {' '}
          <Link to='/budgets' className='text-left-navbar-text'>
            Budgets
          </Link>
        </div> */}
      </div>
      <div className='top-right-navbar'>
        <div className='top-right-navbar-item'>
          <Button variant='primary' onClick={() => setToggleAddSpend((prev) => !prev)}>
            Add Spend
          </Button>
        </div>

        {toggleAddSpend && (
          <div ref={ref2}>
            <CreateSpendRecord setToggleAddSpend={setToggleAddSpend} />
          </div>
        )}
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
              <div className='user-info-item'>{user.email}</div>
              <div className='user-info-item'>{user.first_name}</div>
              <div className='user-info-item'>{user.last_name}</div>
              <div className='user-info-item-action' style={{ cursor: 'pointer' }}>
                <Link
                  to='/edit-profile'
                  style={{ textDecoration: 'none', color: 'black' }}
                  onClick={() => setIsComponentVisible(false)}
                >
                  Edit Profile
                </Link>
              </div>
              <div
                className='user-info-item-action'
                onClick={(e) => handleLogOut(e)}
                style={{ cursor: 'pointer' }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
        <div className='top-right-navbar-item' title='Give Us Feedback'>
          <Link
            to='/feedback'
            name='feedback'
            className={
              selectedMenu === 'feedback'
                ? 'text-left-navbar-text-selected'
                : 'text-left-navbar-text'
            }
            onClick={(e) => changeMenu(e)}
            style={{ fontSize: '25px', paddingBottom: '7px' }}
          >
            <FeatherIcon icon='message-circle' color='black' size='40px' id='feedback' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
