export interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  serviceType: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  totalBookings: number;
  commission: number;
  joinedDate: string;
  lastActive: string;
}

export interface CreateProviderRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  serviceType: string;
  commission: number;
}

export interface UpdateProviderRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  serviceType: string;
  status: 'active' | 'inactive' | 'pending';
  commission: number;
}

export interface ProviderFilters {
  status?: string;
  serviceType?: string;
  city?: string;
  search?: string;
}
