import { useState, useEffect, useRef } from 'react';

const PageTransition = ({ isActive, fromSection, toSection, children }) => {
  const [phase, setPhase] = useState('idle');
  const [morphPath, setMorphPath] = useState('');
  const svgRef = useRef(null);

  // Morph paths for different transitions
  const morphPaths = {
    'projects-to-skills': 'M0,0 Q50,100 100,0 T200,0 Q250,100 300,0 T400,0 Q450,100 500,0 T600,0 Q650,100 700,0 T800,0 Q900,100 1000,0 L1000,1000 Q800,900 600,1000 T400,1000 Q200,900 0,1000 Z',
    'skills-to-contact': 'M0,500 Q200,300 400,500 T800,500 Q900,600 1000,500 L1000,1000 Q800,800 600,1000 T200,1000 Q100,800 0,1000 Z',
    'contact-to-projects': 'M0,0 Q300,200 600,0 T1200,0 L1200,1000 Q900,800 600,1000 T0,1000 Z',
    'default': 'M0,0 Q250,200 500,0 T1000,0 L1000,1000 Q750,800 500,1000 T0,1000 Z'
  };

  const transitionKey = `${fromSection}-to-${toSection}`;
  const currentPath = morphPaths[transitionKey] || morphPaths.default;

  useEffect(() => {
    if (isActive) {
      setPhase('expanding');
      setMorphPath(currentPath);
      
      // Phase 1: Expand
      setTimeout(() => setPhase('holding'), 800);
      
      // Phase 2: Hold
      setTimeout(() => setPhase('contracting'), 1200);
      
      // Phase 3: Contract
      setTimeout(() => setPhase('complete'), 2000);
      
      // Reset
      setTimeout(() => {
        setPhase('idle');
        setMorphPath('');
      }, 2500);
    }
  }, [isActive, transitionKey, currentPath]);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      pointerEvents: 'none',
      opacity: phase === 'idle' ? 0 : 1,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      {/* SVG Mask Container */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Animated Morph Path */}
          <path
            id="morph-path"
            d={morphPath}
            fill="none"
            stroke="none"
          />
          
          {/* Liquid Gradient */}
          <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.8">
              <animate
                attributeName="stop-color"
                values="#4a9eff;#bf00ff;#00ffaa;#4a9eff"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#bf00ff" stopOpacity="0.6">
              <animate
                attributeName="stop-color"
                values="#bf00ff;#00ffaa;#4a9eff;#bf00ff"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#00ffaa" stopOpacity="0.4">
              <animate
                attributeName="stop-color"
                values="#00ffaa;#4a9eff;#bf00ff;#00ffaa"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          {/* Noise Texture */}
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              seed="5"
            />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
          
          {/* Glow Effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Morphing Shape */}
        <path
          d={morphPath}
          fill="url(#liquid-gradient)"
          filter="url(#glow)"
          style={{
            animation: phase === 'expanding' ? 'morphExpand 0.8s ease-out forwards' :
                     phase === 'holding' ? 'morphHold 0.4s ease-in-out forwards' :
                     phase === 'contracting' ? 'morphContract 0.8s ease-in forwards' : 'none',
            transformOrigin: 'center'
          }}
        />
        
        {/* Particles during transition */}
        {phase === 'expanding' || phase === 'holding' ? (
          <g>
            {[...Array(20)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 1000}
                cy={Math.random() * 1000}
                r={Math.random() * 3 + 1}
                fill="#ffffff"
                opacity={Math.random() * 0.6 + 0.4}
                style={{
                  animation: `floatParticle ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </g>
        ) : null}
      </svg>
      
      {/* Overlay Content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'holding' ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontSize: 'clamp(24px, 5vw, 64px)',
          fontFamily: 'monospace',
          letterSpacing: '0.3em',
          color: '#ffffff',
          textTransform: 'uppercase',
          textAlign: 'center',
          filter: 'url(#glow)',
          animation: phase === 'holding' ? 'pulseText 0.6s ease-in-out infinite' : 'none'
        }}>
          {toSection}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes morphExpand {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        @keyframes morphHold {
          0%, 100% {
            transform: scale(1) rotate(360deg);
          }
          50% {
            transform: scale(1.05) rotate(370deg);
          }
        }
        
        @keyframes morphContract {
          0% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
          50% {
            transform: scale(0.8) rotate(450deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0) rotate(540deg);
            opacity: 0;
          }
        }
        
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
          }
        }
        
        @keyframes pulseText {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;
