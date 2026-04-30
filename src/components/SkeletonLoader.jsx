import { useState, useEffect } from 'react';

const SkeletonLoader = ({ type = 'card', count = 1, isLoading }) => {
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setShimmer(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const renderSkeleton = () => {
    switch (type) {
      case 'project':
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${shimmer - 100}%`,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.5s ease-out'
            }} />
            
            {/* Project Title */}
            <div style={{
              height: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              marginBottom: '16px',
              width: '60%'
            }} />
            
            {/* Project Description */}
            <div style={{
              height: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              marginBottom: '8px',
              width: '90%'
            }} />
            <div style={{
              height: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              marginBottom: '16px',
              width: '80%'
            }} />
            
            {/* Tags */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    width: '80px'
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'skill':
        return (
          <div style={{
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${shimmer - 100}%`,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.5s ease-out'
            }} />
            
            {/* Skill Name */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                height: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                width: '120px'
              }} />
              <div style={{
                height: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                width: '40px'
              }} />
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '2px'
            }} />
          </div>
        );

      case 'text':
        return (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${shimmer - 100}%`,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.5s ease-out'
            }} />
            
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: i === 0 ? '90%' : i === 1 ? '75%' : '60%'
                }}
              />
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div style={{
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${shimmer - 100}%`,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.5s ease-out'
            }} />
            
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }} />
          </div>
        );

      default:
        return (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            height: '100px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${shimmer - 100}%`,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.5s ease-out'
            }} />
          </div>
        );
    }
  };

  return (
    <div>
      {[...Array(count)].map((_, index) => (
        <div key={index} style={{ marginBottom: index < count - 1 ? '16px' : '0' }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
