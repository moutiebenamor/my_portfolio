import { useState, useEffect, useRef } from 'react';

// Floating geometric shapes for background
const FloatingShapes = ({ active = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const shapes = containerRef.current.querySelectorAll('.shape');
    
    const animateShapes = () => {
      shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const amplitude = 20 + (index * 5);
        const time = Date.now() * 0.001;
        
        const x = Math.sin(time * speed) * amplitude;
        const y = Math.cos(time * speed * 0.7) * amplitude;
        const rotation = time * speed * 10;
        
        shape.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
      });
      
      requestAnimationFrame(animateShapes);
    };
    
    animateShapes();
  }, [active]);

  if (!active) return null;

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
      overflow: 'hidden'
    }}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="shape"
          style={{
            position: 'absolute',
            width: `${40 + i * 10}px`,
            height: `${40 + i * 10}px`,
            border: `1px solid rgba(0, 0, 0, 0.05)`,
            borderRadius: i % 2 === 0 ? '50%' : '10%',
            left: `${15 + i * 15}%`,
            top: `${10 + i * 12}%`,
            opacity: 0.3 - (i * 0.04),
            transition: 'all 0.3s ease-out'
          }}
        />
      ))}
    </div>
  );
};

// Animated text reveal component
const AnimatedText = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Interactive skill bars with advanced animations
const EnhancedSkillBar = ({ skill, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const categoryColors = {
    'UI/UX': { bg: 'linear-gradient(90deg, #ff6b6b, #feca57)', glow: '#ff6b6b' },
    'Programming': { bg: 'linear-gradient(90deg, #48dbfb, #0abde3)', glow: '#48dbfb' },
    'Marketing': { bg: 'linear-gradient(90deg, #00d2d3, #01a3a4)', glow: '#00d2d3' }
  };

  const colors = categoryColors[skill.cat] || categoryColors.Programming;

  return (
    <div
      ref={barRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        marginBottom: '16px',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
        transition: 'all 0.6s ease-out',
        transitionDelay: `${index * 100}ms`
      }}>
        <span style={{
          fontSize: '14px',
          fontFamily: 'sans-serif',
          fontWeight: isHovered ? '600' : '400',
          transition: 'font-weight 0.3s ease-out'
        }}>
          {skill.name}
        </span>
        <span style={{
          fontSize: '12px',
          color: '#aaa',
          fontFamily: 'monospace',
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease-out'
        }}>
          {skill.level}%
        </span>
      </div>
      <div style={{
        height: '4px',
        background: 'rgba(0,0,0,0.08)',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          background: colors.bg,
          borderRadius: '2px',
          width: isVisible ? `${skill.level}%` : '0%',
          boxShadow: isHovered ? `0 0 12px ${colors.glow}40` : 'none',
          transition: 'box-shadow 0.3s ease-out, width 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms'
        }} />
      </div>
    </div>
  );
};

// Interactive project cards with 3D tilt effect
const InteractiveProjectCard = ({ project, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setTilt({ x: y * 5, y: x * 5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        display: 'grid',
        gridTemplateColumns: '1fr 3fr 2fr',
        gap: '40px',
        alignItems: 'start',
        cursor: 'pointer',
        background: isHovered ? '#f0ede8' : 'transparent',
        margin: '0 -clamp(24px,5vw,80px)',
        transition: 'all 0.3s ease-out',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: project.color,
        opacity: isHovered ? 1 : 0.7,
        transition: 'opacity 0.3s ease-out',
        transform: 'translateZ(20px)'
      }}>
        {index + 1}
      </div>
      <div style={{ transform: 'translateZ(10px)' }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#1a1a1a',
          transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
          transition: 'transform 0.3s ease-out'
        }}>
          {project.title}
        </h3>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#666',
          marginBottom: '16px'
        }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontSize: '11px',
              padding: '4px 12px',
              letterSpacing: '0.1em',
              border: `1px solid ${isHovered ? project.color : 'rgba(0,0,0,0.15)'}`,
              color: isHovered ? project.color : '#888',
              background: isHovered ? `${project.color}10` : 'transparent',
              transition: 'all 0.3s ease-out',
              borderRadius: '16px'
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={{
        textAlign: 'right',
        transform: 'translateZ(15px)',
        opacity: isHovered ? 1 : 0.7,
        transition: 'opacity 0.3s ease-out'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#888',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }}>
          {project.year}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#aaa',
          fontFamily: 'monospace'
        }}>
          {project.type}
        </div>
      </div>
    </div>
  );
};

// Scroll progress indicator
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / Math.max(scrollHeight, 1), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '2px',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.1)'
    }}>
      <div style={{
        height: '100%',
        width: `${scrollProgress * 100}%`,
        background: 'linear-gradient(90deg, #ff6b6b, #48dbfb, #00d2d3)',
        transition: 'width 0.1s ease-out',
        boxShadow: '0 0 8px rgba(72, 219, 251, 0.5)'
      }} />
    </div>
  );
};

export {
  FloatingShapes,
  AnimatedText,
  EnhancedSkillBar,
  InteractiveProjectCard,
  ScrollProgress
};
