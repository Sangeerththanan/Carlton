import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import type { 
  PersonalDetails, 
  UpdatePersonalDetails, 
  SavedTraveller, 
  AddSavedTraveller, 
  UserPreference, 
  UpdatePreferences, 
  FrequentFlyerProgram, 
  AddFrequentFlyer 
} from '../types/profile';

// Create axios instance — withCredentials sends the HTTP-only auth cookie on every request
const api = axios.create({
  withCredentials: true,
});

export const profileService = {
  // Personal Details
  getPersonalDetails: async (): Promise<PersonalDetails> => {
    const response = await api.get<PersonalDetails>(`${API_ENDPOINTS.PROFILE}/personal`);
    return response.data;
  },

  updatePersonalDetails: async (data: UpdatePersonalDetails): Promise<void> => {
    await api.put(`${API_ENDPOINTS.PROFILE}/personal`, data);
  },

  // Saved Travellers
  getSavedTravellers: async (): Promise<SavedTraveller[]> => {
    const response = await api.get<SavedTraveller[]>(`${API_ENDPOINTS.PROFILE}/travellers`);
    return response.data;
  },

  addSavedTraveller: async (data: AddSavedTraveller): Promise<SavedTraveller> => {
    const response = await api.post<SavedTraveller>(`${API_ENDPOINTS.PROFILE}/travellers`, data);
    return response.data;
  },

  deleteSavedTraveller: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.PROFILE}/travellers/${id}`);
  },

  // User Preferences
  getUserPreferences: async (): Promise<UserPreference> => {
    const response = await api.get<UserPreference>(`${API_ENDPOINTS.PROFILE}/preferences`);
    return response.data;
  },

  updateUserPreferences: async (data: UpdatePreferences): Promise<void> => {
    await api.put(`${API_ENDPOINTS.PROFILE}/preferences`, data);
  },

  // Frequent Flyer Programs
  getFrequentFlyerPrograms: async (): Promise<FrequentFlyerProgram[]> => {
    const response = await api.get<FrequentFlyerProgram[]>(`${API_ENDPOINTS.PROFILE}/loyalty`);
    return response.data;
  },

  addFrequentFlyerProgram: async (data: AddFrequentFlyer): Promise<FrequentFlyerProgram> => {
    const response = await api.post<FrequentFlyerProgram>(`${API_ENDPOINTS.PROFILE}/loyalty`, data);
    return response.data;
  },

  deleteFrequentFlyerProgram: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.PROFILE}/loyalty/${id}`);
  },

  // Lookups
  getCountries: async (): Promise<{ id: number; name: string; code?: string }[]> => {
    const response = await api.get<{ id: number; name: string; code?: string }[]>(API_ENDPOINTS.LOOKUPS.COUNTRIES);
    return response.data;
  },

  getAirlines: async (): Promise<{ id: number; name: string; code?: string }[]> => {
    const response = await api.get<{ id: number; name: string; code?: string }[]>(API_ENDPOINTS.LOOKUPS.AIRLINES);
    return response.data;
  }
};
