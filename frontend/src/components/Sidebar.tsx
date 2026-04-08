import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navigationConfig, type NavItem } from '../config/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, userRole = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: NavItem[] = navigationConfig[userRole] || navigationConfig.admin;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div className={`bg-white text-gray-900 h-full flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900 hover:text-white transition-colors duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
