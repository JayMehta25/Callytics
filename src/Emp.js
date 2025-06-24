import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Orb from './orb2';
import './Emp.css';
import Swal from 'sweetalert2';
import axios from 'axios';

// Update API URL configuration
const API_URL = 'http://localhost:5000/api/employees';

// Add axios configuration
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add this CSS animation at the top of the file
const glowingTitleStyle = {
  color: '#fff',
  textAlign: 'center',
  marginBottom: '15px',
  fontSize: '1.2rem',
  animation: 'glow 2s ease-in-out infinite alternate',
  textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #6a11cb, 0 0 30px #6a11cb, 0 0 40px #6a11cb, 0 0 55px #6a11cb, 0 0 75px #6a11cb'
};

// Add this CSS animation at the top of the file
const glowingTextStyle = {
  color: '#fff',
  textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #6a11cb, 0 0 30px #6a11cb, 0 0 40px #6a11cb, 0 0 55px #6a11cb, 0 0 75px #6a11cb',
  animation: 'glow 2s ease-in-out infinite alternate'
};

const EmployeeDetailsCard = ({ employee }) => {
  return (
    <div className="employee-details-card" style={{
      background: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '15px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <h3 style={{
        color: '#fff',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>Employee Details</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div className="detail-item" style={{
          background: 'rgba(106, 17, 203, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(106, 17, 203, 0.3)'
        }}>
          <h4 style={{ color: '#6a11cb', marginBottom: '8px', fontSize: '0.9rem' }}>Name</h4>
          <p style={{ color: '#fff', fontSize: '1.1rem' }}>{employee.name}</p>
        </div>
        
        <div className="detail-item" style={{
          background: 'rgba(37, 117, 252, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(37, 117, 252, 0.3)'
        }}>
          <h4 style={{ color: '#2575fc', marginBottom: '8px', fontSize: '0.9rem' }}>Phone</h4>
          <p style={{ color: '#fff', fontSize: '1.1rem' }}>{employee.phone}</p>
        </div>
        
        <div className="detail-item" style={{
          background: 'rgba(255, 99, 132, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 99, 132, 0.3)'
        }}>
          <h4 style={{ color: '#ff6384', marginBottom: '8px', fontSize: '0.9rem' }}>Department</h4>
          <p style={{ color: '#fff', fontSize: '1.1rem' }}>{employee.department}</p>
        </div>
        
        <div className="detail-item" style={{
          background: 'rgba(75, 192, 192, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(75, 192, 192, 0.3)'
        }}>
          <h4 style={{ color: '#4bc0c0', marginBottom: '8px', fontSize: '0.9rem' }}>Gender</h4>
          <p style={{ color: '#fff', fontSize: '1.1rem' }}>{employee.gender}</p>
        </div>
      </div>
    </div>
  );
};

const EmployeeRegistration = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formFadingOut, setFormFadingOut] = useState(false);
  const [orbFadingOut, setOrbFadingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [registeredEmployees, setRegisteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');

  const navigate = useNavigate();

  const inputStyle = {
    width: '100%',
    padding: '18px 30px',
    border: '2px solid rgba(106, 17, 203, 0.3)',
    borderRadius: '12px',
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#fff',
    fontSize: '1.1rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: '1000',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 15px rgba(106, 17, 203, 0.1)',
    letterSpacing: '1px',
    marginBottom: '0.5rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#fff',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '2.5px',
    fontWeight: '500',
    textShadow: '0 0 10px rgba(106, 17, 203, 0.3)',
    transition: 'all 0.3s ease'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236a11cb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 20px center',
    backgroundSize: '20px',
    paddingRight: '50px'
  };

  // Load saved employees when component mounts
  useEffect(() => {
    const savedEmployees = localStorage.getItem('registeredEmployees');
    if (savedEmployees) {
      setRegisteredEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  // Save employees to localStorage whenever it changes
  useEffect(() => {
    if (registeredEmployees.length > 0) {
      localStorage.setItem('registeredEmployees', JSON.stringify(registeredEmployees));
    }
  }, [registeredEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        gender: formData.gender.toLowerCase()
      });
      
      if (response.data.success) {
        const newEmployee = response.data.employee;
        setRegisteredEmployees(prev => [...prev, newEmployee]);
        
        await Swal.fire({
      icon: 'success',
          title: 'Registration Successful! 🎉',
          text: `${formData.name} has been registered successfully!`,
      showConfirmButton: false,
          timer: 1500
        });

        // Reset form
        setFormData({
          name: '',
          phone: '',
          department: '',
          gender: ''
        });
        setShowRegister(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = registeredEmployees.filter(employee => {
    const query = searchQuery.toLowerCase();
    switch (searchType) {
      case 'name':
        return employee.name.toLowerCase().includes(query);
      case 'phone':
        return employee.phone.toLowerCase().includes(query);
      case 'department':
        return employee.department.toLowerCase().includes(query);
      default:
        return true;
    }
  });

  return (
    <div className="registration-container">
      <div className={`orb-container ${orbFadingOut ? 'fade-out' : ''}`}>
        <Orb hue={200} hoverIntensity={0.2} rotateOnHover={true} forceHoverState={false} />
      </div>

      <div className={`content-wrapper ${formFadingOut ? 'fade-out' : ''}`} style={{ paddingTop: '20px' }}>
        <h1 className="main-title" style={{ fontSize: '2rem', marginBottom: '20px' }}>Employee Portal</h1>
        <div className="form-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Show registration form */}
          <div className="animate-in" style={{ width: '100%', maxWidth: '500px', margin: '0 auto 20px' }}>
            <div className="register-section" style={{ padding: '20px' }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                <span style={glowingTextStyle}>New Employee Registration</span>
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, fontSize: '0.9rem' }}>Name</label>
                <input 
                  type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ ...inputStyle, padding: '10px 15px', fontSize: '0.9rem' }}
                  required
                />
              </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, fontSize: '0.9rem' }}>Phone Number</label>
                <input 
                  type="text" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ ...inputStyle, padding: '10px 15px', fontSize: '0.9rem' }}
                    placeholder="Enter phone number"
                />
              </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, fontSize: '0.9rem' }}>Department</label>
                <input 
                  type="text" 
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    style={{ ...inputStyle, padding: '10px 15px', fontSize: '0.9rem' }}
                  required
                />
              </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, fontSize: '0.9rem' }}>Gender</label>
                <select 
                  id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    style={{ ...selectStyle, padding: '10px 15px', fontSize: '0.9rem' }}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
                <button 
                  type="submit" 
                  className="form-button" 
                  disabled={isLoading}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.9rem',
                    marginTop: '10px'
                  }}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
          </div>
          </div>

          {/* Show registered employees */}
          {registeredEmployees.length > 0 && (
            <div className="animate-in" style={{ 
              width: '100%', 
              maxWidth: '800px', 
              margin: '0 auto',
              display: 'flex',
              gap: '20px'
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  color: '#fff',
                  textAlign: 'center',
                  marginBottom: '15px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>Registered Employees</h2>
                
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {filteredEmployees.map((employee, index) => (
                    <div key={index}>
                      <div 
                        onClick={() => setSelectedEmployee(selectedEmployee === employee ? null : employee)}
                        style={{
                          padding: '15px',
                          marginBottom: '10px',
                          background: 'rgba(106, 17, 203, 0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(106, 17, 203, 0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: '1.1rem' }}>{employee.name}</span>
                        <span style={{ color: '#6a11cb' }}>
                          {selectedEmployee === employee ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      {selectedEmployee === employee && (
                        <div style={{
                          padding: '20px',
                          marginBottom: '15px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '8px',
                          border: '1px solid rgba(106, 17, 203, 0.3)'
                        }}>
                          <EmployeeDetailsCard employee={employee} />
                          <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                navigate('/dashboard', { 
                                  state: { 
                                    username: employee.name, 
                                    employeeData: employee 
                                  } 
                                });
                              }}
                              style={{
                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                border: 'none',
                                padding: '10px 25px',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Go to Dashboard
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                width: '250px',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(106, 17, 203, 0.2)'
              }}>
                <h3 style={{
                  color: '#fff',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>Search Employees</h3>

                <div style={{ marginBottom: '15px' }}>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(106, 17, 203, 0.3)',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="name">Search by Name</option>
                    <option value="phone">Search by Phone</option>
                    <option value="department">Search by Department</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Enter ${searchType} to search...`}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(106, 17, 203, 0.3)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default EmployeeRegistration;