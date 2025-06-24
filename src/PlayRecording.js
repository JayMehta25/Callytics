import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Swal from 'sweetalert2';

const PlayRecording = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { audioFile, fileName, username, employeeData } = location.state || {};
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!audioFile) {
      Swal.fire({
        title: 'Error',
        text: 'No recording file found. Please upload a recording first.',
        icon: 'error',
        background: '#000',
        color: '#fff'
      }).then(() => {
        navigate('/dashboard');
      });
      return;
    }
    setIsLoading(false);
  }, [audioFile, navigate]);

  const handleError = () => {
    setError('Failed to load the audio file');
    Swal.fire({
      title: 'Error',
      text: 'Failed to load the audio file. Please try uploading again.',
      icon: 'error',
      background: '#000',
      color: '#fff'
    }).then(() => {
      navigate('/dashboard');
    });
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#000' }}>
        <div className="text-white text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading audio player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#000' }}>
        <div className="text-white text-center">
          <div className="mb-3">
            <i className="fas fa-exclamation-circle fa-3x"></i>
          </div>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#000' }}>
      <div className="card bg-transparent text-white" style={{
        maxWidth: '800px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">{fileName}</h2>
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>

          <div className="audio-player-container">
            <audio
              ref={audioRef}
              src={audioFile}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={handleError}
            />

            <div className="d-flex align-items-center mb-3">
              <button 
                className="btn btn-primary me-3"
                onClick={togglePlayPause}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                  border: 'none'
                }}
              >
                <i className={`fas fa-${isPlaying ? 'pause' : 'play'} fa-lg`}></i>
              </button>

              <div className="flex-grow-1">
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <div className="d-flex justify-content-between">
                  <small>{formatTime(currentTime)}</small>
                  <small>{formatTime(duration)}</small>
                </div>
              </div>
            </div>

            <div className="recording-info mt-4">
              <h4>Recording Details</h4>
              <div className="row mt-3">
                <div className="col-md-6">
                  <p><strong>Employee:</strong> {employeeData?.fullName || username}</p>
                  <p><strong>Department:</strong> {employeeData?.department || 'Not specified'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {formatTime(duration)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayRecording; 