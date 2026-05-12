import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, MeshDistortMaterial, Sphere, Box, Icosahedron, Torus, useCursor } from '@react-three/drei';
import * as THREE from 'three';

// Animated geometric shapes
function FloatingShape({ position, color, shape = 'box', speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  const shapes = {
    box: <Box ref={meshRef} args={[0.5, 0.5, 0.5]} position={position} />,
    sphere: <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position} />,
    icosahedron: <Icosahedron ref={meshRef} args={[0.35, 0]} position={position} />,
    torus: <Torus ref={meshRef} args={[0.25, 0.1, 16, 32]} position={position} />,
  };

  return (
    <Float floatIntensity={2} rotationIntensity={0.5}>
      {shapes[shape]}
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Float>
  );
}

// Central hero object
function HeroObject() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group>
      <Icosahedron ref={meshRef} args={[1, 1]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.5}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </Icosahedron>
      <Icosahedron args={[1.3, 1]}>
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.1}
        />
      </Icosahedron>
    </group>
  );
}

// Particle system
function Particles() {
  const particlesRef = useRef();
  const count = 500;
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.3 + 0.2;
      colors[i * 3 + 2] = Math.random() * 0.5 + 0.5;
    }
    
    if (particlesRef.current) {
      particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Text
function HeroText() {
  return (
    <Text
      position={[0, 2.5, 0]}
      fontSize={0.8}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
    >
      BEN AMOR MOUTIE
    </Text>
  );
}

// 3D Button component
function ModeButton({ position, label, color, onClick, hovered }) {
  const meshRef = useRef();
  const [hoveredLocal, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Float floatIntensity={1} rotationIntensity={0.3}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Icosahedron args={[0.8, 0]} />
          <MeshDistortMaterial
            color={hovered ? color : `${color}88`}
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={hovered ? 0.9 : 0.6}
          />
        </mesh>
      </Float>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color={hovered ? color : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
      >
        {label}
      </Text>
    </group>
  );
}

// Scene component
function Scene() {
  const { mouse } = useThree();
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={0.5} />
      
      <Particles />
      <HeroObject />
      
      <FloatingShape position={[-3, 1.5, -2]} color="#06b6d4" shape="sphere" speed={0.8} />
      <FloatingShape position={[3, -1.5, -1.5]} color="#f472b6" shape="torus" speed={1.2} />
      <FloatingShape position={[-2.5, -2, 1.5]} color="#34d399" shape="icosahedron" speed={0.6} />
      <FloatingShape position={[2.5, 2, -2.5]} color="#fbbf24" shape="box" speed={1} />
      <FloatingShape position={[0, -2.5, 2]} color="#a78bfa" shape="sphere" speed={0.9} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main Landing3D component
export default function Landing3D({ onSelect }) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000308' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Scene />
      </Canvas>
      
      {/* Overlay UI */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{
          textAlign: 'center',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          pointerEvents: 'auto',
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 96px)',
            fontFamily: "'Georgia', serif",
            fontWeight: 400,
            color: '#fff',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Ben Amor Moutie
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 'clamp(14px, 2vw, 18px)',
            letterSpacing: '0.2em',
            marginBottom: '72px',
          }}>
            UI/UX DESIGNER & WEB DEVELOPER
          </p>

          <p style={{
            color: 'rgba(244, 65, 223, 0.79)',
            fontSize: '20px',
            marginBottom: '48px',
            letterSpacing: '0.1em',
          }}>
            How do you want to see me?
          </p>

          {/* Mode Selection Buttons */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button
              onClick={() => onSelect('logical')}
              style={{
                background: 'rgba(74, 158, 255, 0.2)',
                border: '1px solid rgba(74, 158, 255, 0.5)',
                color: '#4a9eff',
                padding: '16px 32px',
                fontSize: '14px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(74, 158, 255, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(74, 158, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logical Mode
            </button>
            <button
              onClick={() => onSelect('creative')}
              style={{
                background: 'rgba(191, 0, 255, 0.2)',
                border: '1px solid rgba(191, 0, 255, 0.5)',
                color: '#bf00ff',
                padding: '16px 32px',
                fontSize: '14px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(191, 0, 255, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(191, 0, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Creative Mode
            </button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '12px',
        letterSpacing: '0.2em',
        zIndex: 10,
      }}>
        Drag to rotate · Scroll to explore
      </div>

      
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        color: 'rgba(244, 65, 223, 0.79)',
        fontSize: '14px',
        letterSpacing: '0.1em',
        zIndex: 10,
      }}>
        Web Developer
      </div>
    </div>
  );
}
