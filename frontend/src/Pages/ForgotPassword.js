import React, { useState, useRef, useEffect } from 'react';
import './Signin.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { emailRegex, otpRegex, passwordRegex } from '../Regex/regexPatterns';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpsend, setOtpsend] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const successMessageTimeoutRef = useRef(null);

  useEffect(() => {
    if (successMessageTimeoutRef.current) {
      clearTimeout(successMessageTimeoutRef.current);
    }

    successMessageTimeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 3000);

    return () => {
      clearTimeout(successMessageTimeoutRef.current);
    };
  }, [message]);

  const API_URL = process.env.REACT_APP_API_URL;

  const sendPasswordResetOTP = async () => {
    try {
      if (!emailRegex.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }

      const response = await axios.post(`${API_URL}api/recovery/forgotpassword`, { email });

      if (response.status === 200) {
        setMessage('OTP sent successfully. Please check your email.');
        setOtpsend(true);
      } else {
        setMessage('OTP failed to send.');
      }
    } catch (error) {
      console.error('OTP request failed:', error);
      setMessage('OTP failed to send.');
    }
  };

  // Function to reset password with OTP
  const resetPasswordWithOTP = async () => {
    try {
      if (!otpRegex.test(otp) || !passwordRegex.test(newPassword)) {
        setMessage('Please enter a valid OTP and a new password with at least 6 characters.');
        return;
      }

      // Make a POST request to reset the password
      const response = await axios.post(`${API_URL}api/recovery/resetpassword`, {
        email,
        otp,
        password: newPassword,
      });

      if (response.status === 200) {
        setMessage('Password reset successful.');
      } else {
        setMessage('Password reset failed.');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setMessage('Password reset failed.');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <form>
          <h2 className="signin-title">Forgot Password</h2>
          <p className="line"></p>
          <div className="persontype-question">
            {!otpsend ? (<span>Enter your email</span>) : (<span>Enter OTP and new password</span>)}
          </div>
          <div className="error-message">
            <p>{message}</p>
          </div>
          <div className="signin-fields">
            {!otpsend && (
              <>
                <label htmlFor="email">
                  <b>Email</b>
                </label>
                <input
                  className="signin-textbox"
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            )}
            {otpsend && (
              <>
                <label htmlFor="otp">
                  <b>OTP</b>
                </label>
                <input
                  className="signin-textbox"
                  type="text"
                  placeholder="Enter OTP"
                  name="otp"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <label htmlFor="newPassword">
                  <b>New Password</b>
                </label>
                <input
                  className="signin-textbox"
                  type="password"
                  placeholder="Enter new password"
                  name="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </>
            )}
          </div>
          {!otp && !newPassword && (
            <button type="button" className="signin-button" onClick={sendPasswordResetOTP}>
              Send OTP
            </button>
          )}
          {otp && newPassword && (
            <button type="button" className="signin-button" onClick={resetPasswordWithOTP}>
              Reset Password
            </button>
          )}
          <Link className="forget-pass" href="#home" to="/signin">
            Back to Login
          </Link>
        </form>
        <div className="signup-option">
          <p className="signup-question">Don't have an account? Contact Librarian</p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
