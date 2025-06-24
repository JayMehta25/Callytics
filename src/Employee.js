import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Employee = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [employees, setEmployees] = useState([
    { name: 'Jay', role: 'Customer Service' },
    { name: 'Sarah', role: 'Technical Support' },
    { name: 'Mike', role: 'Sales Representative' }
  ]);
  const navigate = useNavigate();

  // ... existing code ...

  return (
    <div className="employee-container">
      <div className="employee-form">
        <h1>Employee Login</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <button className="view-logs-button" onClick={() => setShowLogs(!showLogs)}>
          {showLogs ? 'Hide Employee Logs' : 'View Employee Logs'}
        </button>
      </div>

      {showLogs && (
        <div className="employee-logs">
          <h2>Employee Logs</h2>
          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.name}>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>{new Date().toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${employee.status || 'active'}`}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee; 