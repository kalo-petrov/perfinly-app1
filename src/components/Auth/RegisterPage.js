import React, { useState, useContext } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import AuthContext, { extractUser } from '../../context/AuthContext';
import Form from 'react-bootstrap/Form';
import './LogInPage.css';
import { BASE_URL } from '../../common/constants';
import httpProvider from '../../providers/httpProvider';
import GoogleLogin from 'react-google-login';
import Error from './../Base/Error/Error';
import * as SVGLoaders from 'svg-loaders-react';

const required = (value) => value.trim().length >= 1;
const minLen = (len) => (value) => value.trim().length >= len;
const maxLen = (len) => (value) => value.trim().length <= len;
const samePassword = () => (pass, ref) => pass === ref;
// const regex = (pattern) => (value) => pattern.test(value);

const RegisterPage = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usernameControl, setUsernameControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(20)],
  });
  const [firstNameControl, setfirstNameControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(25)],
  });
  const [lastNameControl, setlastNameControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(25)],
  });
  const [emailControl, setEmailControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(35)],
  });
  const [passwordControl, setPasswordControl] = useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(30)],
  });
  const [passwordControlCheck, setPasswordControlCheck] = useState({
    value: '',
    valid: false,
    validators: [samePassword()],
  });

  const validate = (value, validators) => validators.every((validator) => validator(value));

  const validatePass = (value, value2, validators) =>
    validators.every((validator) => validator(value, value2));

  const onInputChange = (ev) => {
    const { value, name } = ev.target;

    if (name === 'username') {
      const copyControl = { ...usernameControl };
      copyControl.value = value;
      copyControl.valid = validate(value, usernameControl.validators);
      setUsernameControl(copyControl);
    } else if (name === 'firstName') {
      const copyControl = { ...firstNameControl };
      copyControl.value = value;
      copyControl.valid = validate(value, firstNameControl.validators);
      setfirstNameControl(copyControl);
    } else if (name === 'lastName') {
      const copyControl = { ...lastNameControl };
      copyControl.value = value;
      copyControl.valid = validate(value, lastNameControl.validators);
      setlastNameControl(copyControl);
    } else if (name === 'email') {
      const copyControl = { ...lastNameControl };
      copyControl.value = value;
      copyControl.valid = validate(value, lastNameControl.validators);
      setEmailControl(copyControl);
    } else if (name === 'password') {
      const copyControl = { ...emailControl };
      copyControl.value = value;
      copyControl.valid = validate(value, emailControl.validators);
      setPasswordControl(copyControl);
    } else if (name === 'confirmPassword') {
      const copyControl = { ...passwordControlCheck };
      copyControl.value = value;
      copyControl.valid = validatePass(
        value,
        passwordControl.value,
        passwordControlCheck.validators
      );
      setPasswordControlCheck(copyControl);
    }
  };
  const path = `${BASE_URL}/auth/signup`;

  const handleRegister = (ev) => {
    ev.preventDefault();

    const userObj = {
      username: usernameControl.value,
      password: passwordControl.value,
      first_name: firstNameControl.value,
      last_name: lastNameControl.value,
      email: emailControl.value,
      role: 'basic',
    };

    httpProvider.post(path, userObj).then((data) => {
      console.log(data);
      if (data.error) {
        console.error(`${data.error}`, 'Try Again', 'error');
      } else {
        console.log('Successful Registration!', '', 'success');
        props.history.push('/signin');
      }
    });
  };

  const { setLoginState } = useContext(AuthContext);

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
        setLoginState({
          isLoggedIn: !!extractUser(data.token),
          user: extractUser(data.token),
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
          <SVGLoaders.Oval
            className='absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
            width='7.5em'
            height='9.5em'
            stroke='#0096FF'
            strokeWidth='20px'
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className='hero-container'>
        {error && <Error error={error} setError={setError} />}
        <div className='container2'>
          <div>
            <Form>
              <h1>Sign Up</h1>
              <br></br>
              <Form.Group controlId='formBasicUsername'>
                <h4>User Info</h4>
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
              </Form.Group>

              <Form.Group controlId='formBasicUsername'>
                <div className='input'>
                  <div>
                    <Form.Control
                      className='mr-sm-5'
                      value={firstNameControl.value}
                      onChange={onInputChange}
                      name='firstName'
                      type='text'
                      placeholder='Enter First Name'
                      style={
                        !firstNameControl.valid
                          ? { border: '1px solid #8B0000' }
                          : { border: '2px solid #000080' }
                      }
                    />
                  </div>
                </div>
              </Form.Group>

              <Form.Group controlId='formBasicUsername'>
                {/* <h4>Last Name</h4> */}
                <div className='input'>
                  <div>
                    <Form.Control
                      className='mr-sm-5'
                      value={lastNameControl.value}
                      onChange={onInputChange}
                      name='lastName'
                      type='text'
                      placeholder='Enter Last Name'
                      style={
                        !lastNameControl.valid
                          ? { border: '1px solid #8B0000' }
                          : { border: '2px solid #000080' }
                      }
                    />
                  </div>
                </div>
              </Form.Group>

              <Form.Group controlId='formBasicUsername'>
                {/* <h4>Last Name</h4> */}
                <div className='input'>
                  <div>
                    <Form.Control
                      className='mr-sm-5'
                      value={emailControl.value}
                      onChange={onInputChange}
                      name='email'
                      type='text'
                      placeholder='Enter Email'
                      style={
                        !emailControl.valid
                          ? { border: '1px solid #8B0000' }
                          : { border: '2px solid #000080' }
                      }
                    />
                  </div>
                </div>
              </Form.Group>

              <Form.Group controlId='formBasicPassword'>
                <h4>Password</h4>
                <div className='input'>
                  <div>
                    <Form.Control
                      className='mr-sm-5'
                      value={passwordControl.value}
                      onChange={onInputChange}
                      name='password'
                      type='password'
                      placeholder='Enter Password'
                      style={
                        !passwordControl.valid
                          ? { border: '1px solid #8B0000' }
                          : { border: '2px solid #000080' }
                      }
                    />
                  </div>
                </div>
              </Form.Group>

              <Form.Group controlId='formBasicPassword'>
                {/* <h4>Confirm Password</h4> */}
                <div className='input'>
                  <div>
                    <Form.Control
                      className='mr-sm-5'
                      value={passwordControlCheck.value}
                      onChange={onInputChange}
                      type='password'
                      name='confirmPassword'
                      placeholder='Confirm Password'
                      style={
                        !passwordControlCheck.valid
                          ? { border: '1px solid #8B0000' }
                          : { border: '2px solid #000080' }
                      }
                    />
                  </div>
                </div>
              </Form.Group>
              {/* 
          {!passwordControlCheck.valid && <div>Passwords don't match</div>} */}

              <button
                className='btn btn-primary'
                style={{marginBottom: '10px'}}
                disabled={
                  !usernameControl.valid || !passwordControl.valid || !passwordControlCheck.valid
                }
                onClick={(e) => {
                  handleRegister(e);
                }}
              >
                Sign Up
              </button>
              <br></br>
              <GoogleLogin
                clientId={
                  '795141151204-qeebg8jipm8oc764kvd1qrmbvndflto9.apps.googleusercontent.com'
                }
                buttonText='Sign in with Google'
                onSuccess={loginWithGoogle}
                onFailure={loginWithGoogle}
                cookiePolicy={'single_host_origin'}
                disabled={false}
                
              />
              <br></br>

              <p>Already Have an Account?</p>
              <NavLink to='/signin'>
                <button className='btn btn-dark'>Proceed to Login</button>
              </NavLink>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(RegisterPage);
