import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Globe, Save, Loader2, Award, X } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { PersonalDetails, UpdatePersonalDetails } from '../types/profile';
import { useToast } from '../../../contexts/ToastContext';

export const PersonalDetailsTab: React.FC = () => {
  const [details, setDetails] = useState<PersonalDetails | null>(null);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<UpdatePersonalDetails>({
    firstName: '',
    lastName: '',
    title: '',
    gender: '',
    nationalityId: undefined,
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    countryId: undefined,
    postalCode: '',
  });

  useEffect(() => {
    fetchDetails();
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const countryData = await profileService.getCountries();
      setCountries(Array.isArray(countryData) ? countryData : []);
    } catch (error) {
      console.error('Failed to load lookups', error);
    }
  };

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getPersonalDetails();
      setDetails(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName || '',
        title: data.title || '',
        gender: data.gender || '',
        nationalityId: data.nationalityId,
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        countryId: data.countryId,
        postalCode: data.postalCode || '',
      });
    } catch (error) {
      showError('Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Parse numeric IDs for nationality and country
    if (name === 'nationalityId' || name === 'countryId') {
      const numValue = value ? parseInt(value, 10) : undefined;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await profileService.updatePersonalDetails(formData);
      showSuccess('Profile updated successfully!');
      fetchDetails();
      setIsEditing(false);
    } catch (error) {
      showError('Failed to update profile.');
    } finally {
      setIsSaving(false);
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
      {/* HEADER - Ultra Compact */}
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
          <p className="text-xs text-gray-500">Manage your basic identity and contact details.</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setShowLoyalty(!showLoyalty)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${showLoyalty
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-white text-blue-900 border border-blue-100 hover:bg-blue-50'
                  }`}
              >
                <Award size={14} />
                {showLoyalty ? 'Hide Loyalty' : 'Loyalty'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-full hover:bg-blue-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 pb-2">
        {/* Identity Section - Ultra Compact */}
        <div className="bg-white/80 p-3 rounded-2xl border border-blue-50 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-blue-100 rounded-lg text-blue-600">
              <User size={14} />
            </div>
            <h4 className="font-semibold text-xs text-gray-800">Identity</h4>
          </div>

          <div className="space-y-2">
            {/* Identity Row - Title, First, Middle, Last, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Title</label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Ms">Ms.</option>
                  <option value="Dr">Dr.</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                  placeholder="First Name"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                  placeholder="Last Name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Nationality & Date of Birth - Side by Side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Nationality</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <Globe size={12} />
                  </div>
                  <select
                    name="nationalityId"
                    value={formData.nationalityId || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900"
                  >
                    <option value="">Select Nationality</option>
                    {Array.isArray(countries) && countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Date of Birth</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <Calendar size={12} />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section - Ultra Compact */}
        <div className="bg-white/80 p-3 rounded-2xl border border-blue-50 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-blue-100 rounded-lg text-blue-600">
              <Mail size={14} />
            </div>
            <h4 className="font-semibold text-xs text-gray-800">Contact Details</h4>
          </div>

          <div className="space-y-2">
            {/* Email & Phone - Side by Side */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <Mail size={12} />
                  </div>
                  <input
                    type="email"
                    value={details?.email || ''}
                    disabled={true}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-gray-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all opacity-70 cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">Phone</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <Phone size={12} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-7 pr-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Address Section - Simplified */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="p-1 bg-blue-100 rounded-lg text-blue-600">
                  <MapPin size={14} />
                </div>
                <h5 className="font-semibold text-xs text-gray-800">Address</h5>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="Address Line 1"
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="Address Line 2 (Optional)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900 placeholder-gray-300"
                    placeholder="Postal Code"
                  />
                  <select
                    name="countryId"
                    value={formData.countryId || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-2.5 py-1.5 bg-white/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs text-gray-900"
                  >
                    <option value="">Select Country</option>
                    {Array.isArray(countries) && countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchDetails();
              }}
              disabled={isSaving}
              className="px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-50 transition-all uppercase tracking-wide disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-blue-900 text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-all shadow-lg flex items-center gap-1.5 active:scale-95 disabled:opacity-70 uppercase tracking-wide"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        {/* Loyalty Popup Modal */}
        {!isEditing && showLoyalty && details && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              className="relative w-full max-w-sm bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoyalty(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-4">
                  <Award size={32} className="text-blue-200" />
                </div>
                <h4 className="text-xl font-bold">Loyalty Status</h4>
                <p className="text-blue-200 text-sm">Your membership highlights</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/10 p-5 rounded-3xl border border-white/10 hover:bg-white/15 transition-all">
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">Points Earned</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{details.loyaltyPoints}</span>
                    <Globe size={24} className="opacity-20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-5 rounded-3xl border border-white/10 hover:bg-white/15 transition-all">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">Trips</p>
                    <span className="text-2xl font-bold">{details.tripsCompleted}</span>
                  </div>
                  <div className="bg-white/10 p-5 rounded-3xl border border-white/10 hover:bg-white/15 transition-all">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-1">Since</p>
                    <span className="text-lg font-bold">{new Date(details.memberSinceDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowLoyalty(false)}
                  className="w-full py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={() => setShowLoyalty(false)} />
          </div>
        )}
      </form>
    </div>
  );
};