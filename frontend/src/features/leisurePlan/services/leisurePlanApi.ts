import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export interface LeisurePlanLeg {
    flag: string;
    city: string;
    days: string;
    imageUrl?: string;
}

export interface LeisurePlan {
    id: number;
    customerId: number;
    title: string;
    planType: string;
    tier: string;
    status: string;
    departureAirport: string;
    destinations: string;
    dateRange: string;
    passengers: string;
    heroImage?: string;
    estimatedCost: number;
    budget: number;
    legs: LeisurePlanLeg[];
    activities: string[];
    flights: any[];
    hotels: any[];
    itinerary: Record<string, any[]>;
    mealPlan: any[];
    confirmedOn?: string;
    cancelledOn?: string;
}

export interface CreateLeisurePlanDto {
    title: string;
    planType: string;
    tier: string;
    departureAirport: string;
    destinations: string;
    startDate: string;
    endDate: string;
    passengers: string;
    heroImage?: string;
    estimatedCost: number;
    budget: number;
    legs: LeisurePlanLeg[];
    activities: string[];
    flights: any[];
    hotels: any[];
    itinerary: Record<string, any[]>;
    mealPlan: any[];
}

export interface AIFullLeisurePlan extends LeisurePlan {
    flights: any[];
    hotels: any[];
    itinerary: Record<string, any[]>;
    mealPlan: any[];
}

export interface LeisurePlanStats {
    totalPlans: number;
    booked: number;
    totalSaved: number;
    pendingBookings: number;
    cancelledPlans: number;
    pastPlans: number;
}

// ─── Featured Packages ───────────────────────────────────────────────────────
// Single source of truth — types are defined in leisurePackagesApi.ts
export type { FeaturedPackage } from './leisurePackagesApi';
import type { FeaturedPackage } from './leisurePackagesApi';


export interface AILeisurePlanRequest {
    destinations: { country: string; days: number }[];
    budget: number;
    currency: string;
    departureAirport: string;
    localTransportation: string[];
    experiences: string[];
    specialRequirements: string[];
    additionalNotes: string;
    fromDate?: string;
    toDate?: string;
    adults: number;
    children: number;
    infants: number;
    mealPreferences: string[];

    // Room Preferences
    singleRooms: number;
    twinRooms: number;
    doubleRooms: number;
    tripleRooms: number;
    familyRooms: number;
    suites: number;
    dormitories: number;
}

export interface AIHotelDto {
    city: string;
    nights: string;
    name: string;
    location: string;
    stars: number;
    price: string;
    badge: string;
    amenities: string[];
    imageUrl: string;
}

export interface AIHotelSearchRequest {
    city: string;
    budgetPerNight: number;
    adults: number;
    children: number;
    infants: number;
    currency?: string;
}

export interface AIActivityOptionDto {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    tags: { label: string; color: string }[];
}

export interface AIActivitySearchRequest {
    city: string;
    adults: number;
    children: number;
}

