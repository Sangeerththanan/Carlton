import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-900">
      <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Carlton Leisure</h3>
            <p className="text-sm text-gray-400">
              Your trusted partner for unforgettable travel experiences worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-sm text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#help" className="text-sm text-gray-400 hover:text-white transition-colors">Help</a></li>
              <li><a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © 2024 Carlton Leisure. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
