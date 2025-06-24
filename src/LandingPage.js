import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Call center images with advantages
  const callCenterImages = [
    {
      url: "https://blog.theconnectioncc.com/hubfs/AdobeStock_208567833.jpeg",
      advantage: "Boost call center efficiency by 45% with AI-powered analytics",
      stats: {
        number: "98%",
        label: "Call Quality"
      }
    },
    {
      url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      advantage: "Real-time monitoring helps reduce average call handling time by 30%",
      stats: {
        number: "45%",
        label: "Efficiency Increase"
      }
    },
    {
      url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      advantage: "Improve customer satisfaction scores with intelligent call routing",
      stats: {
        number: "24/7",
        label: "Monitoring"
      }
    },
    {
      url: "https://th.bing.com/th/id/OIP.md3Mp2-0fRpOcN2hwdA6CQHaEo?rs=1&pid=ImgDetMain",
      advantage: "Reduce operational costs by optimizing agent schedules and workloads",
      stats: {
        number: "35%",
        label: "Cost Reduction"
      }
    },
    {
      url: "https://th.bing.com/th/id/OIP.MosVHgElnuMFcamuzOzVzgHaEK?rs=1&pid=ImgDetMain",
      advantage: "Enhance agent performance with personalized training recommendations",
      stats: {
        number: "50%",
        label: "Performance Boost"
      }
    },
    {
      url: "https://images.ctfassets.net/ukazlt65o6hl/1BalUtkZDLYoeLy0Atl6R1/515ced205ad4bb5186e2f8e47f6f3e72/call-center-skills-for-agent-success-banner.jpeg?w=1920&h=1280&fl=progressive&q=70&fm=jpg",
      advantage: "Increase first-call resolution rates by 35% with advanced analytics",
      stats: {
        number: "35%",
        label: "Resolution Rate"
      }
    },
    {
      url: "https://th.bing.com/th/id/R.534ee646d223c702ab785ba8ad0b74d2?rik=yl36z8EzM3iQWg&riu=http%3a%2f%2fcloudtimes.org%2fwp-content%2fuploads%2f2012%2f07%2fcall-center-cloud.jpeg&ehk=9Vdw6YIrRGJL075Sjp34oPzeLUq33cVaXbtYJvWT2P0%3d&risl=&pid=ImgRaw&r=0",
      advantage: "Cloud-based solution ensures 99.9% uptime and seamless scalability",
      stats: {
        number: "99.9%",
        label: "Uptime"
      }
    }
  ];

  // Rotate through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % callCenterImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setFadeIn(true);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // More complex gradient colors for call center theme
    const colors = [
      [41, 128, 185], // Blue
      [142, 68, 173], // Purple
      [230, 126, 34], // Orange
      [46, 204, 113], // Green
      [52, 152, 219], // Light Blue
      [155, 89, 182], // Light Purple
      [231, 76, 60],  // Red
      [241, 196, 15], // Yellow
      [26, 188, 156], // Teal
      [52, 73, 94]    // Dark Blue
    ];
    
    // Create a grid of points for the background
    const gridSize = 30;
    const points = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        points.push({
          x: (i / gridSize) * width,
          y: (j / gridSize) * height,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    let time = 0;
    const animate = () => {
      time += 0.005;
      
      // Clear canvas with a fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw connecting lines between points
      ctx.lineWidth = 0.5;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = 1 - (distance / 100);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Update and draw points
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Move points
        point.x += point.vx;
        point.y += point.vy;
        
        // Bounce off edges
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        
        // Draw point
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius * 2
        );
        gradient.addColorStop(0, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, 0.8)`);
        gradient.addColorStop(1, `rgba(${point.color[0]}, ${point.color[1]}, ${point.color[2]}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw gradient circles
      for (let i = 0; i < colors.length; i++) {
        const x = width / 2 + Math.cos(time + i * Math.PI / 5) * width / 3;
        const y = height / 2 + Math.sin(time + i * Math.PI / 5) * height / 3;
        const radius = 100 + Math.sin(time * 2 + i) * 30;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, 0.6)`);
        gradient.addColorStop(1, `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const features = [
    {
      title: "Call Analytics",
      description: "Advanced analytics for call center performance tracking and optimization",
      icon: "📊",
      color: "#3498db",
      details: [
        "Real-time call monitoring",
        "Performance metrics tracking",
        "Quality assurance scoring",
        "Trend analysis and reporting"
      ]
    },
    {
      title: "Employee Management",
      description: "Comprehensive employee registration and performance monitoring system",
      icon: "👥",
      color: "#9b59b6",
      details: [
        "Employee onboarding workflow",
        "Skill assessment and training",
        "Performance tracking and feedback",
        "Schedule optimization"
      ]
    },
    {
      title: "Real-time Monitoring",
      description: "Live monitoring of call center operations and agent performance",
      icon: "📈",
      color: "#e67e22",
      details: [
        "Live call monitoring",
        "Agent activity tracking",
        "Queue management",
        "Instant supervisor intervention"
      ]
    },
    {
      title: "Performance Insights",
      description: "Detailed insights and reports for improving call center efficiency",
      icon: "🎯",
      color: "#2ecc71",
      details: [
        "Customizable dashboards",
        "Predictive analytics",
        "ROI measurement",
        "Continuous improvement recommendations"
      ]
    }
  ];

  // Handle manual slide navigation
  const handlePrevSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? callCenterImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % callCenterImages.length
    );
  };

  // Handle touch events for swipe functionality
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNextSlide();
    }
    if (touchEnd - touchStart > 50) {
      // Swipe right
      handlePrevSlide();
    }
  };

  return (
    <div style={styles.container}>
      {/* Complex Background Animation Canvas */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div style={styles.overlay} />

      {/* Content */}
      <div style={{
        ...styles.content,
        opacity: fadeIn ? 1 : 0,
        transform: `translateY(${fadeIn ? '0' : '20px'})`,
      }}>
        <h1 style={styles.title}>
          <span style={styles.callyticsText}>Callytics</span>
          <span style={styles.aiText}> AI</span>
        </h1>
        <p style={styles.subtitle}>Revolutionizing Call Center Operations</p>

        {/* Account Handling Buttons */}
        <div style={styles.accountButtons}>
          <button 
            style={styles.accountButton}
            onClick={() => navigate('/setup-manager')}
          >
            Setup Manager Account
          </button>
        </div>

        {/* Image Carousel - Now first thing below buttons */}
        <div style={styles.imageCarouselSection}>
          <h2 style={styles.sectionTitle}>Our Call Center Solutions</h2>
          <div 
            style={styles.imageCarouselContainer}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {callCenterImages.map((image, index) => (
              <div 
                key={index}
                style={{
                  ...styles.imageCarouselItem,
                  transform: `translateX(${(index - currentImageIndex) * 100}%)`,
                  opacity: Math.abs(index - currentImageIndex) <= 1 ? 1 : 0,
                  zIndex: Math.abs(index - currentImageIndex) === 0 ? 2 : 1,
                }}
              >
                <img
                  src={image.url}
                  alt={`Call Center ${index + 1}`}
                  style={styles.carouselImage}
                />
                <div style={styles.imageOverlay}>
                  <div style={styles.advantageText}>
                    {image.advantage}
                  </div>
                  <div style={styles.statsContainer}>
                    <div style={styles.stat}>
                      <span style={styles.statNumber}>{image.stats.number}</span>
                      <span style={styles.statLabel}>{image.stats.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Navigation arrows */}
            <button 
              style={styles.carouselArrow}
              onClick={handlePrevSlide}
              aria-label="Previous slide"
            >
              &#10094;
            </button>
            <button 
              style={{
                ...styles.carouselArrow,
                right: '10px',
              }}
              onClick={handleNextSlide}
              aria-label="Next slide"
            >
              &#10095;
            </button>
          </div>
          <div style={styles.imageIndicators}>
            {callCenterImages.map((_, index) => (
              <div 
                key={index}
                style={{
                  ...styles.imageIndicator,
                  backgroundColor: currentImageIndex === index ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Features Section - Now below images */}
        <div style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.featuresList}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureCard,
                  transform: activeFeature === index ? 'scale(1.05)' : 'scale(1)',
                  opacity: activeFeature === index ? 1 : 0.7,
                  background: activeFeature === index 
                    ? `linear-gradient(135deg, ${feature.color}33, ${feature.color}11)` 
                    : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: activeFeature === index 
                    ? `0 8px 32px ${feature.color}33` 
                    : '0 4px 16px rgba(0, 0, 0, 0.2)',
                  borderColor: activeFeature === index ? feature.color : 'rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div style={{
                  ...styles.featureIconContainer,
                  backgroundColor: `${feature.color}22`,
                  borderColor: feature.color
                }}>
                  <span style={styles.featureIcon}>{feature.icon}</span>
                </div>
                <h3 style={{
                  ...styles.featureTitle,
                  color: activeFeature === index ? feature.color : '#fff'
                }}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
                
                {activeFeature === index && (
                  <div style={styles.featureDetails}>
                    <ul style={styles.featureList}>
                      {feature.details.map((detail, i) => (
                        <li key={i} style={styles.featureListItem}>
                          <span style={{ color: feature.color }}>✓</span> {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          style={styles.ctaButton}
          onClick={() => navigate('/emp')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(2px)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'all 1s ease',
  },
  title: {
    fontSize: '4rem',
    textAlign: 'center',
    marginBottom: '1rem',
    fontFamily: '"Pixelify Sans", sans-serif',
  },
  callyticsText: {
    color: '#fff',
    fontWeight: 900,
  },
  aiText: {
    color: 'yellow',
    textShadow: '0 0 10px yellow, 0 0 20px yellow, 0 0 30px yellow',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '2rem',
    opacity: 0.8,
  },
  accountButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '3rem',
  },
  accountButton: {
    padding: '0.8rem 2rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    background: 'linear-gradient(45deg, #3498db, #2980b9)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 20px rgba(52, 152, 219, 0.6)',
    },
  },
  imageCarouselSection: {
    marginBottom: '3rem',
  },
  imageCarouselContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  imageCarouselItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'transform 0.5s ease, opacity 0.5s ease',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '2rem',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
  },
  advantageText: {
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  imageIndicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  imageIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  stat: {
    textAlign: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
  },
  statNumber: {
    display: 'block',
    color: '#fff',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(255,255,255,0.5)',
  },
  statLabel: {
    display: 'block',
    color: '#fff',
    opacity: 0.8,
    fontSize: '0.9rem',
    marginTop: '0.3rem',
  },
  featuresSection: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '2rem',
    marginBottom: '2rem',
    textAlign: 'center',
    textShadow: '0 0 10px rgba(255,255,255,0.3)',
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '1.5rem',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    border: '2px solid',
  },
  featureIcon: {
    fontSize: '2rem',
    display: 'block',
  },
  featureTitle: {
    color: '#fff',
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  },
  featureDescription: {
    color: '#fff',
    opacity: 0.8,
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  featureDetails: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureListItem: {
    color: '#fff',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ctaButton: {
    display: 'block',
    margin: '0 auto',
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    background: 'linear-gradient(45deg, #ffcc00, #ff9900)',
    color: '#000',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(255, 204, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 0 30px rgba(255, 204, 0, 0.7)',
    },
  },
  carouselArrow: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.5rem',
    zIndex: 10,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.8)',
    },
  },
};

export default LandingPage; 