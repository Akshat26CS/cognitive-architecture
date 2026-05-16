import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// A stylized geometric brain representation
const StylizedBrain = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Use GSAP to animate this based on scroll
  useGSAP(() => {
    if (!groupRef.current) return;

    // Timeline for the Brain Dive
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#about-section',
        start: 'top bottom', // Start animating when the about section enters the bottom of the viewport
        end: 'bottom top', // End when it leaves the top
        scrub: 2, // Ultra-smooth scrolling inertia
      },
    });

    tl.to(groupRef.current.position, {
      z: 5, // move closer to the camera
      y: 1,
      ease: 'none',
    }, 0)
    .to(groupRef.current.scale, {
      x: 3,
      y: 3,
      z: 3,
      ease: 'none',
    }, 0)
    .to(groupRef.current.rotation, {
      x: Math.PI / 4,
      ease: 'none',
    }, 0);

  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          {/* We use an Icosahedron as a stylized stand-in for the brain */}
          <icosahedronGeometry args={[1.5, 4]} />
          {/* Optimized Glass-like material */}
          <MeshTransmissionMaterial 
            backside={false}
            samples={1}
            resolution={128}
            thickness={2}
            roughness={0.1}
            color="#e0e0e0"
            attenuationDistance={5}
            attenuationColor="#ffffff"
          />
        </mesh>

        {/* Inner core to give depth to the glass */}
        <mesh scale={0.8}>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#334455" roughness={0.8} opacity={0.5} transparent wireframe />
        </mesh>
      </Float>
    </group>
  );
};

export const BrainCanvas = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ willChange: 'transform' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.2]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#a3a3a3" />
        <Environment preset="city" />
        <StylizedBrain />
      </Canvas>
    </div>
  );
};
