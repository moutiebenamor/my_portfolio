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

// Project detail modal
const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        animation: 'modalFadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#faf9f7',
          borderRadius: '16px',
          padding: 'clamp(24px, 4vw, 48px)',
          maxWidth: '520px',
          width: '90%',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          animation: 'modalSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#aaa',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.06)'; e.target.style.color = '#1a1a1a'; }}
          onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#aaa'; }}
        >
          ✕
        </button>

        {/* Color accent bar */}
        <div style={{
          width: '40px',
          height: '4px',
          borderRadius: '2px',
          background: project.color,
          marginBottom: '24px',
        }} />

        {/* Title */}
        <h3 style={{
          fontSize: 'clamp(22px, 3vw, 28px)',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 8px',
          fontFamily: "'Georgia', serif",
        }}>
          {project.title}
        </h3>

        {/* Type & Year */}
        <div style={{
          fontSize: '13px',
          color: '#999',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          marginBottom: '20px',
        }}>
          {project.type} · {project.year}
        </div>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#555',
          margin: '0 0 24px',
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 300,
        }}>
          {project.desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontSize: '11px',
              padding: '4px 12px',
              letterSpacing: '0.1em',
              border: `1px solid ${project.color}40`,
              color: project.color,
              background: `${project.color}10`,
              borderRadius: '16px',
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* GitHub Link Button */}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#1a1a1a',
              color: '#f8f7f5',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '13px',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              transition: 'all 0.3s ease-out',
              fontFamily: 'sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = project.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${project.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            View on GitHub
          </a>
        )}
      </div>

      {/* Modal animations */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// Interactive project cards with 3D tilt effect
const InteractiveProjectCard = ({ project, index, onProjectClick }) => {
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
      onClick={() => onProjectClick && onProjectClick(project)}
      style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '40px',
        alignItems: 'start',
        cursor: 'pointer',
        background: isHovered ? '#f0ede8' : 'transparent',
        padding: '28px clamp(24px,5vw,80px)',
        transition: 'all 0.3s ease-out',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
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
  ProjectModal,
  ScrollProgress
};
