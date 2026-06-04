import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Search, Loader2 } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { SavedTraveller } from '../types/profile';
import { TravellerCard } from './TravellerCard';
import { AddTravellerModal } from './AddTravellerModal';
import { useToast } from '../../../contexts/ToastContext';

export const SavedTravellersTab: React.FC = () => {
  const [travellers, setTravellers] = useState<SavedTraveller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchTravellers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getSavedTravellers();
      setTravellers(data);
    } catch (error) {
      showError('Failed to load saved travellers.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTravellers();
  }, [fetchTravellers]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this traveller?')) {
      try {
        await profileService.deleteSavedTraveller(id);
        showSuccess('Traveller removed successfully.');
        setTravellers(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        showError('Failed to remove traveller.');
      }
    }
  };

  const filteredTravellers = travellers.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">Saved Travellers</h3>
          <p className="text-xs text-gray-500">Quickly add friends and family to your bookings.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-full hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-2">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search by name or nationality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs placeholder:italic placeholder:text-gray-300"
        />
      </div>

      {filteredTravellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredTravellers.map(traveller => (
            <TravellerCard
              key={traveller.id}
              traveller={traveller}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-white/50 rounded-2xl border border-dashed border-blue-200">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-50 rounded-full text-blue-200">
               <Users size={20} />
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-400 italic">No travellers found</h4>
          <p className="text-gray-400 text-[10px] mt-1">
            {searchTerm ? "Try a different search term" : "Click 'Add New' to get started!"}
          </p>
        </div>
      )}

      <AddTravellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTravellers}
      />
    </div>
  );
};
