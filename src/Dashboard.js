import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useNavigate, useLocation } from 'react-router-dom';
import GooeyNav from './GooeyNav';
import { Particles } from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { gsap } from 'gsap';
import Swal from 'sweetalert2';
import Typewriter from './Typewriter';

// Background reset to ensure full black background
document.body.style.backgroundColor = "#000000";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Add chart options configuration
const threeDChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0 // Disable animations
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'white',
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      color: 'white'
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1
    }
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 3,
      hoverRadius: 5
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    }
  }
};

// Add these new chart options for animated charts
const animatedChartOptions = {
  ...threeDChartOptions,
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart'
  },
  plugins: {
    ...threeDChartOptions.plugins,
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: { display: false },
    y: { display: false }
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, employeeData: initialEmployeeData } = location.state || {};
  const fileInputRef = useRef(null);

  // State for employee data
  const [employeeData, setEmployeeData] = useState(initialEmployeeData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // For showing save status
  const [editedEmployeeData, setEditedEmployeeData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);

  // Generate dynamic call data based on employeeData or defaults if not available
  const [callData, setCallData] = useState({
    totalCalls: 0,
    totalHours: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
  });

  const [activeView, setActiveView] = useState('overview');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Add hover state at the top of the component
  const [hoveredCard, setHoveredCard] = useState(null);

  // Update card style for more depth
  const cardStyle = {
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 32px rgba(255, 255, 255, 0.05)',
    willChange: 'transform',
    transform: 'translateZ(0) perspective(1000px)',
    backfaceVisibility: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  // Add this to the Dashboard component to modify the form control styles
  const formControlStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Reduced opacity
    backdropFilter: 'blur(8px)', // Reduced blur
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    transition: 'none',
    willChange: 'transform',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: 1000,
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)' // Reduced shadow intensity
  };

  // Function to load employee data from localStorage
  const loadEmployeeData = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      // Get data from localStorage
      const storedData = localStorage.getItem(`employee_${username}`);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        setEmployeeData(data);
        setEditedEmployeeData(data);
        
        if (data.profileImageUrl) {
          setProfileImage(data.profileImageUrl);
        }
      } else {
        console.log("No employee data found for:", username);
        // If we have initial data from the login flow, use that
        if (initialEmployeeData) {
          setEmployeeData(initialEmployeeData);
          setEditedEmployeeData(initialEmployeeData);
          
          // Store the employee record in localStorage
          localStorage.setItem(`employee_${username}`, JSON.stringify(initialEmployeeData));
        }
      }
    } catch (error) {
      console.error("Error loading employee data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load employee data on component mount
  useEffect(() => {
    loadEmployeeData();
  }, [username]);

  useEffect(() => {
    // Generate data based on employeeData if available, otherwise use defaults
    if (employeeData) {
      // Use employee's totalCalls if available, or generate a number based on username
      const totalCalls = employeeData.totalCalls || 
        ((username || 'user').length * 10) + Math.floor(Math.random() * 50) + 80;
      
      // Calculate hours based on average call duration (5-8 minutes)
      const avgCallMinutes = 6.5;
      const totalMinutes = totalCalls * avgCallMinutes;
      const totalHours = parseFloat((totalMinutes / 60).toFixed(1));
      
      // Calculate incoming/outgoing distribution (60/40 split is common)
      const incomingRatio = 0.6; // 60% incoming calls
      const incomingCalls = Math.floor(totalCalls * incomingRatio);
      const outgoingCalls = totalCalls - incomingCalls;
      
    setCallData({
        totalCalls,
        totalHours,
        incomingCalls,
        outgoingCalls,
      });
    } else {
      // Set default values if no employeeData
    setCallData({
        totalCalls: 100,
        totalHours: 10.8,
        incomingCalls: 60,
        outgoingCalls: 40
      });
    }
  }, [employeeData, username]);

  // Initialize edited employee data when actual data changes
  useEffect(() => {
    if (employeeData) {
      setEditedEmployeeData({...employeeData});
    }
  }, [employeeData]);

  // Handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode without saving
      setIsEditMode(false);
      setEditedEmployeeData({...employeeData});
      setProfileImage(null);
    } else {
      // Entering edit mode
      setIsEditMode(true);
    }
  };

  // Save employee data to localStorage
  const saveEmployeeData = async () => {
    if (!username) {
      console.error("Cannot save data: No username provided");
      
      // Use a default username
      const defaultUsername = "default_user";
      console.log("Using default username:", defaultUsername);
      
      // Proceed with saving anyway
      try {
        // Prepare employee data with profile image URL
        const dataToSave = {
          ...editedEmployeeData,
          username: defaultUsername,
          profileImageUrl: profileImage || editedEmployeeData?.profileImageUrl,
          lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem(`employee_${defaultUsername}`, JSON.stringify(dataToSave));
        
        // Update state
        setEmployeeData(dataToSave);
        setIsEditMode(false);
        
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: 'Employee info saved',
          icon: 'success',
          confirmButtonText: 'OK',
          background: '#000',
          color: '#fff',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error saving employee data:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save employee information',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#000',
          color: '#fff'
        });
      }
      return;
    }
    
    try {
      // Prepare employee data with profile image URL
      const dataToSave = {
        ...editedEmployeeData,
        username,
        profileImageUrl: profileImage || editedEmployeeData?.profileImageUrl,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`employee_${username}`, JSON.stringify(dataToSave));
      
      // Update state
      setEmployeeData(dataToSave);
      setIsEditMode(false);
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Employee info saved',
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#000',
        color: '#fff',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error saving employee data:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save employee information',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#000',
        color: '#fff'
      });
    }
  };

  const chartData = {
    labels: ['Incoming', 'Outgoing'],
    datasets: [
      {
        label: 'Number of Calls',
        data: [callData.incomingCalls, callData.outgoingCalls],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Incoming', 'Outgoing'],
    datasets: [
      {
        data: [callData.incomingCalls, callData.outgoingCalls],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
      },
    ],
  };

  // Enhanced distribution chart for more insightful data
  const distributionChartData = {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
    datasets: [
      {
        label: 'Calls by Time of Day',
        data: [Math.floor(callData.totalCalls * 0.3), Math.floor(callData.totalCalls * 0.4), Math.floor(callData.totalCalls * 0.2), Math.floor(callData.totalCalls * 0.1)],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animations
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        color: 'white'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  // Function to handle navigation changes
  const handleNavChange = (index) => {
    const views = ['overview', 'about', 'settings', 'advanced'];
    
    // Add a subtle dark transition effect
    const overlay = document.querySelector('.transition-overlay');
    if (overlay) {
      overlay.style.backgroundColor = '#000000';
      overlay.style.opacity = '0.5';
      
      // Change the view after a short delay
      setTimeout(() => {
        setActiveView(views[index]);
        setSelectedCard(null);
        setIsAnimating(true);
        
        // Fade out the overlay
        overlay.style.opacity = '0';
      }, 100);
    }
  };

  // Function to handle advanced analytics
  const handleAdvancedAnalytics = () => {
    navigate('/advanced_analytics', { 
      state: { 
        username, 
        employeeData,
        fromDashboard: true
      } 
    });
  };

  // Navigation items for GooeyNav
  const navItems = [
    { 
      label: "Overview", 
      href: "#", 
      onClick: () => {
        setActiveView('overview');
        setSelectedCard(null);
        setIsAnimating(true);
      }
    },
    { 
      label: "About", 
      href: "#", 
      onClick: () => {
        setActiveView('about');
        setSelectedCard(null);
        setIsAnimating(true);
      }
    },
    { 
      label: "Settings", 
      href: "#", 
      onClick: () => {
        setActiveView('settings');
        setSelectedCard(null);
        setIsAnimating(true);
      }
    },
    { 
      label: "Advanced Analytics", 
      href: "#", 
      onClick: handleAdvancedAnalytics
    }
  ];

  // Function to handle card click
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsAnimating(true);
    
    // Animate the selected card
    const selectedCardElement = document.querySelector(`.card[data-card="${card}"]`);
    if (selectedCardElement) {
      gsap.to(selectedCardElement, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    // Animate other cards
    const otherCards = document.querySelectorAll(`.card:not([data-card="${card}"])`);
    if (otherCards.length > 0) {
      gsap.to(otherCards, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    navigate('/Emp');
  };

  // Animation timeout - Removed to keep glowing continuous
  useEffect(() => {
    // Only set animation to true when it's false, never turn it off automatically
    if (!isAnimating) {
      setIsAnimating(true);
    }
  }, [isAnimating, activeView]);

  // Fix GSAP reference issues by ensuring elements exist before animating
  useEffect(() => {
    // Create transition overlay if it doesn't exist
    let transitionOverlay = document.querySelector('.transition-overlay');
    if (!transitionOverlay) {
      transitionOverlay = document.createElement('div');
      transitionOverlay.className = 'transition-overlay';
      document.body.appendChild(transitionOverlay);
    }

    // Add event listener for advanced analytics transition
    if (transitionOverlay) {
      const handleTransitionEnd = () => {
        if (document.body.classList.contains('page-transition')) {
          document.body.classList.remove('page-transition');
        }
      };

      transitionOverlay.addEventListener('transitionend', handleTransitionEnd);

      return () => {
        // Clean up listeners
        if (transitionOverlay) {
          transitionOverlay.removeEventListener('transitionend', handleTransitionEnd);
        }
      };
    }
  }, []);

  // Add this useEffect to handle background reset when component mounts
  useEffect(() => {
    // Reset background color
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";
    
    // Remove any transition classes
    document.body.classList.remove('page-transition');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('page-transition');
    };
  }, []);

  // Add this useEffect to handle location state changes
  useEffect(() => {
    if (location.state?.fromAdvancedAnalytics) {
      // If coming from Advanced Analytics, ensure smooth transition
      const overlay = document.querySelector('.transition-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.opacity = '0';
        }, 500);
      }
    }
  }, [location]);

  // Add this new function for dynamic data generation
  const generateDynamicData = (baseValue, amplitude, frequency) => {
    const now = Date.now();
    return Array(7).fill().map((_, i) => {
      return baseValue + amplitude * Math.sin((now / 1000 + i) * frequency);
    });
  };

  // Update the getChartDataForCard function
  const getChartDataForCard = (cardType, isHovered, isSelected) => {
    const now = Date.now();
    const animationSpeed = isSelected ? 2 : (isHovered ? 1.5 : 1);
    
    const generateDynamicData = (baseValue, amplitude, frequency) => {
      return Array(7).fill().map((_, i) => {
        const timeOffset = now / 1000 + i;
        const primaryWave = Math.sin(timeOffset * frequency);
        const secondaryWave = Math.cos(timeOffset * frequency * 0.5);
        return baseValue + amplitude * (primaryWave + secondaryWave * 0.5);
      });
    };

    switch(cardType) {
      case 'totalCalls':
        return {
          labels: Array(7).fill(''),
          datasets: [{
            label: 'Total Calls',
            data: generateDynamicData(45, isSelected ? 20 : (isHovered ? 15 : 10), animationSpeed * 0.5),
            backgroundColor: 'rgba(106, 17, 203, 0.3)',
            borderColor: 'rgba(106, 17, 203, 1)',
            borderWidth: isHovered ? 3 : 2,
            tension: 0.4,
            fill: true,
            pointRadius: isHovered ? 3 : 0
          }]
        };
      case 'totalHours':
        return {
          labels: Array(7).fill(''),
          datasets: [{
            label: 'Hours',
            data: generateDynamicData(4, isSelected ? 2 : (isHovered ? 1.5 : 1), animationSpeed * 0.3),
            backgroundColor: 'rgba(37, 117, 252, 0.3)',
            borderColor: 'rgba(37, 117, 252, 1)',
            borderWidth: isHovered ? 3 : 2,
            tension: 0.4,
            fill: true,
            pointRadius: isHovered ? 3 : 0
          }]
        };
      case 'incomingCalls':
        return {
          labels: ['Account Services', 'Loan Inquiries', 'Card Services', 'Fraud Reports', 'Other'],
          datasets: [{
            data: [35, 25, 20, 15, 5].map(v => v + (isSelected ? Math.sin(now / 300) * 10 : 
              (isHovered ? Math.sin(now / 500) * 8 : Math.sin(now / 1000) * 5))),
            backgroundColor: [
              'rgba(42, 190, 150, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: isHovered ? 2 : 1,
            rotation: isSelected ? (now / 30) % 360 : (isHovered ? (now / 50) % 360 : (now / 100) % 360)
          }]
        };
      case 'outgoingCalls':
        return {
          labels: ['Follow-up', 'Loan Processing', 'Account Updates', 'Security Alerts', 'Other'],
          datasets: [{
            data: [35, 30, 20, 10, 5].map(v => v + (isSelected ? Math.cos(now / 300) * 10 : 
              (isHovered ? Math.cos(now / 500) * 8 : Math.cos(now / 1000) * 5))),
            backgroundColor: [
              'rgba(231, 85, 186, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: isHovered ? 2 : 1,
            rotation: isSelected ? -(now / 30) % 360 : (isHovered ? -(now / 50) % 360 : -(now / 100) % 360)
          }]
        };
      default:
        return null;
    }
  };

  // Update the chart options
  const getChartOptions = (isSelected) => ({
    ...animatedChartOptions,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    transitions: {
      active: {
        animation: {
          duration: 300
        }
      }
    },
    plugins: {
      ...animatedChartOptions.plugins,
      tooltip: { 
        enabled: isSelected 
      }
    },
    elements: {
      line: {
        tension: isSelected ? 0.6 : 0.4
      },
      point: {
        radius: isSelected ? 4 : 0,
        hoverRadius: isSelected ? 6 : 0
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  });

  // Card insights data - now dynamically linked to callData
  const getCardInsight = (cardType) => {
    switch(cardType) {
      case 'totalCalls':
        return `${Math.floor(callData.totalCalls * 0.12)} more calls than last week`;
      case 'totalHours':
        const avgDailyHours = (callData.totalHours / 7).toFixed(1);
        return `Average ${avgDailyHours} hrs per day`;
      case 'incomingCalls':
        return `${Math.round(callData.incomingCalls * 0.35)} account service inquiries`;
      case 'outgoingCalls':
        return `${Math.round(callData.outgoingCalls * 0.35)} loan processing calls`;
      default:
        return "";
    }
  };

  // Initialize particles with useCallback to prevent unnecessary re-renders
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: "#000000"
    },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "canvas",
      events: {
        onClick: {
          enable: true,
          mode: "push"
        },
        onHover: {
          enable: true,
          mode: "repulse"
        },
        resize: true
      },
      modes: {
        push: {
          quantity: 4
        },
        repulse: {
          distance: 200,
          duration: 0.4
        }
      }
    },
    particles: {
      color: {
        value: "#ffffff"
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce"
        },
        random: false,
        speed: 1,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 80
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 5 }
      }
    },
    detectRetina: true
  };

  // Add this new useEffect for chart animation
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCallData(prev => ({...prev})); // This will trigger a re-render with new animated data
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(animationInterval);
  }, []);

  const handleRecordingUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an MP3
    if (!file.type.includes('audio/mp3') && !file.name.toLowerCase().endsWith('.mp3')) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Please upload an MP3 file',
        icon: 'error',
        background: '#000',
        color: '#fff'
      });
      return;
    }

    try {
      // Create a URL for the audio file
      const audioUrl = URL.createObjectURL(file);
      
      // Navigate to the playback page with the audio file
      navigate('/play-recording', {
        state: {
          audioFile: audioUrl,
          fileName: file.name,
          username: username,
          employeeData: employeeData
        }
      });
    } catch (error) {
      console.error('Error handling audio file:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to process the audio file. Please try again.',
        icon: 'error',
        background: '#000',
        color: '#fff'
      });
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    if (editedEmployeeData) {
      setEditedEmployeeData({
        ...editedEmployeeData,
        profileImageUrl: null
      });
    }
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    // For now, we'll just show the success message
    Swal.fire({
      title: 'Success!',
      text: 'Settings saved successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      background: '#000',
      color: '#fff',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  return (
    <div className="dashboard-container">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
      />
      
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="row justify-content-center mt-4 mb-4">
          <div className="col-12 text-center">
            <h2 className="display-5 text-white mb-2 card-content" style={{ fontFamily: 'Impact, sans-serif' }}>
              <Typewriter text="Callytics AI" speed={150} />
              {employeeData && (
                <div className="mt-2">
                  <small className="text-purple fs-6 card-content" style={{ color: '#6a11cb', opacity: 0.9 }}>
                    {employeeData.phone && `Phone: ${employeeData.phone}`} {employeeData.gender && `| Gender: ${employeeData.gender}`}
                  </small>
                </div>
              )}
            </h2>
          </div>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-12 d-flex justify-content-center">
            <div style={{ minWidth: '400px', position: 'relative' }}>
              <GooeyNav
                items={navItems}
                animationTime={600}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={75}
                colors={[1, 1, 1, 1, 1, 1, 1, 1]}
                timeVariance={300}
                initialActiveIndex={navItems.findIndex(item => item.label.toLowerCase() === activeView || 
                  (item.label === 'Advanced Analytics' && activeView === 'advanced'))}
              />
            </div>
              <button 
              className="btn btn-danger btn-sm ms-5 px-3 py-2 align-self-center"
              onClick={handleLogout}
            >
            Logout
          </button>
          </div>
        </div>

        {activeView === 'overview' && (
          <>
            <div className="row justify-content-center">
              <div className="col-12">
                <div className="row justify-content-center g-4">
              {['totalCalls', 'totalHours', 'incomingCalls', 'outgoingCalls'].map((card) => (
                    <div key={card} className="col-md-3">
                <div 
                        className={`card bg-transparent text-white text-center h-100 ${selectedCard === card ? 'selected-card' : ''}`}
                        data-card={card}
                  style={{ 
                          ...cardStyle,
                          transform: `${selectedCard === card ? 'translateY(-10px) scale(1.02)' : 
                            (hoveredCard === card ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)')}`,
                          boxShadow: hoveredCard === card ? '0 8px 32px rgba(255, 255, 255, 0.1)' : cardStyle.boxShadow,
                          transition: 'all 0.3s ease-in-out',
                          cursor: 'pointer'
                  }} 
                  onClick={() => handleCardClick(card)}
                        onMouseEnter={() => setHoveredCard(card)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="card-body d-flex flex-column justify-content-between py-3 card-content">
                          <h3 className="card-title fs-5 mb-0" style={{ fontFamily: 'Georgia, serif', opacity: 0.95 }}>
                            {card.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="card-text display-6 mt-0 mb-2" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {callData[card]}{card === 'totalHours' ? ' hrs' : ''}
                          </p>
                        </div>
                      </div>
                </div>
              ))}
            </div>
              </div>
            </div>

            {/* Card Insights Section */}
            {selectedCard && (
              <div className="row justify-content-center mt-4">
                <div className="col-12">
                  <div className="card bg-transparent text-white" style={{
                    ...cardStyle,
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease-in-out'
                  }}>
                    <div className="card-body">
                      <h4 className="card-title mb-4">Insights for {selectedCard.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                      
                      {/* Total Calls Insights */}
                      {selectedCard === 'totalCalls' && (
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row g-3">
                              <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Daily Target</h6>
                                    <div className="d-flex align-items-center">
                                      <h3 className="card-title mb-0 me-2 text-white">{Math.round((callData.totalCalls / 120) * 100)}%</h3>
                                      <div className="flex-grow-1">
                                        <div className="progress bg-dark" style={{ height: '4px' }}>
                                          <div 
                                            className="progress-bar" 
                                            style={{
                                              width: `${(callData.totalCalls / 120) * 100}%`,
                                              background: 'linear-gradient(45deg, #6a11cb, #2575fc)'
                                            }}
                                          ></div>
                      </div>
                      </div>
                    </div>
                    </div>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Peak Hours</h6>
                                    <div className="d-flex align-items-center">
                                      <h4 className="card-title mb-0 text-white">10:00 AM - 2:00 PM</h4>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Call Types</h6>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Support</span>
                                        <span className="text-white">{Math.round(callData.totalCalls * 0.4)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-primary" 
                                          style={{ width: '40%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Technical</span>
                                        <span className="text-white">{Math.round(callData.totalCalls * 0.3)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-warning" 
                                          style={{ width: '30%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-white">✓ General</span>
                                        <span className="text-white">{Math.round(callData.totalCalls * 0.3)} calls</span>
                                      </div>
                                      <div className="progress bg-dark" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-info" 
                                          style={{ width: '30%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="chart-container" style={{ height: '300px' }}>
                              <Line 
                                data={{
                                  labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                                  datasets: [{
                                    label: 'Hourly Call Volume',
                                    data: [
                                      Math.round(callData.totalCalls * 0.1),
                                      Math.round(callData.totalCalls * 0.25),
                                      Math.round(callData.totalCalls * 0.3),
                                      Math.round(callData.totalCalls * 0.2),
                                      Math.round(callData.totalCalls * 0.1),
                                      Math.round(callData.totalCalls * 0.05)
                                    ],
                                    borderColor: '#6a11cb',
                                    backgroundColor: 'rgba(106, 17, 203, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false
                                    },
                                    title: {
                                      display: true,
                                      text: 'Daily Call Distribution',
                                      color: 'white'
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                      },
                                      ticks: {
                                        color: 'white'
                                      }
                                    },
                                    x: {
                                      grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                      },
                                      ticks: {
                                        color: 'white'
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                </div>
              </div>
            )}

                      {/* Total Hours Insights */}
                        {selectedCard === 'totalHours' && (
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row g-3">
                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Weekly Target</h6>
                                    <div className="d-flex align-items-center">
                                      <h3 className="card-title mb-0 me-2 text-white">{Math.round((callData.totalHours / 40) * 100)}%</h3>
                                      <div className="flex-grow-1">
                                        <div className="progress bg-dark" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{
                                              width: `${(callData.totalHours / 40) * 100}%`,
                                              background: 'linear-gradient(45deg, #6a11cb, #2575fc)'
                                  }}
                                          ></div>
                                </div>
                              </div>
                            </div>
                                  </div>
                                </div>
                              </div>

                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Time Distribution</h6>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Active Calls</span>
                                        <span className="text-white">{Math.round(callData.totalHours * 0.7)} hrs</span>
                              </div>
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Breaks</span>
                                        <span className="text-white">{Math.round(callData.totalHours * 0.15)} hrs</span>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Training</span>
                                        <span className="text-white">{Math.round(callData.totalHours * 0.1)} hrs</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Efficiency</h6>
                                    <h4 className="card-title mb-0 text-white">{Math.round(callData.totalCalls / callData.totalHours)} calls/hr</h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="chart-container" style={{ height: '300px' }}>
                              <Bar 
                                data={{
                                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                  datasets: [
                                    {
                                      label: 'Active Calls',
                                      data: [
                                        Math.round(callData.totalHours * 0.65),
                                        Math.round(callData.totalHours * 0.72),
                                        Math.round(callData.totalHours * 0.68),
                                        Math.round(callData.totalHours * 0.75),
                                        Math.round(callData.totalHours * 0.7),
                                        Math.round(callData.totalHours * 0.5),
                                        Math.round(callData.totalHours * 0.3)
                                      ],
                                      backgroundColor: 'rgba(37, 117, 252, 0.7)',
                                      borderColor: 'rgba(37, 117, 252, 1)',
                                      borderWidth: 1
                                    },
                                    {
                                      label: 'Breaks',
                                      data: [
                                        Math.round(callData.totalHours * 0.12),
                                        Math.round(callData.totalHours * 0.15),
                                        Math.round(callData.totalHours * 0.18),
                                        Math.round(callData.totalHours * 0.1),
                                        Math.round(callData.totalHours * 0.13),
                                        Math.round(callData.totalHours * 0.2),
                                        Math.round(callData.totalHours * 0.25)
                                      ],
                                      backgroundColor: 'rgba(255, 193, 7, 0.7)',
                                      borderColor: 'rgba(255, 193, 7, 1)',
                                      borderWidth: 1
                                    },
                                    {
                                      label: 'Training',
                                      data: [
                                        Math.round(callData.totalHours * 0.08),
                                        Math.round(callData.totalHours * 0.05),
                                        Math.round(callData.totalHours * 0.07),
                                        Math.round(callData.totalHours * 0.1),
                                        Math.round(callData.totalHours * 0.12),
                                        Math.round(callData.totalHours * 0.15),
                                        Math.round(callData.totalHours * 0.2)
                                      ],
                                      backgroundColor: 'rgba(23, 162, 184, 0.7)',
                                      borderColor: 'rgba(23, 162, 184, 1)',
                                      borderWidth: 1
                                    },
                                    {
                                      label: 'Admin Tasks',
                                      data: [
                                        Math.round(callData.totalHours * 0.15),
                                        Math.round(callData.totalHours * 0.08),
                                        Math.round(callData.totalHours * 0.07),
                                        Math.round(callData.totalHours * 0.05),
                                        Math.round(callData.totalHours * 0.05),
                                        Math.round(callData.totalHours * 0.15),
                                        Math.round(callData.totalHours * 0.25)
                                      ],
                                      backgroundColor: 'rgba(40, 167, 69, 0.7)',
                                      borderColor: 'rgba(40, 167, 69, 1)',
                                      borderWidth: 1
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: {
                                        color: 'white',
                                        padding: 20
                                      }
                                    },
                                    title: {
                                      display: true,
                                      text: 'Weekly Time Distribution',
                                      color: 'white'
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                      },
                                      ticks: {
                                        color: 'white'
                                      }
                                    },
                                    x: {
                                      grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                      },
                                      ticks: {
                                        color: 'white'
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
          </div>
        )}

                      {/* Incoming Calls Insights */}
                        {selectedCard === 'incomingCalls' && (
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row g-3">
                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Resolution Rate</h6>
                                    <div className="d-flex align-items-center">
                                      <h3 className="card-title mb-0 me-2 text-white">85%</h3>
                                      <div className="flex-grow-1">
                                        <div className="progress bg-dark" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{
                                              width: '85%',
                                              background: 'linear-gradient(45deg, #6a11cb, #2575fc)'
                                  }}
                                          ></div>
                                </div>
                              </div>
                            </div>
                                  </div>
                                </div>
                              </div>

                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Call Categories</h6>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Technical Support</span>
                                        <span className="text-white">{Math.round(callData.incomingCalls * 0.4)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-primary" 
                                          style={{ width: '40%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Product Inquiries</span>
                                        <span className="text-white">{Math.round(callData.incomingCalls * 0.3)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-warning" 
                                          style={{ width: '30%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Service Issues</span>
                                        <span className="text-white">{Math.round(callData.incomingCalls * 0.2)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-info" 
                                          style={{ width: '20%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-white">✓ Other</span>
                                        <span className="text-white">{Math.round(callData.incomingCalls * 0.1)} calls</span>
                                      </div>
                                      <div className="progress bg-dark" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-success" 
                                          style={{ width: '10%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="chart-container" style={{ height: '300px' }}>
                              <Doughnut 
                                data={{
                                  labels: ['Technical Support', 'Product Inquiries', 'Service Issues', 'Other'],
                                  datasets: [{
                                    data: [
                                      Math.round(callData.incomingCalls * 0.4),
                                      Math.round(callData.incomingCalls * 0.3),
                                      Math.round(callData.incomingCalls * 0.2),
                                      Math.round(callData.incomingCalls * 0.1)
                                    ],
                                    backgroundColor: [
                                      'rgba(106, 17, 203, 0.7)',
                                      'rgba(37, 117, 252, 0.7)',
                                      'rgba(255, 99, 132, 0.7)',
                                      'rgba(75, 192, 192, 0.7)'
                                    ],
                                    borderWidth: 1
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'right',
                                      labels: {
                                        color: 'white',
                                        padding: 20
                                      }
                                    },
                                    title: {
                                      display: true,
                                      text: 'Incoming Call Categories',
                                      color: 'white'
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Outgoing Calls Insights */}
                        {selectedCard === 'outgoingCalls' && (
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row g-3">
                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Success Rate</h6>
                                    <div className="d-flex align-items-center">
                                      <h3 className="card-title mb-0 me-2 text-white">75%</h3>
                                      <div className="flex-grow-1">
                                        <div className="progress bg-dark" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{
                                              width: '75%',
                                              background: 'linear-gradient(45deg, #6a11cb, #2575fc)'
                                  }}
                                          ></div>
                                </div>
                              </div>
                            </div>
                                  </div>
                                </div>
                              </div>

                            <div className="col-12">
                                <div className="card bg-dark bg-opacity-50 border-0">
                                  <div className="card-body p-3">
                                    <h6 className="card-subtitle mb-2 text-white">Call Categories</h6>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Follow-up Calls</span>
                                        <span className="text-white">{Math.round(callData.outgoingCalls * 0.45)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-primary" 
                                          style={{ width: '45%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Issue Resolution</span>
                                        <span className="text-white">{Math.round(callData.outgoingCalls * 0.25)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-warning" 
                                          style={{ width: '25%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-white">✓ Customer Updates</span>
                                        <span className="text-white">{Math.round(callData.outgoingCalls * 0.2)} calls</span>
                                      </div>
                                      <div className="progress bg-dark mb-2" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-info" 
                                          style={{ width: '20%' }}
                                        ></div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-white">✓ Escalations</span>
                                        <span className="text-white">{Math.round(callData.outgoingCalls * 0.1)} calls</span>
                                      </div>
                                      <div className="progress bg-dark" style={{ height: '4px' }}>
                                        <div 
                                          className="progress-bar bg-success" 
                                          style={{ width: '10%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="chart-container" style={{ height: '300px' }}>
                              <Pie 
                                data={{
                                  labels: ['Follow-up Calls', 'Issue Resolution', 'Customer Updates', 'Escalations'],
                                  datasets: [{
                                    data: [
                                      Math.round(callData.outgoingCalls * 0.45),
                                      Math.round(callData.outgoingCalls * 0.25),
                                      Math.round(callData.outgoingCalls * 0.2),
                                      Math.round(callData.outgoingCalls * 0.1)
                                    ],
                                    backgroundColor: [
                                      'rgba(106, 17, 203, 0.7)',
                                      'rgba(37, 117, 252, 0.7)',
                                      'rgba(255, 99, 132, 0.7)',
                                      'rgba(75, 192, 192, 0.7)'
                                    ],
                                    borderWidth: 1
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'right',
                                      labels: {
                                        color: 'white',
                                        padding: 20
                                      }
                                    },
                                    title: {
                                      display: true,
                                      text: 'Outgoing Call Categories',
                                      color: 'white'
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === 'about' && (
          <div className="row justify-content-center">
            <div className="col-12 text-center mb-4">
              <h2 className="fs-3 text-white mb-2 card-content" style={{ fontFamily: 'Georgia, serif', opacity: 0.95 }}>About Employee</h2>
              <p className="text-white fs-6 card-content" style={{ opacity: 0.85 }}>Detailed information about the employee.</p>
                </div>
            
            <div className="col-md-8">
              <div className="card bg-transparent text-white" style={cardStyle}>
                <div className="card-body card-content">
                  <div className="d-flex justify-content-end mb-3">
                    <button 
                      className="btn btn-primary"
                      onClick={toggleEditMode}
                    >
                      Edit Profile
                    </button>
              </div>
                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <div 
                        className="employee-avatar mb-3" 
                        style={{
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: isEditMode ? 'pointer' : 'default'
                        }}
                        onClick={isEditMode ? () => document.getElementById('profileImageInput').click() : undefined}
                        onMouseEnter={() => setShowRemoveButton(true)}
                        onMouseLeave={() => setShowRemoveButton(false)}
                      >
                        {profileImage ? (
                          <>
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }} 
                            />
                            {isEditMode && showRemoveButton && (
                              <div 
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexDirection: 'column',
                                  gap: '10px'
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveProfileImage();
                                  }}
                                  style={{
                                    background: 'rgba(255, 0, 0, 0.8)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  Remove Photo
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ fontSize: '3rem', color: 'white' }}>
                            {username ? username.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                        {isEditMode && !profileImage && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7
                          }}>
                            <span className="text-white">Click to upload</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id="profileImageInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <h3 className="fs-4 mb-2">{employeeData?.fullName || username}</h3>
                      <p className="text-white">{employeeData?.role || 'Employee'}</p>
                    </div>
                    
                    <div className="col-md-8">
                      {!isEditMode ? (
                        <>
                          <h4 className="fs-5 mb-3">Personal Information</h4>
                          <div className="row mb-3">
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Full Name</p>
                              <p className="mb-3 text-light">{employeeData?.fullName || username}</p>
                            </div>
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Gender</p>
                              <p className="mb-3 text-light">{employeeData?.gender || 'Not specified'}</p>
                            </div>
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Phone</p>
                              <p className="mb-3 text-light">{employeeData?.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <h4 className="fs-5 mb-3">Work Information</h4>
                          <div className="row mb-3">
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Department</p>
                              <p className="mb-3 text-light">{employeeData?.department || 'Not specified'}</p>
                            </div>
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Position</p>
                              <p className="mb-3 text-light">{employeeData?.position || 'Not specified'}</p>
                            </div>
                          </div>
                          
                          <h4 className="fs-5 mb-3">Performance</h4>
                          <div className="row">
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Employee ID</p>
                              <p className="mb-3 text-light">{employeeData?.employeeId || 'Not assigned'}</p>
                            </div>
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Join Date</p>
                              <p className="mb-3 text-light">{employeeData?.joinDate || 'Not specified'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="d-flex justify-content-end mb-3">
                            <button 
                              className="btn btn-success me-2"
                              onClick={saveEmployeeData}
                            >
                              Save Changes
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={toggleEditMode}
                            >
                              Cancel
                            </button>
                          </div>
                          <h4 className="fs-5 mb-3">Personal Information</h4>
                          <div className="row mb-3">
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Full Name</p>
                              <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="fullName"
                                value={editedEmployeeData?.fullName || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Gender</p>
                              <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="gender"
                                value={editedEmployeeData?.gender || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="col-sm-4">
                              <p className="mb-1 text-white fw-bold">Phone</p>
                              <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="phone"
                                value={editedEmployeeData?.phone || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          <h4 className="fs-5 mb-3">Work Information</h4>
                          <div className="row mb-3">
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Department</p>
                              <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="department"
                                value={editedEmployeeData?.department || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="col-sm-6">
                              <p className="mb-1 text-white fw-bold">Position</p>
                              <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="position"
                                value={editedEmployeeData?.position || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="row justify-content-center">
            <div className="col-12 text-center mb-4">
              <h2 className="fs-3 text-white mb-2" style={{ fontFamily: 'Georgia, serif', opacity: 0.95 }}>Banking Operations Settings</h2>
              <p className="text-white fs-6" style={{ opacity: 0.85 }}>Manage banking operations and employee performance metrics.</p>
            </div>

            <div className="col-md-10">
              <div className="card bg-transparent text-white" style={cardStyle}>
                <div className="card-body">
                  <div className="row">
                    {/* System Settings */}
                    <div className="col-md-6 mb-4">
                      <h4 className="fs-5 mb-3">System Settings</h4>
                      <div className="settings-group">
                        <div className="form-check form-switch mb-3">
                          <input className="form-check-input" type="checkbox" id="autoSave" defaultChecked />
                          <label className="form-check-label" htmlFor="autoSave">Auto-save Changes</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input className="form-check-input" type="checkbox" id="notifications" defaultChecked />
                          <label className="form-check-label" htmlFor="notifications">Enable Notifications</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input className="form-check-input" type="checkbox" id="complianceMode" defaultChecked />
                          <label className="form-check-label" htmlFor="complianceMode">Compliance Mode</label>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="col-md-6 mb-4">
                      <h4 className="fs-5 mb-3">Performance Metrics</h4>
                      <div className="settings-group">
                        <div className="mb-3">
                          <label className="form-label">Minimum Call Duration (minutes)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="5" min="1" max="60" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Target Resolution Rate (%)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="85" min="0" max="100" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Compliance Check Rate (%)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="100" min="0" max="100" />
                        </div>
                      </div>
                    </div>

                    {/* Employee Management */}
                    <div className="col-md-6 mb-4">
                      <h4 className="fs-5 mb-3">Employee Management</h4>
                      <div className="settings-group">
                        <div className="mb-3">
                          <label className="form-label">Default Break Duration (minutes)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="15" min="5" max="60" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Maximum Consecutive Calls</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="10" min="1" max="20" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Required Training Hours (monthly)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="4" min="0" max="20" />
                        </div>
                      </div>
                    </div>

                    {/* Quality Assurance */}
                    <div className="col-md-6 mb-4">
                      <h4 className="fs-5 mb-3">Quality Assurance</h4>
                      <div className="settings-group">
                        <div className="mb-3">
                          <label className="form-label">QA Score Threshold (%)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="80" min="0" max="100" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Minimum Customer Satisfaction Score</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="4" min="1" max="5" step="0.1" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Compliance Documentation Rate (%)</label>
                          <input type="number" className="form-control bg-dark text-white" defaultValue="100" min="0" max="100" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12 text-center">
                      <button 
                        className="btn btn-primary me-2"
                        onClick={handleSaveSettings}
                      >
                        Save Changes
                      </button>
                      <button className="btn btn-secondary">Reset to Defaults</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'advanced' && (
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <h2 className="fs-3 text-white mb-2" style={{ fontFamily: 'Georgia, serif', opacity: 0.95 }}>Advanced Analytics</h2>
              <p className="text-white fs-6" style={{ opacity: 0.85 }}>Explore detailed data analytics and insights.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#000',
    zIndex: 1,
    willChange: 'auto'
  },
  threadsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    opacity: 0.4,
  },
  card: {
    backdropFilter: 'blur(5px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  '@keyframes glow': {
    '0%': {
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5)',
    },
    '50%': {
      boxShadow: '0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.7)',
    },
    '100%': {
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5)',
    },
  },
};

export default Dashboard;