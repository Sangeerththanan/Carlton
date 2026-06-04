import React from 'react';
import { X, Star, MapPin } from 'lucide-react';
import { leisurePlanService } from './services/leisurePlanApi';
import type { AIHotelDto } from './services/leisurePlanApi';

interface HotelOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedHotels: Record<string, AIHotelDto>) => void;
    selectedCity: string | null;
    plan?: any; // Added plan prop for header data
    budgetPerNight?: number;
    adults?: number;
    children?: number;
    infants?: number;
}

export default function HotelOptionsModal({
    isOpen,
    onClose,
    onSave,
    selectedCity,
    plan,
    budgetPerNight = 150,
    adults = 1,
    children = 0,
    infants = 0
}: HotelOptionsModalProps) {
    const [selectedHotels, setSelectedHotels] = React.useState<Record<string, AIHotelDto>>({});
    const [hotels, setHotels] = React.useState<AIHotelDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && selectedCity) {
            setHotels([]);
            fetchHotels(selectedCity);
        }
    }, [isOpen, selectedCity]);

    const fetchHotels = async (city: string) => {
        setIsLoading(true);
        try {
            const data = await leisurePlanService.getAlternativeHotels({
                city,
                budgetPerNight,
                adults,
                children,
                infants
            });
            setHotels(data);

            // Set initial selection if available
            if (data.length > 0 && city) {
                setSelectedHotels(prev => ({ ...prev, [city]: data[0] }));
            }
        } catch (error) {
            console.error('Error fetching alternative hotels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSelect = (hotel: AIHotelDto) => {
        if (selectedCity) {
            setSelectedHotels(prev => ({ ...prev, [selectedCity]: hotel }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 flex items-start justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {plan?.destinations || 'Selection'} · Hotel edit
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {plan?.departureAirport} → {plan?.destinations} | {plan?.dateRange} | {plan?.passengers}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all font-bold"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Info Bar */}
                <div className="px-8 py-4">
                    <div className="bg-[#eef2ff] rounded-2xl px-6 py-4 flex flex-wrap gap-8 items-center border border-blue-100/50">
                        {[
                            {
                                label: 'Departure',
                                value: (plan?.dateRange?.split(' to ')[0] || plan?.dateRange?.split('—')[0] || plan?.dateRange?.split(' - ')[0] || 'TBD').trim()
                            },
                            {
                                label: 'Return',
                                value: (plan?.dateRange?.split(' to ')[1] || plan?.dateRange?.split('—')[1] || plan?.dateRange?.split(' - ')[1] || 'TBD').trim()
                            },
                            { label: 'Duration', value: `${plan?.legs?.reduce((acc: number, l: any) => acc + parseInt(l.days), 0) || 0} nights` },
                            { label: 'Passengers', value: plan?.passengers || '1 Adult' },
                            { label: 'Budget', value: `Max £${plan?.budget?.toLocaleString() || '0'}` },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-sm font-bold text-gray-800">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-10 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#1a2b6b] border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium">Finding best hotels in {selectedCity}...</p>
                        </div>
                    ) : hotels.length > 0 ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase">
                                    {selectedCity} · BEST OPTIONS
                                </h3>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hotels.map((hotel) => {
                                    const isSelected = selectedCity && selectedHotels[selectedCity]?.name === hotel.name;
                                    return (
                                        <div
                                            key={hotel.name}
                                            onClick={() => handleSelect(hotel)}
                                            className={`relative bg-white rounded-3xl overflow-hidden border-2 transition-all cursor-pointer group flex flex-col ${isSelected ? 'border-[#1a2b6b] shadow-xl ring-1 ring-[#1a2b6b]/10' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}`}
                                        >
                                            {/* Hotel Image */}
                                            <div className="h-44 relative overflow-hidden">
                                                <img
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 bg-[#1a2b6b] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                                        Selected
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex gap-0.5 mb-2">
                                                    {[...Array(hotel.stars)].map((_, i) => (
                                                        <Star key={i} size={13} className="fill-amber-400 text-amber-400" strokeWidth={0} />
                                                    ))}
                                                </div>

                                                <h4 className="text-base font-bold text-gray-900 leading-snug group-hover:text-[#1a2b6b] transition-colors">
                                                    {hotel.name}
                                                </h4>

                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <p className="text-[11px] font-medium text-gray-400">{hotel.location}</p>
                                                </div>

                                                <div className="mt-4 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xl font-black text-gray-900">{hotel.price}</p>
                                                        <p className={`text-[10px] font-bold mt-0.5 ${hotel.badge.toLowerCase().includes('within') ? 'text-green-500' : 'text-amber-500'}`}>
                                                            {hotel.badge}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1.5 mt-5">
                                                    {hotel.amenities.map(amenity => (
                                                        <span
                                                            key={amenity}
                                                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-gray-600 border border-black/5 bg-gray-50"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <p className="text-gray-400">No hotels found for {selectedCity}.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(selectedHotels)}
                        className="px-8 py-3 rounded-xl bg-[#1a2b6b] text-white text-sm font-bold shadow-lg shadow-[#1a2b6b]/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Save changes
                    </button>
                </div>

            </div>
        </div>
    );
}
