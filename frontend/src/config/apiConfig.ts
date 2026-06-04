// Centralized API configuration
// Reads from environment variable or uses default for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5193/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/Auth/login`,
    LOGOUT: `${API_BASE_URL}/Auth/logout`,
    ME: `${API_BASE_URL}/Auth/me`,
    REFRESH: `${API_BASE_URL}/Auth/refresh`,
    REGISTER: `${API_BASE_URL}/Auth/register`,
  },
  FLIGHTS: `${API_BASE_URL}/flights`,
  PROVIDERS: `${API_BASE_URL}/providers`,
  BOOKINGS: `${API_BASE_URL}/bookings`,
  /** Anonymous checkout — server attributes booking to shadow user `guest_checkout`. */
  BOOKINGS_GUEST: `${API_BASE_URL}/bookings/guest`,
  LEISURE_PLAN: `${API_BASE_URL}/LeisurePlan`,
  LEISURE_PLAN_CONFIRM: (id: number) => `${API_BASE_URL}/LeisurePlan/${id}/confirm`,
  PROFILE: `${API_BASE_URL}/profile`,
  TRAVEL_PLANS: `${API_BASE_URL}/travelplan`,

  DASHBOARD: {
    USER: `${API_BASE_URL}/dashboard/user`,
    NEXT_TRIP: `${API_BASE_URL}/dashboard/nextTrip`,
    NOTIFICATIONS: `${API_BASE_URL}/dashboard/notifications`,
    ROUTES: `${API_BASE_URL}/dashboard/routes`,
    PROMOTIONS: `${API_BASE_URL}/dashboard/promotions`,
  },
  LOOKUPS: {
    COUNTRIES: `${API_BASE_URL}/lookups/countries`,
    AIRLINES: `${API_BASE_URL}/lookups/airlines`,
  },
  SEARCH: `${API_BASE_URL}/search`,
  PAYMENT: `${API_BASE_URL}/Payment`,
  CHECKIN: {
    LOOKUP: `${API_BASE_URL}/checkin/lookup`,
    UPCOMING: `${API_BASE_URL}/checkin/upcoming`,
    SUBMIT: `${API_BASE_URL}/checkin/submit`,
  },
};
