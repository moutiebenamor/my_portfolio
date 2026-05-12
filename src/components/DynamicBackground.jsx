import { useState, useEffect } from 'react';

const DynamicBackground = ({ active = true, section = 'projects' }) => {
  const [timeOfDay, setTimeOfDay] = useState('afternoon'); // Default fallback
  const [currentTime, setCurrentTime] = useState(new Date());

  // Time-based color schemes
  const timeSchemes = {
    dawn: {
      name: 'Dawn',
      hours: [5, 6, 7],
      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
      particleColor: '#FFE66D'
    },
    morning: {
      name: 'Morning',
      hours: [8, 9, 10, 11],
      background: 'linear-gradient(135deg, #87CEEB 0%, #98D8C8 50%, #F7DC6F 100%)',
      particleColor: '#87CEEB'
    },
    afternoon: {
      name: 'Afternoon',
      hours: [12, 13, 14, 15, 16],
      background: 'linear-gradient(135deg, #3498DB 0%, #2ECC71 50%, #F39C12 100%)',
      particleColor: '#3498DB'
    },
    evening: {
      name: 'Evening',
      hours: [17, 18, 19],
      background: 'linear-gradient(135deg, #E74C3C 0%, #9B59B6 50%, #3498DB 100%)',
      particleColor: '#E74C3C'
    },
    night: {
      name: 'Night',
      hours: [20, 21, 22, 23, 0, 1, 2, 3, 4],
      background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      particleColor: '#FFFFFF'
    }
  };

  // Section-specific overlays
  const sectionOverlays = {
    projects: {
      gradient: 'radial-gradient(circle at 30% 40%, rgba(74, 158, 255, 0.2) 0%, transparent 50%)',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)'
    },
    skills: {
      gradient: 'radial-gradient(circle at 70% 60%, rgba(191, 0, 255, 0.2) 0%, transparent 50%)',
      pattern: 'repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)'
    },
    contact: {
      gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 170, 0.2) 0%, transparent 50%)',
      pattern: 'repeating-linear-gradient(135deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)'
    }
  };

  // Determine time of day
  const getTimeOfDay = (date) => {
    const hour = date.getHours();
    
    for (const [key, scheme] of Object.entries(timeSchemes)) {
      if (scheme.hours.includes(hour)) {
        return key;
      }
    }
    return 'night';
  };

  useEffect(() => {
    if (!active) return;
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setTimeOfDay(getTimeOfDay(now));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const scheme = timeSchemes[timeOfDay] || timeSchemes.afternoon; // Fallback
  const overlay = sectionOverlays[section] || sectionOverlays.projects; // Fallback

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      {/* CSS Gradient Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: scheme.background,
        transition: 'background 2s ease-in-out'
      }} />
      
      {/* Static Stars for Night Time */}
      {timeOfDay === 'night' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 30% 80%, white, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent)
          `,
          backgroundSize: '200% 200%',
          opacity: 0.6,
          animation: 'twinkle 3s ease-in-out infinite'
        }} />
      )}
      
      {/* Section-specific Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: overlay.gradient,
        mixBlendMode: 'screen',
        opacity: 0.8,
        transition: 'all 1s ease-in-out'
      }} />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: overlay.pattern,
        opacity: 0.4,
        transition: 'all 1s ease-in-out'
      }} />
      
      {/* Time Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: 'monospace',
        fontSize: '10px',
        letterSpacing: '0.2em',
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        zIndex: 10,
        transition: 'color 1s ease-in-out'
      }}>
        <div>{scheme.name}</div>
        <div style={{ fontSize: '8px', marginTop: '2px' }}>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* CSS Animation for Twinkling Stars */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DynamicBackground;
