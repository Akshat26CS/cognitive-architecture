import React from 'react';
import { BrainCanvas } from './components/BrainCanvas';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { MemoryGame } from './components/MemoryGame';
import { InfoGrid } from './components/InfoGrid';
import { BrainDiagramSection } from './components/BrainDiagramSection';
import { Footer } from './components/Footer';
import { DNADivider } from './components/DNADivider';

export default function App() {
  return (
    <div className="relative w-full bg-black min-h-screen text-white">
      {/* 3D Background */}
      <BrainCanvas />
      
      {/* Content wrapper */}
      <main className="relative z-10 w-full">
        <Hero />
        <AboutSection />
        <DNADivider />
        <MemoryGame />
        <InfoGrid />
        <BrainDiagramSection />
        <Footer />
      </main>
    </div>
  );
}

