import React from 'react';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { HolidayPackages } from '../components/HolidayPackages';
import { ValueProposition } from '../components/ValueProposition';
import { About } from '../components/About';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f2f3f5] text-[#23304d]">
      <Navigation />
      <Hero />
      <HolidayPackages />
      <ValueProposition />
      <About />
      <Footer />
    </div>
  );
};
