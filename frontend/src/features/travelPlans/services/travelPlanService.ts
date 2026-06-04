import { API_ENDPOINTS } from '../../../config/apiConfig';
import type { TravelPlan, CreateTravelPlanRequest } from '../types/travelPlanTypes';

const readErrorMessage = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json().catch(() => null);
    if (json && typeof json === 'object') {
      const message = (json as any).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }

  const text = await response.text().catch(() => '');
  return text?.trim() || response.statusText || 'Request failed';
};

export const travelPlanService = {
  getAll: async (): Promise<TravelPlan[]> => {
    const response = await fetch(API_ENDPOINTS.TRAVEL_PLANS, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  getById: async (id: number): Promise<TravelPlan> => {
    const response = await fetch(`${API_ENDPOINTS.TRAVEL_PLANS}/${id}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  create: async (payload: CreateTravelPlanRequest): Promise<TravelPlan> => {
    const response = await fetch(API_ENDPOINTS.TRAVEL_PLANS, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  update: async (id: number, payload: CreateTravelPlanRequest): Promise<TravelPlan> => {
    const response = await fetch(`${API_ENDPOINTS.TRAVEL_PLANS}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.TRAVEL_PLANS}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
  },
};
