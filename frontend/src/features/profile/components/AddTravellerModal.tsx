import React, { useState, useEffect } from 'react';
import { User, Calendar, Globe, CreditCard, Plus, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal';
import type { AddSavedTraveller } from '../types/profile';
import { profileService } from '../services/profileService';
import { useToast } from '../../../contexts/ToastContext';

interface AddTravellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTravellerModal: React.FC<AddTravellerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<AddSavedTraveller>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationalityId: undefined,
    passportNumber: '',
    passportCountryId: undefined,
    passportExpiryDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
    }
  }, [isOpen]);

  const fetchLookups = async () => {
    try {
      const data = await profileService.getCountries();
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load lookups', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Parse numeric IDs for nationality and passport country
    if (name === 'nationalityId' || name === 'passportCountryId') {
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
      await profileService.addSavedTraveller(formData);
      showSuccess('Traveller added successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationalityId: undefined,
        passportNumber: '',
        passportCountryId: undefined,
        passportExpiryDate: '',
      });
    } catch (error) {
      showError('Failed to add traveller.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Traveller">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">First Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                <User size={16} />
              </div>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Ex: John"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Ex: Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Nationality</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                <Globe size={16} />
              </div>
              <select
                name="nationalityId"
                required
                value={formData.nationalityId || ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">Select Nationality</option>
                {Array.isArray(countries) && countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Date of Birth</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <Calendar size={16} />
            </div>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-dashed border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-blue-900" />
            <h4 className="font-bold text-blue-900 text-sm">Passport Information</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Passport Number</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Ex: N1234567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Passport Country</label>
              <select
                name="passportCountryId"
                value={formData.passportCountryId || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">Select Country</option>
                {Array.isArray(countries) && countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-1">Expiry Date</label>
              <input
                type="date"
                name="passportExpiryDate"
                value={formData.passportExpiryDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
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
            {isSubmitting ? 'Adding...' : 'Add Traveller'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
