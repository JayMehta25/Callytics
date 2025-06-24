import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import HomePage from "./Login";
import Dashboard from "./Dashboard";
import EmployeeRegistration from "./Emp";
import AdvancedAnalytics from "./advanced_analytics";
import LandingPage from './LandingPage';
import SetupManager from './SetupManager';
import PlayRecording from './PlayRecording';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<HomePage />} />
        <Route path="/setup-manager" element={<SetupManager />} />
        <Route path="/Dashboard" element={<Dashboard/>}/>
        <Route path="/Emp" element={<EmployeeRegistration/>}/>
        <Route path="/advanced_analytics" element={<AdvancedAnalytics/>}/>
        <Route path="/play-recording" element={<PlayRecording />} />
      </Routes>
    </Router>
  );
}

export default App;




