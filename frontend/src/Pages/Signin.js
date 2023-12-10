import React, { useContext, useState } from 'react';
import './Signin.css';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext.js';
import Switch from '@material-ui/core/Switch';
import { Link } from 'react-router-dom';
import { admissionIdRegex, employeeIdRegex, passwordRegex } from '../Regex/regexPatterns';

function Signin() {
  const [isStudent, setIsStudent] = useState(true);
  const [admissionId, setAdmissionId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useContext(AuthContext);

  const API_URL = process.env.REACT_APP_API_URL;

  const loginCall = async (userCredential, dispatch) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await axios.post(API_URL + 'api/auth/signin', userCredential);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err });
      setError('Wrong Password Or Username');
    }
  };

  const validateInput = () => {
    if (isStudent) {
      if (!admissionIdRegex.test(admissionId)) {
        setError('Invalid Student ID. Please enter at least 8 digits.');
        return false;
      }
    } else {
      if (!employeeIdRegex.test(employeeId)) {
        setError('Invalid Employee ID. Please enter at least 8 characters.');
        return false;
      }
    }

    if (!passwordRegex.test(password)) {
      setError('Invalid Password. Please enter at least 6 characters.');
      return false;
    }

    setError('');
    return true;
  };

  const handleForm = (e) => {
    e.preventDefault();
    if (validateInput()) {
      isStudent
        ? loginCall({ admissionId, password }, dispatch)
        : loginCall({ employeeId, password }, dispatch);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <form onSubmit={handleForm}>
          <h2 className="signin-title">Login</h2>
          <p className="line"></p>
          <div className="persontype-question">
            <span>Are you a Staff member ?</span>
            <Switch onChange={() => setIsStudent(!isStudent)} color="primary" />
          </div>
          <div className="error-message">
            <p>{error}</p>
          </div>
          <div className="signin-fields">
            <label htmlFor={isStudent ? 'admissionId' : 'employeeId'}>
              <b>{isStudent ? 'Student ID' : 'Employee ID'}</b>
            </label>
            <input
              className="signin-textbox"
              type="text"
              placeholder={isStudent ? 'Enter Student ID' : 'Enter Employee ID'}
              name={isStudent ? 'StudentId' : 'employeeId'}
              required
              onChange={(e) => (isStudent ? setAdmissionId(e.target.value) : setEmployeeId(e.target.value))}
            />
            <label htmlFor="password">
              <b>Password</b>
            </label>
            <input
              className="signin-textbox"
              type="password"
              minLength="6"
              placeholder="Enter Password"
              name="psw"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="signin-button">Log In</button>
          <Link className="forget-pass" href="#home" to={`/forgot-password`}>
            Forgot password?
          </Link>
        </form>
        <div className="signup-option">
          <p className="signup-question">Don't have an account? Contact Librarian</p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
