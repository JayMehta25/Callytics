import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { Radar } from 'react-chartjs-2';
import { PolarArea } from 'react-chartjs-2';
import { Scatter } from 'react-chartjs-2';
import { Bubble } from 'react-chartjs-2';
import { BarElement } from 'chart.js';
import { ArcElement } from 'chart.js';
import { RadialLinearScale } from 'chart.js';
import { PolarAreaController } from 'chart.js';
import { ScatterController } from 'chart.js';
import { BubbleController } from 'chart.js';
import './advanced_analytics.css';
import { gsap } from 'gsap';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PolarAreaController,
  ScatterController,
  BubbleController
);

// Add this new component before the main AdvancedAnalytics component
const SummaryCard = ({ call, isOpen, onToggle }) => {
  const getTranscript = (call) => {
    if (call.id === 1) {
      return "Randall Thomas called Martha's Flowers to place an order for a dozen red roses. The employee collected his details, including his full name, phone number (409-866-5088), email address (randall.thomas@gmail.com), and shipping address (6800 Gladys Avenue, Beaumont, Texas, zip code 77706). Randall requested long-stem red roses, and the employee confirmed the total cost as $40, with delivery scheduled within 24 hours. Randall had no further requests, and the call ended on a polite note.";
    }
    if (call.id === 2) {
      return "Tom Jones called the law office asking to speak with Mr. Brown. The employee informed him that Mr. Brown was in court and unavailable. Mr. Jones provided his cell number, 510-244-1414, and explained he was seeking an update on his case after speaking with the other driver. The employee assured him the message would be passed on and thanked him for his patience.";
    }
    if (call.id === 3) {
      return "A customer called All Pro Vacuums about a vacuum that stopped working. Tanya asked if they had checked for blockages or a broken belt. The customer explained they had already done so and that the issue began while vacuuming the living room. After some back and forth, Tanya suggested checking the vacuum bag. The customer found it was full and realized that was likely the problem. They thanked Tanya and ended the call.";
    }
    return call.transcript?.employee || 'No transcript available';
  };

  return (
    <div className="summary-card" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '6px',
      padding: '6px 8px',
      marginBottom: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div 
        className="summary-header" 
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ 
          color: '#fff',
          margin: 0,
          fontSize: '0.8rem',
          fontWeight: 'normal',
        }}>
          Call Summary
        </h4>
        <span style={{ 
          color: '#fff',
          fontSize: '0.8rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
        }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div className="summary-content" style={{
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <p style={{ 
            color: '#fff',
            margin: '0 0 4px 0',
            lineHeight: '1.3',
            fontSize: '0.75rem',
          }}>
            {getTranscript(call)}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#fff',
            opacity: 0.8,
            fontSize: '0.7rem',
          }}>
            <span>Duration: {call.duration}</span>
            <span>Rating: {call.rating}/5</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedAnalytics = () => {
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedCallDuration, setSelectedCallDuration] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [employeeRecordings, setEmployeeRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeChart, setActiveChart] = useState(0);
  const [performanceScoreActiveChart, setPerformanceScoreActiveChart] = useState(0);
  const [averageDuration, setAverageDuration] = useState('0:00');
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeData } = location.state || {};
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Fetch employee recordings when component mounts
  useEffect(() => {
    const fetchEmployeeRecordings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:5000/api/employees/${employeeData?._id}/recordings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If 404, just return empty array instead of throwing error
          if (response.status === 404) {
            console.log('No recordings found, using mock data');
            setEmployeeRecordings([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch recordings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setEmployeeRecordings(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recordings:', error);
        setEmployeeRecordings([]);
        setIsLoading(false);
      }
    };

    if (employeeData?._id) {
      fetchEmployeeRecordings();
    }
  }, [employeeData?._id]);

  // Calculate average rating from all recordings
  const calculateAverageRating = () => {
    if (employeeRecordings.length === 0) {
      const currentCalls = employeeCalls[employeeData?.name] || [];
      if (currentCalls.length === 0) return 0;
      const totalRating = currentCalls.reduce((sum, call) => sum + call.rating, 0);
      return (totalRating / currentCalls.length).toFixed(1);
    }
    const totalRating = employeeRecordings.reduce((sum, recording) => sum + recording.rating, 0);
    return (totalRating / employeeRecordings.length).toFixed(1);
  };

  // Update the calculateTotalDuration function
  const calculateTotalDuration = () => {
    if (employeeRecordings.length === 0) {
      const currentCalls = employeeCalls['Jay'] || [];
      if (currentCalls.length === 0) return '0:00';
      
      // Calculate total duration from hardcoded values
      const totalSeconds = currentCalls.reduce((sum, call) => {
        const [minutes, seconds] = call.duration.split(':').map(Number);
        return sum + (minutes * 60) + seconds;
      }, 0);
      
      const averageSeconds = Math.round(totalSeconds / currentCalls.length);
      const minutes = Math.floor(averageSeconds / 60);
      const seconds = averageSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Calculate total duration from uploaded recordings
    return employeeRecordings.reduce((sum, recording) => {
      if (recording.audioFile) {
        const audio = new Audio(recording.audioFile);
        return sum + (audio.duration || 0);
      }
      return sum;
    }, 0);
  };

  // Format duration from seconds to MM:SS
  const formatDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update rating in the database
  const updateRating = async (recordingId, newRating) => {
    try {
      const response = await fetch(`/api/employees/${employeeData?._id}/recordings/${recordingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: newRating })
      });

      if (!response.ok) throw new Error('Failed to update rating');
      
      // Update local state
      setEmployeeRecordings(prevRecordings => 
        prevRecordings.map(recording => 
          recording._id === recordingId 
            ? { ...recording, rating: newRating }
            : recording
        )
      );
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const handleRatingChange = (rating) => {
    setNewRating(rating);
  };

  const saveRating = () => {
    if (selectedCall) {
      updateRating(selectedCall._id, newRating);
    }
    setIsEditingRating(false);
  };

  // Mock data for employee calls with audio files
  const employeeCalls = {
    'Jay': [
      {
        id: 1,
        time: '10:30 AM',
        duration: '12:45',
        audioFile: '/call (1).mp3',
        employeeEmotion: 'positive',
        customerEmotion: 'neutral',
      rating: 5,
        customerGender: 'male',
        transcript: {
          employee: "Thank you for calling Martha's Flowers. How may I assist you? I'd be happy to take care of your order. May I have your name, please? Randall Thomas. Can you spell that for me? Thank you for that information, Randall. May I have your home or office number or area code first? 866 5088. That's 409 866 5088. Do you have a fax number or email address? May have your shipping address? 77706 Gladys Avenue, Beaumont, Texas, zip code 77706. Thank you for the information. What products were you interested in purchasing? One dozen of Red Roses. Do you want long stamps? Alright. Randall, let me process the order. One moment, please. Randall, you're ordering one dozen long-stent red roses. The total amount of your order is $40, and it will be shipped to your address within 24 hours. Within 24 hours. Is there anything else I can help you with? No problem, Randall. Thank you for calling Martha's Florist. Have a nice day.",
          customer: "Hello, I'd like to order flowers, and I think you have what I'm looking for. Randall Thomas. Randall. R-A-N-D-A-L-L. Thomas. T-H-O-N-N. Area code 409. My email is randall.thomas at gmail.com randall.thomas at gmail.com. 6800 Gladys Avenue, Salomon, Texas. Zipcoded. Red Roses. Probably a dozen. Sure. Okay. I was looking to deliver my roses again. Okay, no problem. That's all for now, thanks."
        }
      },
      {
        id: 2,
        time: '11:45 AM',
        duration: '08:30',
        audioFile: '/sample-call-recording.mp3',
        employeeEmotion: 'neutral',
        customerEmotion: 'positive',
      rating: 4,
        customerGender: 'male',
        transcript: {
          employee: "Good morning, law offices. How may I direct your call? I can check to see if Mr. Brown is available. May I ask who's calling, please? Thank you, Mr. Jones. One moment, please, while I attempt to connect you to Mr. Brown. Mr. Jones, thank you so much for your patience and waiting. Mr. Brown is in court at the moment. May I have a phone number that he can reach you back at later today, please? Thank you. I'll let Mr. Brown know that you'd prefer to be reached on your cell phone at 510-244-1414. And may I tell him what the call is regarding, please? Thank you, Mr. Jones. I'll send Mr. Brown your message right away. My pleasure.",
          customer: "Good morning. Is Mr. Brown available? Sure. This is Tom Jones. Sure. I'll give you my cell phone number. It's 510-244-1414. Well, I spoke to the other driver, and I was looking for an update on my case status. Great. Thanks so much for being so thorough."
        }
      },
      {
        id: 3,
        time: '02:15 PM',
        duration: '15:20',
        audioFile: '/Bad Customer Service Rep (1).mp3',
        employeeEmotion: 'neutral',
        customerEmotion: 'negative',
        rating: 3,
        customerGender: 'male',
        transcript: {
          employee: "All Pro Vacuums, this is Tanya. Did you check underneath to see if anything is blocking it? How about the belt? Did you check to see if it was broken? Did the vacuum cleaner work when you first started using it today? Well, it sounds like that fixed your problem. Okay, no problem.",
          customer: "Hey, Tanya. I'm having a problem with my vacuum cleaner. It just stopped working on me, and I don't know why it stopped working. It's not old. Well, yeah, of course I did. That was one of the first things that I did. This is what happened. This morning, I started vacuuming my son's room. And it's a pretty good-sized room. It's about a 12 by 12. And it was working just fine. And then I moved into the living room, which is even a larger room. No. It wasn't the belt. I checked that, too. I'm trying to explain that what I was doing... Okay, hold on. I'm When I was vacuuming the living room, I started noticing that I wasn't picking up stuff so good. So I turned it off and I got down and started looking at it. And the carpet was kind of high, but nothing was clogged underneath. And also I did look at the belt and it seemed okay. Yes. I just said that. I remember I told you that I started off vacuuming my son's room. and it worked just fine and uh you know when i was vacuuming the living room that's when it stopped working have you ever checked a bag they get full and you have to replace them um huh you know what uh gosh let me okay let me let me check the bag uh that might be a hold on to this moment i'm All right. Okay, it's completely full. I can't wait to have my girlfriend and change the bag. Yeah. Yeah, thank you."
        }
      }
    ]
  };

  // Always use Jay's calls
  const currentEmployeeCalls = employeeCalls['Jay'] || [];

  // Remove all animation effects
  useEffect(() => {
    // Remove any existing animations
    gsap.killTweensOf('.analytics-container');
    gsap.killTweensOf('.sidebar-item');
    gsap.killTweensOf('.analysis-card');
    gsap.killTweensOf('.recording-card');
    gsap.killTweensOf('.transcript-popup');
  }, []);

  // Update the handleCallSelect to remove animations
  const handleCallSelect = (call) => {
    if (selectedCall) {
          if (audio) {
        try {
            audio.pause();
            audio.currentTime = 0;
          setIsPlaying(false);
        } catch (error) {
          console.error('Error stopping audio:', error);
        }
      }
      setSelectedCall(call);
      setShowTranscriptPopup(false);
    } else {
      setSelectedCall(call);
      setShowTranscriptPopup(false);
    }
  };

  // Handle audio playback/pause
  const handlePlayPauseAudio = async (audioSrc) => {
    try {
    if (isPlaying) {
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
        if (audio && audio.src.includes(audioSrc.split('/').pop()) && audio.paused) {
          try {
            await audio.play();
        setIsPlaying(true);
          } catch (error) {
            console.error('Audio playback error:', error);
            setIsPlaying(false);
          }
      } else {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
          
        const newAudio = new Audio(audioSrc);
        newAudio.onended = () => setIsPlaying(false);
          newAudio.onerror = (e) => {
            console.error('Audio loading error:', e);
            setIsPlaying(false);
          };
          
          newAudio.addEventListener('loadedmetadata', () => {
            const minutes = Math.floor(newAudio.duration / 60);
            const seconds = Math.floor(newAudio.duration % 60);
            setSelectedCallDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          });
          
          setAudio(newAudio);
          
          setTimeout(async () => {
            try {
              await newAudio.play();
              setIsPlaying(true);
            } catch (error) {
              console.error('New audio playback error:', error);
              setIsPlaying(false);
            }
          }, 50);
        }
      }
    } catch (error) {
      console.error('Audio operation error:', error);
      setIsPlaying(false);
    }
  };

  // Reset background when component loads
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  // Calculate average duration
  const calculateAverageDuration = (calls) => {
    const totalDuration = calls.reduce((sum, call) => sum + parseInt(call.duration), 0);
    return totalDuration / calls.length || 0;
  };

  // Chart data for call duration
  const callDurationData = selectedCall
    ? {
        labels: [selectedCall.time],
        datasets: [
          {
            label: 'Call Duration (minutes)',
            data: [parseInt(selectedCall.duration)],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointRadius: 5,
          },
          {
            label: 'Average Duration',
            data: currentEmployeeCalls.map(() => calculateAverageDuration(currentEmployeeCalls)),
            backgroundColor: 'rgba(0, 128, 128, 0.5)',
            borderColor: 'rgba(0, 128, 128, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      }
    : {
        labels: currentEmployeeCalls
          .sort((a, b) => new Date(a.time) - new Date(b.time))
          .map((call) => call.time),
        datasets: [
          {
            label: 'Call Duration (minutes)',
            data: currentEmployeeCalls
              .sort((a, b) => new Date(a.time) - new Date(b.time))
              .map((call) => parseInt(call.duration)),
            backgroundColor: 'rgba(0, 128, 128, 0.5)',
            borderColor: 'rgba(0, 128, 128, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Average Duration',
            data: currentEmployeeCalls.map(() => calculateAverageDuration(currentEmployeeCalls)),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      };

  // Chart data for emotion distribution
  const emotionData = selectedCall
    ? {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            label: 'Emotion Distribution',
            data: [
              (selectedCall.employeeEmotion === 'positive' || selectedCall.customerEmotion === 'positive') ? 1 : 0,
              (selectedCall.employeeEmotion === 'negative' || selectedCall.customerEmotion === 'negative') ? 1 : 0,
              (selectedCall.employeeEmotion === 'neutral' || selectedCall.customerEmotion === 'neutral') ? 1 : 0,
            ],
            backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
          },
        ],
      }
    : {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            label: 'Emotion Distribution',
            data: [
              currentEmployeeCalls.filter((call) => call.employeeEmotion === 'positive' || call.customerEmotion === 'positive').length,
              currentEmployeeCalls.filter((call) => call.employeeEmotion === 'negative' || call.customerEmotion === 'negative').length,
              currentEmployeeCalls.filter((call) => call.employeeEmotion === 'neutral' || call.customerEmotion === 'neutral').length,
            ],
            backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
          },
        ],
      };

  // Handle back button click
  const handleBack = () => {
    setIsTransitioning(true);
    document.body.classList.add('page-transition');
    
    setTimeout(() => {
      navigate('/dashboard', {
        state: {
          username: location.state?.username,
          employeeData: location.state?.employeeData
        }
      });
    }, 500);
  };

  // Function to handle audio file upload
  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('audio.*')) {
      alert('Please select an audio file');
      return;
    }

    setUploadingFile(true);

    try {
      // First, process the audio file
      const processFormData = new FormData();
      processFormData.append('audio', file);

      const processResponse = await fetch('http://localhost:5001/process-audio', {
        method: 'POST',
        body: processFormData
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process audio file');
      }

      const processedData = await processResponse.json();

      // Now upload to the main backend with the processed data
      const uploadFormData = new FormData();
      uploadFormData.append('audio', file);
      uploadFormData.append('duration', processedData.duration);
      uploadFormData.append('rating', processedData.suggestedRating);
      uploadFormData.append('employeeEmotion', processedData.employeeEmotion);
      uploadFormData.append('customerEmotion', processedData.customerEmotion);
      uploadFormData.append('transcript', processedData.transcript);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const uploadResponse = await fetch(`http://localhost:5000/api/employees/${employeeData?._id}/recordings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload audio file');
      }

      const newRecording = await uploadResponse.json();
      
      // Update local state with the new recording
      setEmployeeRecordings(prevRecordings => [...prevRecordings, newRecording]);
      
      alert('Audio file processed and uploaded successfully');
    } catch (error) {
      console.error('Error processing/uploading audio file:', error);
      alert(error.message || 'Failed to process/upload audio file');
    } finally {
      setUploadingFile(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Update the calculateCallDuration function to get actual MP3 duration
  const calculateCallDuration = (call) => {
    if (call.audioFile) {
      return new Promise((resolve) => {
        const audio = new Audio(call.audioFile);
        audio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
        audio.addEventListener('error', () => {
          // If audio fails to load, use the duration from the call object
          resolve(call.duration || '0:00');
        });
      });
    }
    return Promise.resolve(call.duration || '0:00');
  };

  // Update the RecordingCard component to include the summary card
  const RecordingCard = ({ call, onSelect, isSelected }) => {
    const [showSummary, setShowSummary] = useState(false);
    const [actualDuration, setActualDuration] = useState(call.duration || '0:00');

    const getTranscript = (call) => {
      if (call.id === 1) {
        return "Randall Thomas called Martha's Flowers to place an order for a dozen red roses. The employee collected his details, including his full name, phone number (409-866-5088), email address (randall.thomas@gmail.com), and shipping address (6800 Gladys Avenue, Beaumont, Texas, zip code 77706). Randall requested long-stem red roses, and the employee confirmed the total cost as $40, with delivery scheduled within 24 hours. Randall had no further requests, and the call ended on a polite note.";
      }
      if (call.id === 2) {
        return "Tom Jones called the law office asking to speak with Mr. Brown. The employee informed him that Mr. Brown was in court and unavailable. Mr. Jones provided his cell number, 510-244-1414, and explained he was seeking an update on his case after speaking with the other driver. The employee assured him the message would be passed on and thanked him for his patience.";
      }
      if (call.id === 3) {
        return "A customer called All Pro Vacuums about a vacuum that stopped working. Tanya asked if they had checked for blockages or a broken belt. The customer explained they had already done so and that the issue began while vacuuming the living room. After some back and forth, Tanya suggested checking the vacuum bag. The customer found it was full and realized that was likely the problem. They thanked Tanya and ended the call.";
      }
      return 'No summary available';
    };

    useEffect(() => {
      calculateCallDuration(call).then(duration => {
        setActualDuration(duration);
      });
    }, [call]);

  return (
      <div 
        className={`recording-card ${isSelected ? 'selected' : ''}`} 
        onClick={() => onSelect(call)}
        style={{
          transition: 'none',
          animation: 'none',
          transform: 'none',
          opacity: 1,
          pointerEvents: 'auto'
        }}
      >
        <div className="recording-header">
          <h3 className="recording-title">Call #{call.id}</h3>
          <span className="recording-time">{call.time}</span>
            </div>
        <div className="recording-info">
          <div className="duration-badge">{actualDuration}</div>
          <div className="emotion-badges">
            <div className={`emotion-badge ${call.employeeEmotion}`}>
              <span className="emotion-label">Employee</span>
              <span className="emotion-value">{call.employeeEmotion}</span>
        </div>
            <div className={`emotion-badge ${call.customerEmotion}`}>
              <span className="emotion-label">Customer</span>
              <span className="emotion-value">{call.customerEmotion}</span>
                </div>
                </div>
          <div className="rating-display">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < call.rating ? 'filled' : ''}`}>★</span>
              ))}
              </div>
          </div>
        </div>
        <div className="action-buttons" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: '12px',
          marginTop: '15px'
        }}>
          <button className="view-details-btn" onClick={(e) => {
            e.stopPropagation();
            onSelect(call);
          }} style={{
            background: 'linear-gradient(270deg, #4776E6, #8E54E9, #4776E6)',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 3s linear infinite',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '7px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(71, 118, 230, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            fontSize: '0.75rem',
            fontWeight: '500',
            height: '34px',
            minWidth: '120px',
            whiteSpace: 'nowrap',
            flex: '1',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <style>
              {`
                @keyframes gradientMove {
                  0% { background-position: 0% 50% }
                  50% { background-position: 100% 50% }
                  100% { background-position: 0% 50% }
                }
                .view-details-btn:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(71, 118, 230, 0.4);
                }
              `}
            </style>
            View Details
          </button>
          <div style={{ display: 'flex', gap: '12px', flex: '2' }}>
            <button className="toggle-transcript" onClick={(e) => {
              e.stopPropagation();
              setShowTranscriptPopup(true);
            }} style={{
              background: 'linear-gradient(45deg, #614385, #516395)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '7px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              fontSize: '0.75rem',
              fontWeight: '500',
              height: '34px',
              minWidth: '80px',
              flex: '1'
            }}>
                    View Transcript
                  </button>
            <button className="toggle-summary" onClick={(e) => {
              e.stopPropagation();
              setShowSummary(!showSummary);
            }} style={{
              background: 'linear-gradient(45deg, #1a2980, #26d0ce)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '7px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              fontSize: '0.75rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              height: '34px',
              minWidth: '140px',
              whiteSpace: 'nowrap',
              flex: '1'
            }}>
              {showSummary ? (
                <>
                  <span style={{ color: '#00ff88', fontSize: '0.7rem' }}>▼</span> Hide Summary
                </>
              ) : (
                <>
                  <span style={{ color: '#00ff88', fontSize: '0.7rem' }}>▶</span> View Summary
                </>
              )}
                  </button>
                </div>
                </div>
        {showSummary && (
          <div className="summary-content" style={{
            marginTop: '10px',
            padding: '15px',
            background: 'linear-gradient(270deg, rgba(0, 0, 0, 0.95), rgba(0, 157, 255, 0.85), rgba(0, 0, 0, 0.95))',
            backgroundSize: '300% 100%',
            animation: 'gradientMove 6s linear infinite',
            borderRadius: '6px',
            border: '1px solid rgba(0, 157, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 157, 255, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <p style={{ 
              color: '#fff',
              margin: 0,
              lineHeight: '1.5',
              fontSize: '0.9rem',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              zIndex: 1,
              fontWeight: '400',
              letterSpacing: '0.3px'
            }}>
              {getTranscript(call)}
            </p>
              </div>
        )}
      </div>
    );
  };

  // Update the renderRecordingsList function
  const renderRecordingsList = () => (
    <div className="recordings-list" style={{ 
      transition: 'none',
      animation: 'none',
      transform: 'none',
      opacity: 1,
      pointerEvents: 'auto'
    }}>
      {currentEmployeeCalls.map((call) => (
        <RecordingCard
          key={call.id}
          call={call}
          onSelect={handleCallSelect}
          isSelected={selectedCall?.id === call.id}
        />
      ))}
    </div>
  );

  // Update the transcript popup to remove animations
  const renderTranscriptPopup = () => (
    <div className="transcript-popup-overlay" style={{
      transition: 'none',
      animation: 'none',
      transform: 'none',
      opacity: showTranscriptPopup ? 1 : 0,
      pointerEvents: showTranscriptPopup ? 'auto' : 'none'
    }}>
      <div className="transcript-popup" style={{
        transition: 'none',
        animation: 'none',
        transform: 'none'
      }}>
        <h3>Call Transcript</h3>
        <div className="transcript-content">
          <div className="employee-transcript">
            <h5>Employee</h5>
            <p>{selectedCall?.transcript?.employee}</p>
          </div>
          <div className="customer-transcript">
            <h5>Customer</h5>
            <p>{selectedCall?.transcript?.customer}</p>
          </div>
        </div>
                    <button 
          className="close-button"
          onClick={() => setShowTranscriptPopup(false)}
                    >
          Close
                    </button>
                  </div>
                </div>
  );

  // Update the header styling
  const headerStyle = {
    background: 'linear-gradient(45deg, #000428, #004e92, #000428, #004e92)',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  };

  // Update the handleChartNavigation to use the correct state
  const handleChartNavigation = (direction) => {
    if (direction === 'prev') {
      setPerformanceScoreActiveChart((prev) => (prev - 1 + 3) % 3);
    } else {
      setPerformanceScoreActiveChart((prev) => (prev + 1) % 3);
    }
  };

  // Add auto-rotation effect only for performance score
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setPerformanceScoreActiveChart((prev) => (prev + 1) % 3);
  //   }, 3000);
  //   return () => clearInterval(timer);
  // }, []);

  // Convert renderStatsGrid into a proper React component
  const StatsGrid = ({ selectedCall, employeeRecordings, employeeData, averageDuration }) => {
    const [callDuration, setCallDuration] = useState(selectedCall?.duration || '0:00');

    useEffect(() => {
      if (selectedCall) {
        calculateCallDuration(selectedCall).then(duration => {
          setCallDuration(duration);
        });
      }
    }, [selectedCall]);

    return (
      <div className="stats-grid">
        <div className={`stat-card ${selectedCall ? 'fade-in' : ''}`}>
          <h3>{selectedCall ? 'Call Time' : 'Total Calls'}</h3>
          <div className="stat-value">
            {selectedCall ? selectedCall.time : 3}
          </div>
          <div className="stat-trend positive">
            {selectedCall ? 'Current call time' : 'Based on all recordings'}
          </div>
        </div>
        <div className={`stat-card ${selectedCall ? 'fade-in' : ''}`}>
          <h3>{selectedCall ? 'Call Rating' : 'Average Rating'}</h3>
          <div className="stat-value">
            {selectedCall ? selectedCall.rating : 4}
          </div>
          <div className="stat-trend positive">
            {selectedCall ? 'Current call rating' : 'Based on all calls'}
          </div>
        </div>
        <div className={`stat-card ${selectedCall ? 'fade-in' : ''}`}>
          <h3>{selectedCall ? 'Call Duration' : 'Average Duration'}</h3>
          <div className="stat-value">
            {selectedCall ? callDuration : averageDuration}
          </div>
          <div className="stat-trend positive">
            {selectedCall ? 'Current call duration' : 'Average duration of all calls'}
          </div>
        </div>
      </div>
    );
  };

  // Add back the renderSpeakingTimeChart function
  const renderSpeakingTimeChart = () => {
    const call = selectedCall || currentEmployeeCalls[0];
    if (!call) return null;

    const speakingTime = calculateSpeakingTime(call);
    const totalTime = speakingTime.employee + speakingTime.customer;
    const employeePercentage = Math.round((speakingTime.employee / totalTime) * 100);
    const customerPercentage = Math.round((speakingTime.customer / totalTime) * 100);

    return (
      <div className="speaking-time-chart">
        <h3>Speaking Time Distribution</h3>
        <div className="chart-wrapper">
          <Pie
            data={{
              labels: ['Employee', 'Customer'],
              datasets: [{
                data: [speakingTime.employee, speakingTime.customer],
                backgroundColor: [
                  'rgba(76, 175, 80, 0.8)',
                  'rgba(33, 150, 243, 0.8)'
                ],
                borderColor: [
                  'rgba(76, 175, 80, 1)',
                  'rgba(33, 150, 243, 1)'
                ],
                borderWidth: 2
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 0
              },
              plugins: {
                tooltip: {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  titleColor: '#2c3e50',
                  bodyColor: '#2c3e50',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
                  padding: 12,
                  callbacks: {
                    label: function(context) {
                      const value = context.raw;
                      const percentage = Math.round((value / totalTime) * 100);
                      const minutes = Math.floor(value / 60);
                      const seconds = value % 60;
                      return [
                        `${context.label}:`,
                        `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`,
                        `Percentage: ${percentage}%`
                      ];
                    }
                  }
                },
                legend: {
                  display: false
                }
              },
              layout: {
                padding: 20
              }
            }}
          />
            </div>
        <div className="speaking-time-legend">
          <div className="speaking-time-legend-item">
            <div className="speaking-time-legend-color" style={{ backgroundColor: 'rgba(76, 175, 80, 0.8)' }} />
            <span className="speaking-time-legend-label">Employee</span>
            <span className="speaking-time-legend-value">
              {Math.floor(speakingTime.employee / 60)}:{String(speakingTime.employee % 60).padStart(2, '0')} ({employeePercentage}%)
            </span>
          </div>
          <div className="speaking-time-legend-item">
            <div className="speaking-time-legend-color" style={{ backgroundColor: 'rgba(33, 150, 243, 0.8)' }} />
            <span className="speaking-time-legend-label">Customer</span>
            <span className="speaking-time-legend-value">
              {Math.floor(speakingTime.customer / 60)}:{String(speakingTime.customer % 60).padStart(2, '0')} ({customerPercentage}%)
            </span>
        </div>
        </div>
    </div>
  );
};

  // Add back the calculateSpeakingTime function
  const calculateSpeakingTime = (call) => {
    const totalDuration = call.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    return {
      employee: Math.round(totalDuration * 0.6),
      customer: Math.round(totalDuration * 0.4)
    };
  };

  // Update the useEffect for average duration calculation
  useEffect(() => {
    if (!selectedCall) {
      const duration = calculateTotalDuration();
      setAverageDuration(duration);
    }
  }, [selectedCall, employeeRecordings]);

  // Update the PerformanceCard component to use the new state
  const PerformanceCard = ({ score, sentimentData, emotionData }) => {
    return (
      <div className="performance-score-container">
        <h3>Performance Score</h3>
        <div className="chart-carousel">
                    <button 
            className="carousel-arrow" 
            onClick={() => handleChartNavigation('prev')}
            aria-label="Previous chart"
                    >
            ←
                    </button>
          <div className="chart-display">
            {performanceScoreActiveChart === 0 && (
              <div className="score-circle">
                <div className="score">{score}</div>
                <div className="score-label">Score</div>
                  </div>
            )}
            {performanceScoreActiveChart === 1 && (
              <div className="performance-trend-chart">
                <Line
                  data={sentimentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          color: '#2c3e50'
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#2c3e50'
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
                </div>
            )}
            {performanceScoreActiveChart === 2 && (
              <div className="kpi-chart">
                <div className="kpi-value">{selectedCall.rating}/5</div>
                <div className="kpi-label">Call Rating</div>
                <div className="kpi-trend positive">
                  <i className="fas fa-star"></i>
                  <span>Based on customer feedback</span>
              </div>
                <div className="kpi-description">
                  This rating reflects the overall quality of the call based on customer satisfaction metrics
            </div>
          </div>
        )}
      </div>
          <button 
            className="carousel-arrow" 
            onClick={() => handleChartNavigation('next')}
            aria-label="Next chart"
          >
            →
          </button>
        </div>
        <div className="chart-indicators">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`indicator ${performanceScoreActiveChart === index ? 'active' : ''}`}
              onClick={() => setPerformanceScoreActiveChart(index)}
              role="button"
              aria-label={`Show chart ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Convert renderCustomerInsights into a proper React component
  const CustomerInsights = ({ selectedCall }) => {
    const [callDuration, setCallDuration] = useState(selectedCall?.duration || '0:00');

    useEffect(() => {
      if (selectedCall) {
        calculateCallDuration(selectedCall).then(duration => {
          setCallDuration(duration);
        });
      }
    }, [selectedCall]);

    return (
      <div className="customer-insights" style={{
        height: '100%',
    display: 'flex',
        flexDirection: 'column',
        padding: '20px 0'
      }}>
        <h4 style={{ 
          marginBottom: '25px', 
          fontSize: '1.2rem',
          color: '#333',
          fontWeight: '600'
        }}>Customer Insights</h4>
        <div className="insight-items" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
          flex: 1,
          padding: '0 10px'
        }}>
          <div className="insight-item" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
    padding: '20px',
    display: 'flex',
            flexDirection: 'column',
    gap: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span className="insight-icon" style={{
              fontSize: '24px',
              marginBottom: '5px',
              color: '#333'
            }}>👤</span>
            <div className="insight-content" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <span className="insight-label" style={{
                color: '#666',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>Customer Gender</span>
              <span className="insight-value" style={{
                color: '#333',
    fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {selectedCall.customerGender === 'male' ? '♂️ Male' : '♀️ Female'}
              </span>
            </div>
          </div>

          <div className="insight-item" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span className="insight-icon" style={{
              fontSize: '24px',
    marginBottom: '5px',
              color: '#333'
            }}>😊</span>
            <div className="insight-content" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <span className="insight-label" style={{
                color: '#666',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>Emotional State</span>
              <span className={`insight-value ${selectedCall.customerEmotion}`} style={{
                color: '#333',
    fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {selectedCall.customerEmotion}
              </span>
            </div>
          </div>

          <div className="insight-item" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span className="insight-icon" style={{
              fontSize: '24px',
    marginBottom: '5px',
              color: '#333'
            }}>⏱️</span>
            <div className="insight-content" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <span className="insight-label" style={{
                color: '#666',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>Call Duration</span>
              <span className="insight-value" style={{
                color: '#333',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>{callDuration}</span>
            </div>
          </div>

          <div className="insight-item" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
            gap: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span className="insight-icon" style={{
              fontSize: '24px',
              marginBottom: '5px',
              color: '#333'
            }}>🕒</span>
            <div className="insight-content" style={{
    display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <span className="insight-label" style={{
                color: '#666',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>Call Time</span>
              <span className="insight-value" style={{
                color: '#333',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>{selectedCall.time}</span>
            </div>
          </div>
        </div>

        <style>
          {`
            .insight-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .insight-item::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.02),
                rgba(0, 0, 0, 0.01)
              );
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            
            .insight-item:hover::before {
              opacity: 1;
            }
          `}
        </style>
      </div>
    );
  };

  // Create a new AudioPlayer component
  const AudioPlayer = ({ selectedCall }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);
    const [duration, setDuration] = useState('0:00');
    const [error, setError] = useState(null);

    useEffect(() => {
      if (selectedCall?.audioFile) {
        const newAudio = new Audio(selectedCall.audioFile);
        
        // Set up event listeners
        newAudio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(newAudio.duration / 60);
          const seconds = Math.floor(newAudio.duration % 60);
          setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });

        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
        });

        newAudio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setError('Failed to load audio file');
          setIsPlaying(false);
        });

        setAudio(newAudio);

        // Cleanup function
        return () => {
          if (newAudio) {
            newAudio.pause();
            newAudio.currentTime = 0;
            newAudio.removeEventListener('loadedmetadata', () => {});
            newAudio.removeEventListener('ended', () => {});
            newAudio.removeEventListener('error', () => {});
          }
        };
      }
    }, [selectedCall]);

    const handlePlayPause = async () => {
      if (!audio) {
        setError('No audio file available');
        return;
      }

      try {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          await audio.play();
          setIsPlaying(true);
          setError(null);
        }
      } catch (error) {
        console.error('Audio playback error:', error);
        setError('Failed to play audio');
        setIsPlaying(false);
      }
    };

    return (
      <div className="audio-player-section">
        <h4>Audio Playback</h4>
        {error && <div className="error-message">{error}</div>}
        <div className="audio-controls">
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayPause}
            disabled={!audio}
          >
            {isPlaying ? '⏸️' : '▶️'}
        </button>
          <div className="time-display">
            {duration}
      </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`advanced-analytics-container ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="analytics-header" style={headerStyle}>
        <button onClick={handleBack} className="back-button">←</button>
        <h1 className="analytics-title">Advanced Analytics</h1>
        <p className="analytics-subtitle">Detailed analysis of {employeeData?.name || 'Employee'}'s performance</p>
              </div>

      <div className="analytics-grid" style={{
        display: 'grid',
        gridTemplateColumns: '45% 55%',  // Changed from default to make recordings section wider
    gap: '20px',
        padding: '20px'
      }}>
        <div className="recordings-section" style={{
          width: '100%',
          minWidth: '600px'  // Added minimum width to ensure buttons fit
        }}>
          <div className="section-header">
            <h2 className="section-title">Call Recordings</h2>
            <div className="upload-section">
              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />
              <button 
                className="upload-button"
                onClick={() => document.getElementById('audio-upload').click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? 'Uploading...' : 'Upload New Recording'}
              </button>
              </div>
            </div>
          {renderRecordingsList()}
        </div>

        <div className="analytics-overview" style={{
          width: '100%'
        }}>
          <h2 className="section-title">
            {selectedCall ? 'Call Details' : 'Analytics Overview'}
          </h2>
          
          {selectedCall && (
            <div className="call-details-container">
              <div className="call-details-left">
                {selectedCall && <AudioPlayer selectedCall={selectedCall} />}

                <div className="performance-score-container">
                  <h3>Call Performance Score</h3>
                  <div className="chart-carousel">
                    <button 
                      className="carousel-arrow prev" 
                      onClick={() => handleChartNavigation('prev')}
                    >
                      ←
            </button>
                    
                    <div className="chart-display">
                      {performanceScoreActiveChart === 0 && (
                        <div className="score-circle">
                          <div className="score-value">
                            {Math.round((
                              (selectedCall.rating / 5) * 0.4 + 
                              ((selectedCall.employeeEmotion === 'positive' ? 1 : selectedCall.employeeEmotion === 'neutral' ? 0.5 : 0) * 0.3) +
                              ((selectedCall.customerEmotion === 'positive' ? 1 : selectedCall.customerEmotion === 'neutral' ? 0.5 : 0) * 0.3)
                            ) * 100)}%
          </div>
        </div>
      )}
                      
                      {performanceScoreActiveChart === 1 && (
                        <div className="mini-line-chart">
                          <Line
                            data={{
                              labels: ['Employee', 'Customer'],
                              datasets: [
                                {
                                  label: 'Sentiment',
                                  data: [
                                    selectedCall.employeeEmotion === 'positive' ? 100 : 
                                      selectedCall.employeeEmotion === 'neutral' ? 50 : 0,
                                    selectedCall.customerEmotion === 'positive' ? 100 : 
                                      selectedCall.customerEmotion === 'neutral' ? 50 : 0
                                  ],
                                  borderColor: 'rgba(75, 192, 192, 1)',
                                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                  fill: true
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  },
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                  }
                                },
                                x: {
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  },
                                  grid: {
                                    display: false
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                      
                    </div>

                    <button 
                      className="carousel-arrow next" 
                      onClick={() => handleChartNavigation('next')}
                    >
                      →
                    </button>
                  </div>
                  <div className="chart-indicators">
                    {[0, 1].map((index) => (
                      <span 
                        key={index} 
                        className={`indicator ${performanceScoreActiveChart === index ? 'active' : ''}`}
                        onClick={() => setPerformanceScoreActiveChart(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="call-details-right">
                {selectedCall && <CustomerInsights selectedCall={selectedCall} />}
              </div>
            </div>
          )}

          <StatsGrid 
            selectedCall={selectedCall}
            employeeRecordings={employeeRecordings}
            employeeData={employeeData}
            averageDuration={averageDuration}
          />

          <div className="charts-container">
            <div className={`analytics-chart ${selectedCall ? 'fade-in' : ''}`}>
              <h3>{selectedCall ? 'Call Sentiment Analysis' : 'Sentiment & Rating Trend'}</h3>
              <div className="chart-wrapper">
                <Line data={selectedCall ? {
                  labels: ['Employee', 'Customer'],
                  datasets: [
                    {
                      label: 'Sentiment Score',
                      data: [
                        selectedCall.employeeEmotion === 'positive' ? 100 : 
                          selectedCall.employeeEmotion === 'neutral' ? 50 : 0,
                        selectedCall.customerEmotion === 'positive' ? 100 : 
                          selectedCall.customerEmotion === 'neutral' ? 50 : 0
                      ],
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Rating',
                      data: [selectedCall.rating * 20, selectedCall.rating * 20],
                      backgroundColor: 'rgba(255, 206, 86, 0.2)',
                      borderColor: 'rgba(255, 206, 86, 1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4
                    }
                  ]
                } : {
                  labels: currentEmployeeCalls.map(call => call.time),
                  datasets: [
                    {
                      label: 'Average Sentiment',
                      data: currentEmployeeCalls.map(call => {
                        const employeeScore = call.employeeEmotion === 'positive' ? 100 : 
                          call.employeeEmotion === 'neutral' ? 50 : 0;
                        const customerScore = call.customerEmotion === 'positive' ? 100 : 
                          call.customerEmotion === 'neutral' ? 50 : 0;
                        return (employeeScore + customerScore) / 2;
                      }),
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Rating Trend',
                      data: currentEmployeeCalls.map(call => call.rating * 20),
                      backgroundColor: 'rgba(255, 206, 86, 0.2)',
                      borderColor: 'rgba(255, 206, 86, 1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }}
                options={{
    responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                  },
    plugins: {
      legend: {
        position: 'top',
                      labels: {
                        color: '#2c3e50',
                        font: { size: 12, weight: 'bold' }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw;
                          if (context.dataset.label.includes('Rating')) {
                            return `Rating: ${(value / 20).toFixed(1)} stars`;
                          } else {
                            return `Sentiment: ${value.toFixed(1)}%`;
                          }
                        }
                      }
                    }
    },
    scales: {
      x: {
        title: {
          display: true,
                        text: selectedCall ? 'Participant' : 'Call Time',
                        color: '#2c3e50',
        },
                      ticks: { color: '#2c3e50' },
                      grid: { color: 'rgba(44, 62, 80, 0.1)' },
      },
      y: {
        title: {
          display: true,
                        text: 'Score (%)',
                        color: '#2c3e50',
                      },
                      ticks: { color: '#2c3e50' },
                      grid: { color: 'rgba(44, 62, 80, 0.1)' },
                      min: 0,
                      max: 100,
                    },
                  },
                }} />
              </div>
            </div>
            {renderSpeakingTimeChart()}
          </div>
        </div>
      </div>

      {renderTranscriptPopup()}
    </div>
  );
};

export default AdvancedAnalytics;