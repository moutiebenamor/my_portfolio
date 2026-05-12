import { useState, useEffect } from 'react';

const LoadingScreen = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    if (!isLoading) return;

    // Phase 1: Initial loading
    setPhase('loading');
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Phase 2: Complete
    setTimeout(() => {
      setPhase('complete');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
    }, 2000);

    return () => clearInterval(progressInterval);
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000308',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      {/* Animated Background Particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(74, 158, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(191, 0, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 20%, rgba(0, 255, 170, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)
        `
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '2px',
              height: '2px',
              background: '#ffffff',
              borderRadius: '50%',
              opacity: 0.3,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        zIndex: 10,
        transform: phase === 'complete' ? 'scale(0.8)' : 'scale(1)',
        opacity: phase === 'complete' ? 0 : 1,
        transition: 'all 0.8s ease-out'
      }}>
        {/* Logo/Brand */}
        <div style={{
          fontSize: 'clamp(24px, 4vw, 48px)',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '24px',
          letterSpacing: '0.2em',
          animation: phase === 'loading' ? 'pulse 2s ease-in-out infinite' : 'none'
        }}>
          BEN AMOR MOUTIE
        </div>

        {/* Loading Bar */}
        <div style={{
          width: 'clamp(200px, 40vw, 400px)',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '1px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #4a9eff, #bf00ff, #00ffaa)',
            borderRadius: '1px',
            width: `${Math.min(progress, 100)}%`,
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px rgba(74, 158, 255, 0.5)'
          }} />
        </div>

        {/* Progress Text */}
        <div style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.1em',
          marginBottom: '32px'
        }}>
          {Math.round(progress)}% LOADING
        </div>

        {/* Loading Dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                background: '#bf00ff',
                borderRadius: '50%',
                animation: `bounce 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
