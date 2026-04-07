import React from 'react';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Hero />
      <Features />
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Carlton Airport Management System</h3>
            <p className="mt-2 text-sm text-gray-400">
              © 2024 Carlton Airport. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
