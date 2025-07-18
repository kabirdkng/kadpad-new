import React, { useEffect, useRef } from 'react';

const BackgroundEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;
    let isMobile = false;

    // Check if device is mobile
    const checkMobile = () => {
      isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x, y) => ({
      x: x || Math.random() * canvas.width,
      y: y || Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: `rgba(194, 250, 59, ${Math.random() * 0.3 + 0.1})`,
      life: 1,
      decay: Math.random() * 0.02 + 0.005
    });

    const initializeParticles = () => {
      particles = [];
      const particleCount = isMobile ? 30 : 60;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const updateParticles = () => {
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Update life
        particle.life -= particle.decay;

        // Mouse interaction (only on desktop)
        if (!isMobile) {
          const dx = particle.x - mouseX;
          const dy = particle.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.x += (dx / distance) * force * 0.5;
            particle.y += (dy / distance) * force * 0.5;
          }
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(index, 1);
          particles.push(createParticle());
        }
      });
    };

    const drawParticles = () => {
      // Clear canvas with a slight trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(194, 250, 59, ${particle.opacity * particle.life})`;
        ctx.fill();

        // Add a subtle glow effect
        ctx.shadowColor = 'rgba(194, 250, 59, 0.5)';
        ctx.shadowBlur = particle.size * 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections between nearby particles
      drawConnections();
    };

    const drawConnections = () => {
      const maxDistance = isMobile ? 80 : 120;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(194, 250, 59, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      if (!isMobile) {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    };

    const handleClick = (event) => {
      if (!isMobile) {
        // Create burst of particles at click location
        for (let i = 0; i < 5; i++) {
          particles.push(createParticle(event.clientX, event.clientY));
        }
      }
    };

    const debouncedResize = debounce(() => {
      resizeCanvas();
      initializeParticles();
      checkMobile();
    }, 250);

    // Initialize
    checkMobile();
    resizeCanvas();
    initializeParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', debouncedResize);
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: -1,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
      }}
    />
  );
};

// Debounce function to limit the rate of expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default BackgroundEffect;