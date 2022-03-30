import React from 'react';
import './UserProfile.css';
import httpProvider from './../../providers/httpProvider';
import { BASE_URL } from './../../common/constants';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import AuthContext, { extractUser } from '../context/AuthContext';
import Loader from './../Base/Loader/Loader';
import currencyList from './../../providers/currencyList.json'

const required = (value) => value.trim().length >= 1;
const minLen = (len) => (value) => value.trim().length >= len;
const maxLen = (len) => (value) => value.trim().length <= len;
const samePassword = () => (pass, ref) => pass === ref;
// const regex = (pattern) => (value) => pattern.test(value);

const UserProfile = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [changePassword, setchangePassword] = React.useState(false);
  const [currency, setCurrency] = React.useState('USD');
  const [usernameControl, setUsernameControl] = React.useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(20)],
  });
  const [firstNameControl, setfirstNameControl] = React.useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(25)],
  });
  const [lastNameControl, setlastNameControl] = React.useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(25)],
  });
  const [emailControl, setEmailControl] = React.useState({
    value: '',
    valid: false,
    validators: [required, minLen(3), maxLen(35)],
  });
  const [passwordControl, setPasswordControl] = React.useState({
    value: '',
    valid: false,
    validators: [required, minLen(5), maxLen(30)],
  });
  const [passwordControlCheck, setPasswordControlCheck] = React.useState({
    value: '',
    valid: false,
    validators: [samePassword()],
  });


  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await httpProvider.get(`${BASE_URL}/auth/info`).then((data) => {
        if (data.error) {
          return;
        }
        setUsernameControl((prev) => {
          return { ...prev, value: data.user.username, valid: true };
        });
        setfirstNameControl((prev) => {
          return { ...prev, value: data.user.first_name, valid: true };
        });
        setlastNameControl((prev) => {
          return { ...prev, value: data.user.last_name, valid: true };
        });
        setEmailControl((prev) => {
          return { ...prev, value: data.user.email, valid: true };
        });
        setCurrency(data?.user?.currency);
        // setPasswordControl(prev => { return {...prev, value: data.user.username}} )
        // setPasswordControlCheck(prev => { return {...prev, value: data.user.username}} )
        setLoading(false);
      });
    };

    fetchData();
  }, []);

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
    } else if (name === 'password') {
      const copyControl = { ...passwordControl };
      copyControl.value = value;
      copyControl.valid = validate(value, usernameControl.validators);
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

  const { setLoginState, currency_rates } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    const userObj = {
      username: usernameControl.value,
      // password: passwordControl.value || null,
      first_name: firstNameControl.value,
      last_name: lastNameControl.value,
      role: 'basic',
      currency,
    };

   await httpProvider.put(`${BASE_URL}/auth/info`, userObj).then((data) => {
      if (data.error) {
        setLoading(false);
        console.error(`${data.error}`, 'Try Again', 'error');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currency_rates', JSON.stringify( data?.conversion_rates));
        if (data.conversion_rates) {
          setLoginState({
            isLoggedIn: !!extractUser(data.token),
            user: extractUser(data.token),
            currency_rates: data.conversion_rates,
          });
        } else {
          setLoginState({
            isLoggedIn: !!extractUser(data.token),
            user: extractUser(data.token),
            currency_rates,
          });
        }
      }
    })
    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h3>UserProfile</h3>

      <Form>
        <Form.Group controlId='formBasicUsername'>
          <div className='input'>
            <div>
              <Form.Label>Username</Form.Label>
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
              <Form.Label>First Name</Form.Label>
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
              <Form.Label>Last Name</Form.Label>
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
              <Form.Label>Email</Form.Label>
              <Form.Control
                className='mr-sm-5'
                defaultValue={emailControl.value}
                disabled={true}
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
        <Form.Group controlId='formBasicUsername'>
          {/* <h4>Last Name</h4> */}
          <div className='input'>
            <div>
              <Form.Label>Main Currency</Form.Label>
              <Form.Select
                className='mr-sm-5'
                value={currency}
                name='currency'
                placeholder=''
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencyList.currencyList.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Form.Group>

        {/* <Form.Group className='mb-3' controlId='formBasicCheckbox'>
          <Form.Check type='checkbox' label='Change Your Password?' value={changePassword} onChange={() => setchangePassword(prev => !prev)} />
        </Form.Group> */}

        {changePassword && (
          <div>
            <Form.Group controlId='formBasicPassword'>
              <div className='input'>
                <div>
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control
                    className='mr-sm-5'
                    value={passwordControl.value}
                    onChange={onInputChange}
                    name='password'
                    type='password'
                    placeholder='Enter Old Password'
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
              <div className='input'>
                <div>
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    className='mr-sm-5'
                    value={passwordControl.value}
                    onChange={onInputChange}
                    name='password'
                    type='password'
                    placeholder='Enter New Password'
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
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    className='mr-sm-5'
                    value={passwordControlCheck.value}
                    onChange={onInputChange}
                    type='password'
                    name='confirmPassword'
                    placeholder='Confirm New Password'
                    style={
                      !passwordControlCheck.valid
                        ? { border: '1px solid #8B0000' }
                        : { border: '2px solid #000080' }
                    }
                  />
                </div>
              </div>
            </Form.Group>
          </div>
        )}

        <br />
        <Button variant='primary' type='submit' onClick={(e) => handleSubmit(e)}>
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default UserProfile;
