import React from 'react';
import { HardHat } from 'lucide-react';

interface ConstructionPageProps {
  title?: string;
}

export const ConstructionPage: React.FC<ConstructionPageProps> = ({ title = 'Under Construction' }) => {
  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-6">
            <HardHat size={64} className="text-yellow-600" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        
        <p className="text-gray-600 mb-6">
          This page is currently under development. We're working hard to bring you this feature soon.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">What's happening:</span>
            <br />
            Our team is building an amazing experience for you. Stay tuned for updates!
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};
