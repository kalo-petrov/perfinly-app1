import React, { useState, useContext } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import AuthContext, { extractUser } from '../context/AuthContext';
import CurrencyContext from '../context/CurrencyContext';
import Form from 'react-bootstrap/Form';
import './LogInPage.css';
import { BASE_URL } from '../../common/constants';
import * as SVGLoaders from 'svg-loaders-react';
import GoogleLogin from 'react-google-login';
import Error from './../Base/Error/Error';
import Loader from './../Base/Loader/Loader';

const required = (value) => value.trim().length >= 1;
const minLen = (len) => (value) => value.trim().length >= len;
const maxLen = (len) => (value) => value.trim().length <= len;
const LogInPage = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usernameControl, setUsernameControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(20)],
  });
  const [passwordControl, setPasswordControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(30)],
  });
  const { setLoginState } = useContext(AuthContext);

  const validate = (value, validators) => validators.every((validator) => validator(value));

  const onInputChange = (ev) => {
    const { value, name } = ev.target;

    if (name === 'username') {
      const copyControl = { ...usernameControl };
      copyControl.value = value;
      copyControl.valid = validate(value, usernameControl.validators);
      setUsernameControl(copyControl);
    } else if (name === 'password') {
      const copyControl = { ...passwordControl };
      copyControl.value = value;
      copyControl.valid = validate(value, passwordControl.validators);
      setPasswordControl(copyControl);
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();

    fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({
        username: usernameControl.value,
        password: passwordControl.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.token) {
          throw new Error(data.error);
        }

        // eslint-disable-next-line react/prop-types
        localStorage.setItem('token', data.token);
        localStorage.setItem('currency_rates', JSON.stringify(data?.conversion_rates));
        setLoginState({
          isLoggedIn: !!extractUser(data.token),
          user: extractUser(data.token),
        });
        props.history.push('/dashboard');
      })
      .catch((error) => console.error(`${error}`, 'Please try again!', 'error'));
  };

  const loginWithGoogle = async (googleData) => {
    if (googleData?.error) {
      return;
    }
    setLoading(true);
    await fetch(`${BASE_URL}/auth/signin-google`, {
      method: 'POST',
      body: JSON.stringify({
        token: googleData.tokenId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((data) => data.json())
      .then((data) => {
        if (!data.token) {
          setLoading(false);
          throw new Error(data.error);
        }
        // eslint-disable-next-line react/prop-types
        localStorage.setItem('token', data.token);
        localStorage.setItem('currency_rates', JSON.stringify(data?.conversion_rates));
        setLoginState({
          isLoggedIn: !!extractUser(data.token),
          user: extractUser(data.token),
          currency_rates: data?.conversion_rates,
        });
        setLoading(false);
        props.history.push('/dashboard');
      })
      .catch((error) => setLoading(false) + setError(`${error} Please try again`));
  };

  if (loading) {
    return (
      <div>
        {error && <Error error={error} setError={setError} />}
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className='container1'>
      {error && <Error error={error} setError={setError} />}
      <Form>
        <h1>Login</h1>
        <br></br>
        <Form.Group controlId='formBasicUsername'>
          <h3>Username</h3>
          <div className='input'>
            <div>
              <Form.Control
                className='mr-sm-5'
                value={usernameControl.value}
                onChange={onInputChange}
                name='username'
                type='text'
                placeholder='Enter Username'
                style={
                  !usernameControl.valid
                    ? { border: '1px solid #8B0000' }
                    : { border: '2px solid #000080' }
                }
              />
            </div>
          </div>
          <Form.Text className='text-muted'></Form.Text>
        </Form.Group>

        <Form.Group controlId='formBasicPassword'>
          <h3>Password</h3>
          <div className='input'>
            <div>
              <Form.Control
                className='mr-sm-5'
                value={passwordControl.value}
                onChange={onInputChange}
                name='password'
                type='password'
                placeholder='Password'
                style={
                  !passwordControl.valid
                    ? { border: '1px solid #8B0000' }
                    : { border: '2px solid #000080' }
                }
              />
            </div>
          </div>
        </Form.Group>
        <br />
        <button
          className='btn btn-primary'
          disabled={!usernameControl.valid || !passwordControl.valid}
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          Login
        </button>
        <br />
        <br />

        <GoogleLogin
          clientId={'795141151204-qeebg8jipm8oc764kvd1qrmbvndflto9.apps.googleusercontent.com'}
          buttonText='Log in with Google'
          onSuccess={loginWithGoogle}
          onFailure={loginWithGoogle}
          cookiePolicy={'single_host_origin'}
          disabled={false}
        />

        <br />
        <br />
        <p>Don't have an Account?</p>
        <NavLink to='/signup'>
          <button className='btn btn-dark'>Sign-up Here</button>
        </NavLink>
      </Form>
    </div>
  );
};

export default withRouter(LogInPage);
