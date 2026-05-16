import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Html, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Brain Region Data (matching the uploaded anatomy image) ───
interface BrainRegionData {
  id: string;
  title: string;
  color: string;
  position: [number, number, number]; // 3D label position on the brain
  description: string;
  details: string;
  functions: string[];
}

const BRAIN_REGIONS: BrainRegionData[] = [
  {
    // Frontal Lobe: front-upper of brain. Model: Y+=front, Z+=top
    id: 'frontal',
    title: 'Frontal Lobe',
    color: '#f59e0b',
    position: [-0.6, 1.6, 1.8],
    description: 'Executive function, planning, reasoning, and voluntary motor control.',
    details: 'The frontal lobe is the largest of the four major lobes, located at the front of each cerebral hemisphere. It controls voluntary movement via the primary motor cortex, manages higher cognitive functions such as planning, reasoning, judgment, and impulse control. Broca\'s area, responsible for speech production, resides here.',
    functions: ['Decision Making', 'Motor Control', 'Speech Production', 'Working Memory', 'Personality']
  },
  {
    // Parietal Lobe: top-back of brain. Behind central sulcus, upper area
    id: 'parietal',
    title: 'Parietal Lobe',
    color: '#22c55e',
    position: [0.3, -0.3, 2.6],
    description: 'Sensory integration, spatial awareness, and body positioning.',
    details: 'Located behind the central sulcus, the parietal lobe integrates sensory information from various modalities, including touch, temperature, pressure, and pain via the somatosensory cortex. It is essential for spatial orientation, navigation, and proprioception.',
    functions: ['Touch Processing', 'Spatial Orientation', 'Body Awareness', 'Language', 'Math']
  },
  {
    // Temporal Lobe: side-lower, below sylvian fissure, front-middle area
    id: 'temporal',
    title: 'Temporal Lobe',
    color: '#3b82f6',
    position: [-2.2, 0.8, -0.3],
    description: 'Auditory processing, memory formation, and language comprehension.',
    details: 'The temporal lobes are located beneath the lateral fissure. They are crucial for processing auditory information, understanding spoken language (Wernicke\'s area), and memory formation. The hippocampus, located within, is essential for converting short-term to long-term memories.',
    functions: ['Hearing', 'Memory Encoding', 'Language Understanding', 'Emotions', 'Face Recognition']
  },
  {
    // Occipital Lobe: rear of brain (Y- direction), mid-height
    id: 'occipital',
    title: 'Occipital Lobe',
    color: '#14b8a6',
    position: [0.5, -1.8, 1.0],
    description: 'Primary visual cortex — processes all visual information from the eyes.',
    details: 'Located at the rear of the brain, the occipital lobe is the visual processing center. It contains the primary visual cortex (V1), which receives raw visual data from the retinas. It interprets color, motion, depth, and spatial orientation.',
    functions: ['Visual Processing', 'Color Perception', 'Motion Detection', 'Depth Perception', 'Pattern Recognition']
  },
  {
    // Cerebellum: below occipital, back-bottom (Y-, Z-)
    id: 'cerebellum',
    title: 'Cerebellum',
    color: '#e879f9',
    position: [0.6, -1.5, -1.4],
    description: 'Motor coordination, balance, posture, and procedural learning.',
    details: 'The cerebellum contains more than half of all neurons in the brain despite being only 10% of its volume. It fine-tunes voluntary motor movements, coordinates balance and posture, and is critical for motor learning.',
    functions: ['Balance', 'Coordination', 'Motor Learning', 'Posture', 'Timing']
  },
  {
    // Brain Stem: very bottom center, slightly back (Y slightly -, Z very -)
    id: 'brainstem',
    title: 'Brain Stem',
    color: '#fb923c',
    position: [0.3, -0.6, -2.4],
    description: 'Autonomic life-sustaining functions: breathing, heartbeat, consciousness.',
    details: 'The brain stem connects the cerebrum with the spinal cord. It controls essential autonomic functions required for life: breathing, heartbeat, blood pressure, consciousness, and sleep-wake cycles. It includes the midbrain, pons, and medulla oblongata.',
    functions: ['Breathing', 'Heart Rate', 'Sleep Regulation', 'Consciousness', 'Reflexes']
  }
];

