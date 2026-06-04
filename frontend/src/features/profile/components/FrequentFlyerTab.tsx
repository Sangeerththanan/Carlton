import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Award, Trash2, Plane, Loader2 } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { FrequentFlyerProgram } from '../types/profile';
import { AddFrequentFlyerModal } from './AddFrequentFlyerModal';
import { useToast } from '../../../contexts/ToastContext';

export const FrequentFlyerTab: React.FC = () => {
  const [programs, setPrograms] = useState<FrequentFlyerProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getFrequentFlyerPrograms();
      setPrograms(data);
    } catch (error) {
      showError('Failed to load loyalty programs.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this program?')) {
      try {
        await profileService.deleteFrequentFlyerProgram(id);
        showSuccess('Program removed successfully.');
        setPrograms(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        showError('Failed to remove program.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">Frequent Flyer Programs</h3>
          <p className="text-xs text-gray-500">Manage your airline memberships for effortless point tracking.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-full hover:bg-blue-800 transition-all shadow-md flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <Plus size={14} />
          Add Program
        </button>
      </div>

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {programs.map(program => (
            <div 
              key={program.id}
              className="bg-white/80 backdrop-blur-sm border border-blue-50 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all group relative animate-in fade-in zoom-in-95 duration-300"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(program.id)}
                  className="p-1.5 text-red-100 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors bg-red-500/10"
                  title="Remove Program"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-all duration-500">
                  <Award size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-900 transition-colors">{program.airlineName}</h4>
                    {program.statusLevel && (
                       <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full font-bold uppercase tracking-tight">
                         {program.statusLevel}
                       </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 italic mb-1">{program.programName}</p>
                  
                  <div className="flex items-center gap-1.5">
                    <Plane size={10} className="text-blue-300" />
                    <span className="text-[10px] font-mono font-medium text-gray-600 tracking-wider">
                      {program.membershipNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-white/50 rounded-2xl border border-dashed border-blue-200">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-50 rounded-full text-blue-200">
               <Award size={20} />
            </div>
          </div>
          <h4 className="text-xs font-bold text-gray-400 italic">No programs added yet</h4>
          <p className="text-gray-400 text-[10px] mt-1">
            Click 'Add Program' to include your membership details.
          </p>
        </div>
      )}

      <AddFrequentFlyerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPrograms}
      />
    </div>
  );
};
