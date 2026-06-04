import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Globe, DollarSign, Bell, X, MapPin, Plane } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { UpdatePreferences } from '../types/profile';
import { useToast } from '../../../contexts/ToastContext';

export const PreferencesTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<UpdatePreferences>({
    language: 'en',
    currencyCode: 'USD',
    timezone: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    preferredRoute: '',
    preferredClass: 'Economy',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getUserPreferences();
      setFormData({
        language: data.language,
        currencyCode: data.currencyCode,
        timezone: data.timezone || '',
        emailNotifications: data.emailNotifications,
        smsNotifications: data.smsNotifications,
        pushNotifications: data.pushNotifications,
        preferredRoute: data.preferredRoute || '',
        preferredClass: data.preferredClass || 'Economy',
      });
    } catch (error) {
      showError('Failed to load preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await profileService.updateUserPreferences(formData);
      showSuccess('Preferences updated successfully!');
      fetchPreferences();
    } catch (error) {
      showError('Failed to update preferences.');
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">Application Preferences</h3>
          <p className="text-xs text-gray-500">Customize how you interact with the platform.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${showNotifications
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : 'bg-white text-blue-900 border border-blue-100 hover:bg-blue-50'
              }`}
          >
            <Bell size={14} />
            {showNotifications ? 'Hide Notifications' : 'Notifications'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Localization & Display */}
        <div className="bg-white/80 p-5 rounded-2xl border border-blue-50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-blue-600" />
            <h4 className="font-bold text-sm text-gray-900">Localization & Appearance</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Language</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="en">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Currency</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="currencyCode"
                  value={formData.currencyCode}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Timezone</label>
              <input
                type="text"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                placeholder="e.g. Asia/Colombo"
                className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white/80 p-5 rounded-2xl border border-blue-50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Plane size={16} className="text-blue-600" />
            <h4 className="font-bold text-sm text-gray-900">Travel Preferences</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Preferred Route</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="preferredRoute"
                  value={formData.preferredRoute}
                  onChange={handleInputChange}
                  placeholder="e.g. London (LHR) - Dubai (DXB)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Preferred Class</label>
              <div className="relative">
                <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  name="preferredClass"
                  value={formData.preferredClass}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Popup Modal */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              className="relative w-full max-w-sm bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-4">
                  <Bell size={32} className="text-blue-200" />
                </div>
                <h4 className="text-xl font-bold">Notification Channels</h4>
                <p className="text-blue-200 text-sm">Manage your communication preferences</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive travel updates and receipts via email.' },
                  { id: 'smsNotifications', label: 'SMS Alerts', desc: 'Get critical flight status changes on your phone.' },
                  { id: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time updates through your browser or app.' },
                ].map((n) => (
                  <div key={n.id} className="flex items-center justify-between p-4 bg-white/10 rounded-3xl border border-white/10 hover:bg-white/15 transition-all">
                    <div>
                      <h5 className="text-sm font-bold text-white">{n.label}</h5>
                      <p className="text-xs text-blue-200">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={n.id}
                        checked={(formData as any)[n.id]}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="absolute inset-0 -z-10" onClick={() => setShowNotifications(false)} />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-blue-900 text-white font-bold text-sm rounded-full hover:bg-blue-800 transition-all shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-70 uppercase tracking-widest"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
