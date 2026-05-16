import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !phase1Ref.current || !phase2Ref.current) return;

    const sections = [phase1Ref.current, phase2Ref.current];
    
    sections.forEach((text: any) => {
      text.style.willChange = 'transform, opacity';
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      }
    });

    // Animate Phase 1 in
    tl.fromTo(phase1Ref.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
    // Hold Phase 1
    .to(phase1Ref.current, { opacity: 1, duration: 1 })
    // Phase 1 out, Phase 2 in
    .to(phase1Ref.current, { opacity: 0, y: -50, duration: 1 }, "phase2")
    .fromTo(phase2Ref.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 },
      "phase2"
    )
    // Hold Phase 2
    .to(phase2Ref.current, { opacity: 1, duration: 2 })
    // Fade out Phase 2 at the end
    .to(phase2Ref.current, { opacity: 0, y: -50, duration: 1 });

  }, []);

  return (
    <section id="about-section" ref={containerRef} className="relative h-[300vh] pointer-events-auto">
      {/* We make this section very tall so the user has to scroll a lot,
          triggering the 3D 'dive' animation over a long duration. */}
      
      <div className="sticky top-0 h-screen flex flex-col justify-center items-center px-6 md:px-24 pointer-events-none overflow-hidden">
        
        {/* Phase 1 */}
        <div ref={phase1Ref} className="absolute w-full max-w-7xl px-6 md:px-0 opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            <div 
              className="about-text p-8 md:col-start-2 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)'
              }}
            >
              <h2 className="text-sm font-mono uppercase tracking-widest text-cyan-400 mb-4">Phase 01 / Encoding</h2>
              <p className="text-2xl md:text-3xl font-light leading-snug drop-shadow-md">
                Every sensory input is momentarily held in the prefrontal cortex—a delicate network of electrical impulses forming the architecture of your immediate reality.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div ref={phase2Ref} className="absolute w-full max-w-7xl px-6 md:px-0 opacity-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            <div 
              className="about-text p-8 md:col-start-1 rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)'
              }}
            >
              <h2 className="text-sm font-mono uppercase tracking-widest text-violet-400 mb-4">Phase 02 / Retention</h2>
              <p className="text-2xl md:text-3xl font-light leading-snug drop-shadow-md">
                Within a mere 15 to 30 seconds, information is either reinforced through repetition or it effortlessly dissolves, freeing the architecture for new structures.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
