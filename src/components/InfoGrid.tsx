import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    number: '01',
    title: 'Neuroplasticity',
    subtitle: 'Adaptive Rewiring',
    description: 'The brain\'s remarkable ability to reorganize itself by forming new neural connections throughout life in response to learning, experience, and injury recovery.',
    stat: '100B+',
    statLabel: 'Neurons in the human brain',
    icon: '🧬',
    color: '#8b5cf6',
    colorLight: '#c4b5fd',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    number: '02',
    title: 'Focus Mechanics',
    subtitle: 'Attention Networks',
    description: 'Attention filters incoming stimuli, selecting relevant data for the prefrontal cortex while suppressing background cognitive noise through inhibitory neural circuits.',
    stat: '~8 sec',
    statLabel: 'Average human attention span',
    icon: '⚡',
    color: '#06b6d4',
    colorLight: '#67e8f9',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  {
    number: '03',
    title: 'Memory Retention',
    subtitle: 'Hippocampal Encoding',
    description: 'The transition from short-term holding to long-term storage, dependent on emotional valence, repetition, sleep cycles, and synaptic consolidation processes.',
    stat: '2.5 PB',
    statLabel: 'Estimated memory capacity',
    icon: '💾',
    color: '#f59e0b',
    colorLight: '#fde68a',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    number: '04',
    title: 'Emotional Processing',
    subtitle: 'Amygdala Response',
    description: 'The limbic system processes emotions in milliseconds, triggering fight-or-flight responses before conscious awareness. Emotional memories are stored with higher fidelity.',
    stat: '< 200ms',
    statLabel: 'Fear response time',
    icon: '❤️‍🔥',
    color: '#f43f5e',
    colorLight: '#fda4af',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
  },
  {
    number: '05',
    title: 'Motor Coordination',
    subtitle: 'Cerebellar Precision',
    description: 'The cerebellum fine-tunes motor commands from the cortex, enabling smooth, coordinated movement through predictive error correction and procedural motor learning.',
    stat: '50%+',
    statLabel: 'Brain neurons in cerebellum',
    icon: '🎯',
    color: '#10b981',
    colorLight: '#6ee7b7',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    number: '06',
    title: 'Visual Processing',
    subtitle: 'Occipital Cortex',
    description: 'Raw visual data travels from retina to V1 cortex in under 100ms. The brain constructs 3D reality from 2D retinal images using depth cues, motion parallax, and prior knowledge.',
    stat: '30%+',
    statLabel: 'Cortex devoted to vision',
    icon: '👁️',
    color: '#3b82f6',
    colorLight: '#93c5fd',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
];

export const InfoGrid = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll('.pillar-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(15deg); }
          100% { transform: translateX(200%) rotate(15deg); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <section
        id="info-grid-section"
        ref={sectionRef}
        className="relative z-20 pointer-events-auto overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #050505 0%, #080515 25%, #0c0820 50%, #080515 75%, #050505 100%)' }}
      >
        {/* Ambient background — hidden on mobile for performance */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.04]" style={{ backgroundColor: '#8b5cf6' }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.04]" style={{ backgroundColor: '#06b6d4' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[250px] opacity-[0.03]" style={{ backgroundColor: '#f59e0b' }} />
        </div>

        {/* Top divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(6,182,212,0.3), rgba(245,158,11,0.3), transparent)' }} />

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-28 md:py-40">

          {/* Header */}
          <div className="text-center mb-20 md:mb-28">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-px" style={{ background: 'linear-gradient(to right, transparent, #8b5cf6)' }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-violet-400">Neural Architecture</span>
              <div className="w-12 h-px" style={{ background: 'linear-gradient(to left, transparent, #8b5cf6)' }} />
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter uppercase mb-5">
              <span className="text-white">Cognitive </span>
              <span className="text-transparent bg-clip-text font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #f59e0b, #f43f5e)' }}>
                Pillars
              </span>
            </h2>
            <p className="text-white/35 font-mono text-xs md:text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
              Six foundational systems that define human cognitive capability — from neural rewiring to visual perception
            </p>
          </div>

          {/* Grid */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="pillar-card group relative rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(160deg, ${pillar.color}10, ${pillar.color}05, rgba(10,10,10,0.8))`,
                  border: `1px solid ${pillar.color}18`,
                  willChange: 'transform',
                }}
              >
                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `linear-gradient(160deg, ${pillar.color}15, transparent 60%)` }}
                />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent 30%, ${pillar.color}10 50%, transparent 70%)`,
                      animation: 'shimmer 2s ease-in-out infinite',
                    }}
                  />
                </div>

                <div className="relative z-10 p-7 md:p-9 flex flex-col h-full min-h-[320px] md:min-h-[380px]">
                  {/* Top row: number + icon */}
                  <div className="flex items-start justify-between mb-6">
                    <span
                      className="font-mono text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border transition-colors duration-500"
                      style={{
                        borderColor: `${pillar.color}30`,
                        color: `${pillar.color}90`,
                        backgroundColor: `${pillar.color}08`,
                      }}
                    >
                      {pillar.number}
                    </span>
                    <span
                      className="text-2xl md:text-3xl"
                      style={{ animation: 'floatIcon 3s ease-in-out infinite', animationDelay: `${idx * 0.3}s` }}
                    >
                      {pillar.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl md:text-2xl font-semibold tracking-tight mb-1 transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: '#fff' }}
                  >
                    {pillar.title}
                  </h3>
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider mb-5 block transition-colors duration-500"
                    style={{ color: `${pillar.color}80` }}
                  >
                    {pillar.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-white/45 text-sm leading-relaxed mb-8 flex-grow">
                    {pillar.description}
                  </p>

                  {/* Stat */}
                  <div className="mt-auto">
                    <div
                      className="w-full h-px mb-5 transition-all duration-700 group-hover:opacity-100 opacity-30"
                      style={{ background: `linear-gradient(to right, ${pillar.color}, transparent)` }}
                    />
                    <div className="flex items-end">
                      <div>
                        <div
                          className="text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-500"
                          style={{ color: pillar.color }}
                        >
                          {pillar.stat}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-white/25 mt-0.5">
                          {pillar.statLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.3), rgba(16,185,129,0.3), rgba(59,130,246,0.3), transparent)' }} />
      </section>
    </>
  );
};
