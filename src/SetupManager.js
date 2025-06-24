import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginAnimation from './LoginAnimation';
import './Login.css';

const SetupManager = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempManagerData, setTempManagerData] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOTPChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First step: Send OTP
      const response = await fetch('http://localhost:5005/api/managers/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        setTempManagerData(formData);
        setShowOTPInput(true);
        await Swal.fire({
          title: 'OTP Sent!',
          text: 'Please check your email for the verification code',
          icon: 'info',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to send OTP. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5005/api/managers/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tempManagerData.email,
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store manager data in localStorage
        localStorage.setItem('user', JSON.stringify({
          name: tempManagerData.name,
          username: tempManagerData.username,
          email: tempManagerData.email,
          role: 'manager'
        }));

        await Swal.fire({
          title: 'Manager Account Created!',
          html: `
            <div class="success-alert">
              <div class="success-icon">🎉</div>
              <p>Your manager account has been created successfully!</p>
              <p>You will be redirected to the employee page.</p>
            </div>
          `,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/Emp');
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      Swal.fire({
        title: 'Verification Failed',
        text: error.message || 'Invalid OTP. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <LoginAnimation />
      <div className="login-content">
        <div className="login-form-container">
          <h1 className="login-title">Setup Manager Account</h1>
          <p className="welcome-message">
            Create your manager account to get started with the Call Center Management System
          </p>
          
          {!showOTPInput ? (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="login-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="login-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="login-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="login-input"
                />
              </div>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOTPChange}
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  required
                  className="login-input"
                  style={{ textAlign: 'center', letterSpacing: '8px' }}
                />
              </div>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading || otp.length !== 4}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOTPInput(false);
                  setOtp('');
                }}
                className="login-button"
                style={{ marginTop: '10px', background: 'transparent', border: '1px solid #6a11cb' }}
              >
                Back to Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupManager; 