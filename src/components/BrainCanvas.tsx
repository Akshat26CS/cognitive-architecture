import React, { useRef, useMemo, useState, useEffect } from 'react';
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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Timeline for the Brain Dive
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });

    tl.to(groupRef.current.position, {
      z: isMobile ? 3 : 5,
      y: isMobile ? 0.5 : 1,
      ease: 'none',
    }, 0)
    .to(groupRef.current.scale, {
      x: isMobile ? 2 : 3,
      y: isMobile ? 2 : 3,
      z: isMobile ? 2 : 3,
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
          <icosahedronGeometry args={[1.5, 4]} />
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

// Lightweight mobile fallback — simple wireframe with no WebGL transmission material
const MobileBrainFallback = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });

  useGSAP(() => {
    if (!groupRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });
    tl.to(groupRef.current.position, { z: 3, y: 0.5, ease: 'none' }, 0)
      .to(groupRef.current.scale, { x: 2, y: 2, z: 2, ease: 'none' }, 0)
      .to(groupRef.current.rotation, { x: Math.PI / 4, ease: 'none' }, 0);
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[1.5, 3]} />
          <meshStandardMaterial
            color="#8b5cf6"
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.25}
            wireframe
          />
        </mesh>
        <mesh scale={0.75}>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.6} transparent opacity={0.15} wireframe />
        </mesh>
      </Float>
    </group>
  );
};

export const BrainCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ willChange: 'transform' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={isMobile ? 1 : [1, 1.2]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        {isMobile ? (
          <MobileBrainFallback />
        ) : (
          <>
            <pointLight position={[-5, -5, -5]} intensity={1} color="#a3a3a3" />
            <Environment preset="city" />
            <StylizedBrain />
          </>
        )}
      </Canvas>
    </div>
  );
};