// ─── Realistic 3D Brain Mesh ───
const RealBrainModel = ({ onRegionClick, selectedId, isMobile }: { onRegionClick: (r: BrainRegionData) => void; selectedId: string | null; isMobile: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const brainRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, '/brain.obj');
  const texture = useTexture('/brain-texture.jpg');

  // Configure texture
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Clone and apply material — simpler on mobile
  const brainScene = useMemo(() => {
    const cloned = obj.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (isMobile) {
          // Lighter material for mobile — no clearcoat (saves a full rendering pass)
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            color: '#e8c4c4',
            roughness: 0.6,
            metalness: 0.05,
            emissive: '#1a0505',
            emissiveIntensity: 0.15,
          });
        } else {
          child.material = new THREE.MeshPhysicalMaterial({
            map: texture,
            color: '#e8c4c4',
            roughness: 0.55,
            metalness: 0.05,
            clearcoat: 0.3,
            clearcoatRoughness: 0.4,
            emissive: '#1a0505',
            emissiveIntensity: 0.15,
          });
        }
        child.castShadow = !isMobile;
        child.receiveShadow = !isMobile;
      }
    });
    return cloned;
  }, [obj, texture, isMobile]);

  // Center and scale the model
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(brainScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Mobile portrait: much smaller (2.2). Desktop: 5.0
    const scale = (isMobile ? 2.2 : 5) / maxDim;
    
    brainScene.scale.setScalar(scale);
    brainScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [brainScene, isMobile]);

  // Slow idle rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  // Scroll-driven tilt
  useGSAP(() => {
    if (!groupRef.current) return;
    gsap.fromTo(groupRef.current.rotation, { x: -0.1 }, {
      x: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: '#brain-diagram-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      }
    });
  }, []);

  return (
    <group ref={groupRef}>
      <group ref={brainRef}>
        <primitive object={brainScene} />
      </group>

      {/* 3D Labels floating around the brain */}
      {BRAIN_REGIONS.map((region) => (
        <BrainLabel
          key={region.id}
          region={region}
          isActive={selectedId === region.id}
          onClick={() => onRegionClick(region)}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
};

// ─── 3D Label Component ───
const BrainLabel = ({ region, isActive, onClick, isMobile }: { region: BrainRegionData; isActive: boolean; onClick: () => void; isMobile: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;

  useFrame(() => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.25;
      groupRef.current.scale.setScalar(active ? pulse * 1.3 : pulse);
    }
  });

  return (
    <group position={region.position}>
      {/* Invisible clickable sphere (larger hit area) */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[isMobile ? 0.4 : 0.25, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>

      <group ref={groupRef}>
        {/* Outer glow */}
        <mesh renderOrder={998}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial
            color={region.color}
            transparent
            opacity={active ? 0.35 : 0.15}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Core bright dot */}
        <mesh renderOrder={999}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={active ? 1 : 0.9}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Pulsing ring — skip on mobile for perf */}
        {!isMobile && (
          <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={997}>
            <ringGeometry args={[0.2, 0.24, 24]} />
            <meshBasicMaterial
              color={region.color}
              transparent
              opacity={active ? 0.7 : 0.35}
              depthTest={false}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* HTML Label */}
      <Html position={[0.35, 0.15, 0]} zIndexRange={[100, 0]} className="pointer-events-none select-none">
        <div
          className="pointer-events-auto cursor-pointer whitespace-nowrap"
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] rounded-full" style={{ background: `linear-gradient(to right, ${region.color}, transparent)` }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
              style={{
                color: active ? '#ffffff' : '#e2e8f0',
                textShadow: `0 0 12px ${region.color}`,
                backgroundColor: active ? `${region.color}30` : 'rgba(20,20,20,0.6)',
                border: `1px solid ${active ? region.color : 'rgba(255,255,255,0.15)'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s',
              }}
            >
              {region.title}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// ─── Loading Spinner ───
const BrainLoader = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest text-white/60">Loading 3D Brain Model...</span>
    </div>
  </Html>
);

// ─── Detail Panel (Modal) ───
const DetailPanel = ({ region, onClose }: { region: BrainRegionData; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }} onClick={onClose}>
    <div
      className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 scrollbar-hide"
      style={{ 
        background: 'linear-gradient(135deg, rgba(30,30,30,0.85) 0%, rgba(10,10,10,0.95) 100%)', 
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: 'fadeScale 0.35s ease-out' 
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: region.color }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: region.color, boxShadow: `0 0 20px ${region.color}` }} />
            <h3 className="text-xl sm:text-2xl md:text-4xl font-light tracking-tighter uppercase text-white leading-none">{region.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <p className="text-base md:text-lg font-medium mb-5 leading-relaxed" style={{ color: region.color }}>{region.description}</p>
        <div className="w-full h-px bg-gradient-to-r from-white/20 to-transparent mb-5" />
        <p className="font-mono text-xs md:text-sm leading-relaxed md:leading-loose text-white/70 mb-8">{region.details}</p>

        <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-mono">Key Functions</h4>
        <div className="flex flex-wrap gap-2">
          {region.functions.map((fn) => (
            <span key={fn} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: `${region.color}40`, color: region.color, backgroundColor: `${region.color}10` }}>
              {fn}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Section ───
export const BrainDiagramSection = () => {
  const [selectedRegion, setSelectedRegion] = useState<BrainRegionData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = selectedRegion ? 'hidden' : 'visible';
    return () => { document.body.style.overflow = 'visible'; };
  }, [selectedRegion]);

  return (
    <>
      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* On mobile: NO sticky positioning, just a normal section that scrolls naturally */}
      <section id="brain-diagram-section" className={`relative bg-[#050505] z-20 pointer-events-auto border-t border-white/10 ${isMobile ? 'min-h-screen' : 'h-[180vh]'}`}>
        <div className={`${isMobile ? 'relative min-h-screen' : 'sticky top-0 h-screen'} flex flex-col items-center justify-center overflow-hidden`}>

          {/* Ambient background glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-violet-950/10 rounded-full blur-[180px] pointer-events-none" />
          {!isMobile && <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-950/8 rounded-full blur-[140px] pointer-events-none" />}

          {/* Header */}
          <div className="absolute top-12 md:top-16 left-6 md:left-20 z-30 pointer-events-none">
            <p className="text-neural-silver font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3">Interactive 3D Neuroanatomy</p>
            <h2 className="text-3xl md:text-6xl font-light tracking-tighter mb-4 uppercase text-white">
              Human Brain<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 font-semibold drop-shadow-[0_0_15px_rgba(103,232,249,0.4)]">
                Anatomy
              </span>
            </h2>
            <p className="text-neural-silver font-mono text-[10px] md:text-xs max-w-sm leading-relaxed">
              {isMobile ? 'Tap a label to explore. Pinch to zoom.' : 'Drag to rotate the 3D model. Click any labeled region to explore its function.'}
            </p>
          </div>

          {/* 3D Canvas */}
          {/* On mobile: pointer-events-none so ALL touch goes to page scroll. Labels use pointer-events-auto. */}
          <div className={`w-full ${isMobile ? 'h-[65vh]' : 'h-full'} absolute ${isMobile ? 'top-[18vh]' : 'top-0'} left-0`}>
            <Canvas
              camera={{ position: [0, 0.5, isMobile ? 11 : 9], fov: 45 }}
              dpr={1}
              gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
              style={{ touchAction: isMobile ? 'pan-y' : 'none' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 3]} intensity={1.8} color="#ffffff" />
              {!isMobile && <directionalLight position={[-3, -2, -4]} intensity={0.6} color="#67e8f9" />}
              {!isMobile && <pointLight position={[0, 4, 2]} intensity={0.8} color="#a78bfa" />}
              {!isMobile && <pointLight position={[0, -3, -1.5]} intensity={0.5} color="#f472b6" />}

              <Suspense fallback={<BrainLoader />}>
                <Float speed={isMobile ? 0.4 : 0.8} rotationIntensity={isMobile ? 0.05 : 0.1} floatIntensity={isMobile ? 0.1 : 0.3}>
                  <RealBrainModel
                    onRegionClick={setSelectedRegion}
                    selectedId={selectedRegion?.id ?? null}
                    isMobile={isMobile}
                  />
                </Float>
              </Suspense>

              {/* OrbitControls: DISABLED on mobile so scroll works */}
              {!isMobile && (
                <OrbitControls
                  enablePan={false}
                  enableZoom={false}
                  minDistance={5}
                  maxDistance={16}
                  autoRotate={false}
                />
              )}
            </Canvas>
          </div>

          {/* Scroll & Interaction Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 z-20 w-full px-6 text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] mb-3 font-mono text-neural-silver">
              {isMobile ? 'Tap a label to explore · Scroll to continue' : 'Drag to rotate · Click a region'}
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          </div>

          {/* Detail Modal */}
          {selectedRegion && (
            <DetailPanel region={selectedRegion} onClose={() => setSelectedRegion(null)} />
          )}
        </div>
      </section>
    </>
  );
};
