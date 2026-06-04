import React, { useState, useEffect } from 'react';
import { Plane, Award, Hash, Plus, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal';
import type { AddFrequentFlyer } from '../types/profile';
import { profileService } from '../services/profileService';
import { useToast } from '../../../contexts/ToastContext';

interface AddFrequentFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFrequentFlyerModal: React.FC<AddFrequentFlyerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airlines, setAirlines] = useState<{ id: number; name: string }[]>([]);
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<AddFrequentFlyer>({
    airlineId: undefined,
    programName: '',
    membershipNumber: '',
    statusLevel: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchAirlines();
    }
  }, [isOpen]);

  const fetchAirlines = async () => {
    try {
      const data = await profileService.getAirlines();
      setAirlines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load airlines', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Parse numeric airlineId
    if (name === 'airlineId') {
      const numValue = value ? parseInt(value, 10) : undefined;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await profileService.addFrequentFlyerProgram(formData);
      showSuccess('Loyalty program added successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        airlineId: undefined,
        programName: '',
        membershipNumber: '',
        statusLevel: '',
      });
    } catch (error) {
      showError('Failed to add loyalty program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member Program">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Airline</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <Plane size={16} />
            </div>
            <select
              name="airlineId"
              required
              value={formData.airlineId || ''}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Select Airline</option>
              {Array.isArray(airlines) && airlines.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Program Name</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <Award size={16} />
            </div>
            <input
              type="text"
              name="programName"
              required
              value={formData.programName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:italic"
              placeholder="Ex: FlySmiLes"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Membership Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                <Hash size={16} />
              </div>
              <input
                type="text"
                name="membershipNumber"
                required
                value={formData.membershipNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:italic"
                placeholder="Ex: FS12345678"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Status Level</label>
            <input
              type="text"
              name="statusLevel"
              value={formData.statusLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:italic"
              placeholder="Ex: Gold / Silver"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-500 font-bold text-sm uppercase tracking-widest hover:text-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-blue-900 text-white font-bold text-sm rounded-full shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 uppercase tracking-widest"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {isSubmitting ? 'Adding...' : 'Add Program'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
