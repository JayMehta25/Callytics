import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginAnimation from './LoginAnimation';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [hasManager, setHasManager] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Show welcome message after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: formData.username,
        role: 'manager'
      }));

      await Swal.fire({
        title: 'Welcome!',
        html: `
          <div class="welcome-alert">
            <div class="welcome-icon">👋</div>
            <p>Hello, ${formData.username}!</p>
            <p>Welcome to your dashboard.</p>
          </div>
        `,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'welcome-popup',
          title: 'welcome-title',
          htmlContainer: 'welcome-html'
        }
      });
      
      navigate('/Emp');
    } catch (error) {
      Swal.fire({
        title: 'Login Failed',
        html: `
          <div class="error-alert">
            <div class="error-icon">🔒</div>
            <p>Please try again.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Try Again',
        customClass: {
          popup: 'error-popup',
          title: 'error-title',
          htmlContainer: 'error-html',
          confirmButton: 'error-button'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate setup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: formData.username,
        role: 'manager'
      }));

      await Swal.fire({
        title: 'Welcome!',
        html: `
          <div class="welcome-alert">
            <div class="welcome-icon">👋</div>
            <p>Hello, ${formData.username}!</p>
            <p>Welcome to your dashboard.</p>
          </div>
        `,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'welcome-popup',
          title: 'welcome-title',
          htmlContainer: 'welcome-html'
        }
      });
      
      navigate('/Emp');
    } catch (error) {
      Swal.fire({
        title: 'Setup Failed',
        html: `
          <div class="error-alert">
            <div class="error-icon">🔒</div>
            <p>Please try again.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Try Again',
        customClass: {
          popup: 'error-popup',
          title: 'error-title',
          htmlContainer: 'error-html',
          confirmButton: 'error-button'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSetupMode(!isSetupMode);
  };

  return (
    <div className="login-container">
      <LoginAnimation />
      <div className="login-content">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <div className="login-form-container">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : showWelcome ? (
            <div className="welcome-message">
              Welcome back, {formData.username}!
            </div>
          ) : (
            <>
              <h1 className="login-title">
                {isSetupMode ? 'Setup Manager Account' : 'Login'}
              </h1>
              <form onSubmit={isSetupMode ? handleSetup : handleSubmit}>
              <input
                type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="login-input"
                required
              />
              <input
                type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="login-input"
                required
              />
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isLoading}
                >
                  {isSetupMode ? 'Create Account' : 'Login'}
                </button>
          </form>
              {!isSetupMode && hasManager && (
                <button 
                  className="toggle-mode-button"
                  onClick={toggleMode}
                >
                  Switch to {isSetupMode ? 'Login' : 'Setup'} Mode
                </button>
              )}
            </>
          )}
        </div>
        </div>
    </div>
  );
};

export default Login;
