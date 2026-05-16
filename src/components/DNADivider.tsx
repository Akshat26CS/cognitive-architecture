import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const DNADivider = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // We will use CSS animations instead of GSAP for a mathematically perfect infinite helix.
  // CSS variables allow us to set the exact phase offset per rung.

  // Generate fewer rungs for better performance (50 instead of 150)
  const rungs = Array.from({ length: 50 });

  return (
    <div className="relative w-full h-12 md:h-16 overflow-hidden flex items-center justify-center bg-transparent z-50 pointer-events-none" ref={containerRef}>
      <style>{`
        .dna-container {
          perspective: 1000px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2vw;
          width: 100%;
          will-change: transform;
        }
        @media (max-width: 768px) {
          .dna-container {
            gap: 4vw;
          }
        }
        .dna-rung {
          position: relative;
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, #8b5cf6, #06b6d4);
          transform-style: preserve-3d;
          will-change: transform;
        }
        .dna-node {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 10px 2px currentColor;
        }
        .dna-node.top {
          top: -4px;
          background-color: #8b5cf6;
          color: #8b5cf6;
        }
        .dna-node.bottom {
          bottom: -4px;
          background-color: #06b6d4;
          color: #06b6d4;
        }
        @keyframes rotateDNA {
          from { transform: rotateX(var(--start-rot)); }
          to { transform: rotateX(calc(var(--start-rot) + 360deg)); }
        }
        @keyframes pulseNode {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; box-shadow: 0 0 5px 1px currentColor; }
          50% { transform: translateX(-50%) scale(1.4); opacity: 1; box-shadow: 0 0 15px 3px currentColor; }
        }
        .animate-dna {
          animation: rotateDNA 5s linear infinite;
        }
        .animate-pulse-node {
          animation: pulseNode 2.5s ease-in-out infinite;
          animation-delay: var(--pulse-delay);
        }
      `}</style>

      {/* Decorative ambient glow localized to the exact border */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-40 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none blur-[20px]">
        <div className="w-full h-[20px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-violet-500/0" />
      </div>

      <div className="dna-container">
        {rungs.map((_, i) => (
          <div 
            key={i} 
            className="dna-rung animate-dna"
            style={{ 
              ['--start-rot' as string]: `${i * 15}deg`,
              height: '40px',
            } as React.CSSProperties}
          >
            <div className="dna-node top animate-pulse-node" style={{ ['--pulse-delay' as string]: `${i * 0.1}s` } as React.CSSProperties} />
            <div className="dna-node bottom animate-pulse-node" style={{ ['--pulse-delay' as string]: `${i * 0.1}s` } as React.CSSProperties} />
          </div>
        ))}
      </div>
    </div>
  );
};