export const leisurePlanService = {
    getStats: async (): Promise<LeisurePlanStats> => {
        const response = await axios.get(`${API_ENDPOINTS.LEISURE_PLAN}/stats`, {
            withCredentials: true
        });
        return response.data;
    },

    getFeaturedPackages: async (): Promise<FeaturedPackage[]> => {
        const response = await axios.get(`${API_ENDPOINTS.LEISURE_PLAN}/packages`, {
            withCredentials: true
        });
        return response.data;
    },

    getPlans: async (status?: string): Promise<LeisurePlan[]> => {
        const url = status
            ? `${API_ENDPOINTS.LEISURE_PLAN}?status=${status}`
            : API_ENDPOINTS.LEISURE_PLAN;

        const response = await axios.get(url, {
            withCredentials: true
        });
        return response.data;
    },

    getPlan: async (id: number): Promise<LeisurePlan> => {
        const response = await axios.get(`${API_ENDPOINTS.LEISURE_PLAN}/${id}`, {
            withCredentials: true
        });
        return response.data;
    },

    confirmPlan: async (id: number): Promise<LeisurePlan> => {
        const response = await axios.post(API_ENDPOINTS.LEISURE_PLAN_CONFIRM(id), {}, {
            withCredentials: true
        });
        return response.data;
    },

    cancelPlan: async (id: number, reason?: string): Promise<LeisurePlan> => {
        const response = await axios.post(`${API_ENDPOINTS.LEISURE_PLAN}/${id}/cancel`, { reason }, {
            withCredentials: true
        });
        return response.data;
    },

    deletePlan: async (id: number): Promise<void> => {
        await axios.delete(`${API_ENDPOINTS.LEISURE_PLAN}/${id}`, {
            withCredentials: true
        });
    },

    generateAIPlan: async (request: AILeisurePlanRequest): Promise<AIFullLeisurePlan> => {
        const response = await axios.post(`${API_ENDPOINTS.LEISURE_PLAN}/generate`, request, {
            withCredentials: true
        });
        return response.data;
    },

    createPlan: async (plan: CreateLeisurePlanDto): Promise<LeisurePlan> => {
        const response = await axios.post(API_ENDPOINTS.LEISURE_PLAN, plan, {
            withCredentials: true
        });
        return response.data;
    },

    updatePlan: async (id: number, plan: CreateLeisurePlanDto): Promise<LeisurePlan> => {
        const response = await axios.put(`${API_ENDPOINTS.LEISURE_PLAN}/${id}`, plan, {
            withCredentials: true
        });
        return response.data;
    },

    getAlternativeHotels: async (request: AIHotelSearchRequest): Promise<AIHotelDto[]> => {
        // Try the backend first
        try {
            const response = await axios.post(`${API_ENDPOINTS.LEISURE_PLAN}/hotels/alternatives`, request, {
                withCredentials: true
            });
            if (response.data && response.data.length > 0) {
                return response.data;
            }
        } catch {
            // Fall through to Groq direct call
        }

        // Direct Groq fallback
        const GROQ_API_KEY = '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';
        const prompt = `Suggest 4-5 real, popular hotels in ${request.city}. Budget per night: approximately ${request.budgetPerNight} ${request.currency || 'GBP'}. Passengers: ${request.adults} Adults, ${request.children} Children.
Return ONLY a JSON array, no markdown:
[{"city":"${request.city}","nights":"5 NIGHTS","name":"Hotel Name","location":"District, City","stars":4,"price":"£${request.budgetPerNight}/night","badge":"Best Match","amenities":["Pool","WiFi","Spa"],"imageUrl":""}]`;

        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a hotel booking expert. Return ONLY valid JSON array.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            },
            { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let content: string = groqResponse.data.choices[0].message.content;
        if (content.includes('```json')) content = content.split('```json')[1].split('```')[0].trim();
        else if (content.includes('```')) content = content.split('```')[1].split('```')[0].trim();

        const hotels: AIHotelDto[] = JSON.parse(content);

        // Enrich with Unsplash images
        const hotelImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        ];

        return hotels.map((h, i) => ({
            ...h,
            imageUrl: h.imageUrl || hotelImages[i % hotelImages.length]
        }));
    },

    getAlternativeActivities: async (request: AIActivitySearchRequest): Promise<AIActivityOptionDto[]> => {
        // Try the backend first
        try {
            const response = await axios.post(`${API_ENDPOINTS.LEISURE_PLAN}/activities/alternatives`, request, {
                withCredentials: true
            });
            if (response.data && response.data.length > 0) {
                return response.data;
            }
        } catch {
            // Fall through to Groq direct call
        }

        // Direct Groq fallback
        const GROQ_API_KEY = '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';
        const prompt = `Suggest 6 real, popular activities or attractions in ${request.city} for ${request.adults} adults.
Return ONLY a JSON array, no markdown:
[{"id":"1","title":"Activity Name","description":"Short description with duration","price":"£25/pp","imageUrl":"","tags":[{"label":"Cultural","color":"#f0e4c2"}]}]`;

        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a travel expert. Return ONLY valid JSON array.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            },
            { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let content: string = groqResponse.data.choices[0].message.content;
        if (content.includes('```json')) content = content.split('```json')[1].split('```')[0].trim();
        else if (content.includes('```')) content = content.split('```')[1].split('```')[0].trim();

        const activities: AIActivityOptionDto[] = JSON.parse(content);

        // Enrich with Unsplash images
        const imageMap: Record<string, string> = {
            'temple': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
            'market': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
            'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
            'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
            'museum': 'https://images.unsplash.com/photo-1503551723145-6c040742065b?w=600&q=80',
            'cooking': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
            'tour': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
            'hiking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
            'safari': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
            'cruise': 'https://images.unsplash.com/photo-1548574505-5e239809f36b?w=600&q=80',
        };

        return activities.map(a => ({
            ...a,
            imageUrl: a.imageUrl || (() => {
                const key = Object.keys(imageMap).find(k => a.title.toLowerCase().includes(k));
                return key ? imageMap[key] : `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80`;
            })()
        }));
    }
};