import React from 'react';

export const Hero = () => {
  return (
    <section id="hero-section" className="relative min-h-screen flex flex-col justify-center items-center pointer-events-auto">
      <div className="z-10 text-center flex flex-col items-center mt-32">
        <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-[112px] font-semibold tracking-tighter uppercase text-white leading-none mix-blend-difference px-4">
          The Architecture
          <br className="hidden md:block" />
          <span className="text-neural-silver block mt-2 text-3xl sm:text-4xl md:text-7xl lg:text-[96px] font-light italic tracking-tight">of Now</span>
        </h1>
        <p className="mt-6 md:mt-8 text-neutral-400 max-w-xs md:max-w-md text-xs sm:text-sm md:text-base font-mono uppercase tracking-widest leading-relaxed px-4">
          Explore the biological mechanics of short-term memory and cognitive plasticity.
        </p>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center opacity-60 animate-pulse">
        <span className="text-xs uppercase tracking-widest mb-2 font-mono">Scroll to dive</span>
        <div className="w-[1px] h-16 bg-white shrink-0 origin-top"></div>
      </div>
    </section>
  );
};
