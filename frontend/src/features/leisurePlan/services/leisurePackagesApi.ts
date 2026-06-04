import axios from 'axios';
import { API_ENDPOINTS } from '@/config/apiConfig';

export interface FeaturedPackage {
    id: number;
    destination: string;
    badge: string;
    badgeColor: string;
    image: string;
    title: string;
    subtitle: string;
    nights: string;
    experience: string;
    details: { value: string; label: string }[];
    tags: string[];
    whatsIncluded: { title: string; desc: string }[];
    itinerary: { day: string; title: string; desc: string; img?: string }[];
    tiers: { name: string; price: number; desc: string; isPopular: boolean }[];
    accommodationCost: number;
    transfersCost: number;
    serviceFee: number;
    estimatedCost: number;
    galleryImages: string[];
    reviews: { stars: number; text: string; name: string; stayed: string }[];
    wasPrice: string;
    price: string;
    perLabel: string;
    save: string;
}

export const leisurePackagesApi = {
    getPackages: async (): Promise<FeaturedPackage[]> => {
        const response = await axios.get(`${API_ENDPOINTS.LEISURE_PLAN}/packages`, {
            withCredentials: true,
        });
        return response.data;
    },

    getPackage: async (id: number): Promise<FeaturedPackage> => {
        const response = await axios.get(`${API_ENDPOINTS.LEISURE_PLAN}/packages/${id}`, {
            withCredentials: true,
        });
        return response.data;
    }
};
