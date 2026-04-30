import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Torus, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 3D Object Component with Scroll Interaction
function ScrollObject({ 
  type = 'box', 
  position = [0, 0, 0], 
  scrollProgress = 0,
  color = '#8b5cf6',
  scale = 1,
  rotationSpeed = 1,
  floatIntensity = 0.5 
}) {
  const meshRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      // Scroll-based rotation
      const scrollRotation = scrollProgress * Math.PI * 2;
      
      // Base rotation animation
      const time = state.clock.elapsedTime;
      const baseRotationX = time * 0.2 * rotationSpeed;
      const baseRotationY = time * 0.3 * rotationSpeed;
      
      // Combine rotations
      meshRef.current.rotation.x = baseRotationX + scrollRotation;
      meshRef.current.rotation.y = baseRotationY + scrollRotation * 0.5;
      
      // Scroll-based position animation
      const floatY = Math.sin(time + scrollRotation) * floatIntensity;
      const scrollY = scrollProgress * 2 - 1; // -1 to 1 range
      meshRef.current.position.y = position[1] + floatY + scrollY * 0.5;
      
      // Scale based on scroll
      const scrollScale = 1 + Math.sin(scrollProgress * Math.PI) * 0.3;
      meshRef.current.scale.setScalar(scale * scrollScale);
      
      // Color intensity based on scroll
      const intensity = 0.5 + scrollProgress * 0.5;
      if (meshRef.current.material) {
        meshRef.current.material.emissive = new THREE.Color(color).multiplyScalar(intensity);
      }
    }
  });

  const shapes = {
    box: <Box ref={meshRef} args={[1, 1, 1]} position={position} />,
    sphere: <Sphere ref={meshRef} args={[0.7, 32, 32]} position={position} />,
    torus: <Torus ref={meshRef} args={[0.6, 0.2, 16, 32]} position={position} />,
    icosahedron: <Icosahedron ref={meshRef} args={[0.8, 0]} position={position} />,
  };

  return (
    <group>
      {shapes[type]}
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </group>
  );
}

// Particle System for Background
function ScrollParticles({ scrollProgress = 0 }) {
  const particlesRef = useRef();
  const count = 100;

  useEffect(() => {
    if (!particlesRef.current) return;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = new THREE.Color();
      color.setHSL((scrollProgress + i / count) % 1, 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [scrollProgress]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05 + scrollProgress;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main Scene Component
function Scroll3DScene({ scrollProgress, section }) {
  // Section-specific configurations
  const sceneConfigs = {
    projects: {
      objects: [
        { type: 'icosahedron', position: [-2, 1, 0], color: '#4a9eff', scale: 1.2, rotationSpeed: 1 },
        { type: 'torus', position: [2, -1, 1], color: '#00d4ff', scale: 0.8, rotationSpeed: 0.8 },
        { type: 'sphere', position: [0, 2, -1], color: '#0099ff', scale: 1, rotationSpeed: 1.2 },
      ],
      backgroundColor: '#0a0a1a',
      fogColor: '#1a1a3a'
    },
    skills: {
      objects: [
        { type: 'box', position: [-1.5, 0.5, 0], color: '#bf00ff', scale: 1, rotationSpeed: 1.5 },
        { type: 'icosahedron', position: [1.5, -0.5, 1], color: '#ff00ff', scale: 1.3, rotationSpeed: 0.7 },
        { type: 'torus', position: [0, 1.5, -1], color: '#ff66ff', scale: 0.9, rotationSpeed: 1.1 },
      ],
      backgroundColor: '#1a001a',
      fogColor: '#3a003a'
    },
    contact: {
      objects: [
        { type: 'sphere', position: [-1, 1, 0], color: '#00ffaa', scale: 1.1, rotationSpeed: 0.9 },
        { type: 'box', position: [1, -1, 1], color: '#00ff88', scale: 0.9, rotationSpeed: 1.3 },
        { type: 'icosahedron', position: [0, 0, -1], color: '#00ffcc', scale: 1.2, rotationSpeed: 1 },
      ],
      backgroundColor: '#001a0a',
      fogColor: '#003a1a'
    }
  };

  const config = sceneConfigs[section] || sceneConfigs.projects;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color={config.objects[0]?.color || '#ffffff'} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color={config.objects[1]?.color || '#ffffff'} />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={0.5} />
      
      {/* Scroll Particles */}
      <ScrollParticles scrollProgress={scrollProgress} />
      
      {/* 3D Objects */}
      {config.objects.map((obj, index) => (
        <ScrollObject
          key={`${section}-${index}`}
          type={obj.type}
          position={obj.position}
          scrollProgress={scrollProgress}
          color={obj.color}
          scale={obj.scale}
          rotationSpeed={obj.rotationSpeed}
          floatIntensity={0.3 + index * 0.1}
        />
      ))}
      
      {/* Subtle Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// Main Component
const Scroll3D = ({ active = true, section = 'projects', scrollY = 0 }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef();

  useEffect(() => {
    if (!active) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / Math.max(scrollHeight, 1), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scroll3DScene scrollProgress={scrollProgress} section={section} />
      </Canvas>
    </div>
  );
};

export default Scroll3D;
