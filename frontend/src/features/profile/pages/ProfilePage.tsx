import React, { useState } from 'react';
import { User, Users, Settings, Award } from 'lucide-react';
import { PersonalDetailsTab } from '../components/PersonalDetailsTab';
import { SavedTravellersTab } from '../components/SavedTravellersTab';
import { PreferencesTab } from '../components/PreferencesTab';
import { FrequentFlyerTab } from '../components/FrequentFlyerTab';

type TabType = 'personal' | 'travellers' | 'preferences' | 'loyalty';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'travellers', label: 'Saved Travellers', icon: Users },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'loyalty', label: 'Loyalty Programs', icon: Award },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal': return <PersonalDetailsTab />;
      case 'travellers': return <SavedTravellersTab />;
      case 'preferences': return <PreferencesTab />;
      case 'loyalty': return <FrequentFlyerTab />;
      default: return <PersonalDetailsTab />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-2">Manage your profile, travel companions, and preferences.</p>
        </div>
      </div>

      {/* Glassmorphism Navigation Bar */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-2 rounded-[2rem] shadow-xl overflow-x-auto no-scrollbar flex items-center gap-2 sticky top-20 z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive 
                  ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-500 hover:bg-blue-50/50 hover:text-blue-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-200' : 'text-blue-400'} />
              {tab.label}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[500px]">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default ProfilePage;
