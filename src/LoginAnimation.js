import React, { useEffect, useRef } from 'react';

const LoginAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = 300; // Increased from 150 to 300 particles
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let autoMoveTime = 0; // For auto-movement when mouse is not moving
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e) => {
      // Calculate mouse velocity
      mouseVelocityX = e.clientX - lastMouseX;
      mouseVelocityY = e.clientY - lastMouseY;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      
      // Reset mouse movement flag after a delay
      setTimeout(() => {
        isMouseMoving = false;
      }, 100);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2; // Increased from 0.1 to 0.3 for faster movement
        this.vy = (Math.random() - 0.5) * 0.2; // Increased from 0.1 to 0.3 for faster movement
        this.radius = Math.random() * 3 + 1; // Varied particle sizes
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
        this.originalRadius = this.radius;
        this.connectionDistance = 150; // Decreased from 180 to 150 for fewer but more visible connections
        this.autoMoveSpeed = Math.random() * 0.0005 + 0.0003; // Increased from 0.0002 to 0.0005 for faster auto-movement
        this.autoMovePhase = Math.random() * Math.PI * 2; // Random phase for auto-movement
        this.hasBeenDisturbed = false; // Track if particle has been disturbed by mouse
        this.disturbanceTime = 0; // When the particle was last disturbed
        this.disturbanceDuration = Math.random() * 1000 + 500; // How long the disturbance lasts (500-1500ms)
      }

      update(time) {
        // Check if this particle has been disturbed recently
        if (this.hasBeenDisturbed) {
          // If the disturbance is still active
          if (time - this.disturbanceTime < this.disturbanceDuration) {
            // Continue with the current velocity (particle keeps moving freely)
            // No need to reset to auto-movement
          } else {
            // Disturbance has ended, gradually return to auto-movement
            this.hasBeenDisturbed = false;
          }
        }
        
        // If not disturbed, use auto-movement
        if (!this.hasBeenDisturbed) {
          // Faster sine wave motion
          this.vx = Math.sin(time * this.autoMoveSpeed + this.autoMovePhase) * 0.15; // Increased from 0.05 to 0.15
          this.vy = Math.cos(time * this.autoMoveSpeed + this.autoMovePhase) * 0.15; // Increased from 0.05 to 0.15
        }
        
        // Mouse interaction
        if (isMouseMoving) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            // Calculate angle to mouse
            const angle = Math.atan2(dy, dx);
            const force = (200 - distance) / 200;
            
            // Apply force based on mouse velocity for more natural movement
            const mouseForceX = mouseVelocityX * 0.01;
            const mouseForceY = mouseVelocityY * 0.01;
            
            // Apply both repulsion and mouse velocity influence
            this.vx -= Math.cos(angle) * force * 0.4 + mouseForceX; // Increased from 0.2 to 0.4 for stronger response
            this.vy -= Math.sin(angle) * force * 0.4 + mouseForceY; // Increased from 0.2 to 0.4 for stronger response
            
            // Mark particle as disturbed
            this.hasBeenDisturbed = true;
            this.disturbanceTime = time;
          }
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls with damping
        if (this.x < 0) {
          this.x = 0;
          this.vx = Math.abs(this.vx) * 0.9; // Increased from 0.8 to 0.9 for less damping
        } else if (this.x > canvas.width) {
          this.x = canvas.width;
          this.vx = -Math.abs(this.vx) * 0.9; // Increased from 0.8 to 0.9 for less damping
        }
        
        if (this.y < 0) {
          this.y = 0;
          this.vy = Math.abs(this.vy) * 0.9; // Increased from 0.8 to 0.9 for less damping
        } else if (this.y > canvas.height) {
          this.y = canvas.height;
          this.vy = -Math.abs(this.vy) * 0.9; // Increased from 0.8 to 0.9 for less damping
        }

        // Friction - decreased from 0.995 to 0.99 for faster movement
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Radius pulse - increased from 0.0002 to 0.0005
        this.radius = this.originalRadius + Math.sin(time * 0.0005 + this.x * 0.01) * 0.5;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Draw connections between particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particles[i].connectionDistance) {
            const opacity = (1 - distance / particles[i].connectionDistance) * 0.3; // Increased from 0.25 to 0.3
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      autoMoveTime += 1; // Increment time for auto-movement
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update(autoMoveTime);
        particle.draw();
      });

      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  );
};

export default LoginAnimation; 