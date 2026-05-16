import React from 'react';

export const Footer = () => {
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes flow-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <footer className="relative bg-[#050505] text-white min-h-screen py-32 md:py-48 z-20 pointer-events-auto border-t border-violet-500/20 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background neural glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" style={{ animation: 'pulse-glow 6s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" style={{ animation: 'pulse-glow 8s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-fuchsia-500/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Abstract SVG Neural Net Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <path d="M0 250 Q 250 100 500 250 T 1000 250" fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <path d="M0 350 Q 300 400 500 200 T 1000 150" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <path d="M0 150 Q 200 50 500 300 T 1000 350" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="250" cy="180" r="4" fill="#8b5cf6" />
          <circle cx="500" cy="250" r="6" fill="#06b6d4" />
          <circle cx="750" cy="300" r="4" fill="#f59e0b" />
          <circle cx="300" cy="330" r="5" fill="#f43f5e" />
          <circle cx="700" cy="190" r="5" fill="#10b981" />
        </svg>

        <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center justify-center text-center">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400">Synaptic Link Ready</span>
            <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_#a78bfa] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-[90px] font-light tracking-tighter uppercase leading-[1.1] mb-2">
            Expand Your <br/>
            <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #f59e0b)' }}>
              Architecture
            </span>
          </h2>
          
          <p className="mt-6 mb-16 text-white/50 font-mono text-xs md:text-sm uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
            Initialize connection to the neural network and join the early access program for advanced cognitive optimization protocols.
          </p>

          <form 
            onSubmit={(e) => { e.preventDefault(); alert('Neural Connection Established'); }} 
            className="relative w-full max-w-md group"
          >
            {/* Animated glowing border for the form */}
            <div 
              className="absolute -inset-[2px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"
              style={{ 
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #f59e0b, #8b5cf6)',
                backgroundSize: '200% 100%',
                animation: 'flow-border 4s linear infinite'
              }}
            />
            
            <div className="relative flex flex-col sm:flex-row bg-[#0a0a0a] rounded-full overflow-hidden border border-white/10 group-hover:border-transparent transition-colors duration-300">
              <input 
                type="email" 
                required 
                placeholder="ENTER NEURAL ID (EMAIL)" 
                className="flex-1 bg-transparent px-8 py-5 outline-none font-mono text-[11px] tracking-widest placeholder:text-white/20 text-white"
              />
              <button 
                type="submit" 
                className="relative px-8 py-5 font-mono text-[11px] tracking-widest uppercase transition-all duration-300 overflow-hidden"
              >
                {/* Button background gradient */}
                <div className="absolute inset-0 opacity-80 hover:opacity-100 transition-opacity duration-300" 
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                />
                <span className="relative z-10 text-white font-semibold">
                  Initialize
                </span>
              </button>
            </div>
          </form>
        </div>

        <div className="absolute bottom-8 w-full text-center flex flex-col items-center gap-2">
          <div className="flex gap-4 mb-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-white/20" />
            ))}
          </div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">
            © 2026 COGNITIVE SYSTEMS // NEURAL ARCHITECTURE DESIGNED FOR IMPACT
          </div>
        </div>
      </footer>
    </>
  );
};
