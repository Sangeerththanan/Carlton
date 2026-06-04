import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { leisurePlanService } from './services/leisurePlanApi';
import type { CreateLeisurePlanDto } from './services/leisurePlanApi';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
    ArrowLeft,
    Plane,
    Pencil,
    CheckCircle2,
    Star,
    MapPin,
    X,
} from 'lucide-react';
import FlightOptionsModal from './FlightOptionsModal';
import HotelOptionsModal from './HotelOptionsModal';
import ItineraryOptionsModal from './ItineraryOptionsModal';
import MealPlanModal from './MealPlanModal';
import BookingSummaryModal from './BookingSummaryModal';

const poppins: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

/*  Static Data  */



/*  Small helpers  */

function Tag({ label, color }: { label: string; color: string }) {
    return (
        <span
            className="text-xs px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-700"
            style={{ background: color }}
        >
            {label}
        </span>
    );
}

function EditBtn({ label = 'Edit', onClick }: { label?: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <Pencil size={11} strokeWidth={2} />
            {label}
        </button>
    );
}



/*  Main Page  */

export default function CustomLeisurePlan() {
    const navigate = useNavigate();
    const location = useLocation();

    // AI-generated plan in local state
    const [aiPlan, setAiPlan] = useState<{
        title?: string;
        tier?: string;
        departureAirport?: string;
        destinations?: string;
        legs?: { flag: string; city: string; days: string; imageUrl?: string }[];
        activities?: string[];
        flights?: any[];
        hotels?: any[];
        itinerary?: Record<string, any[]>;
        mealPlan?: any[];
        estimatedCost?: number;
        status?: string;
        budget?: number;
        passengers?: string;
        dateRange?: string;
        planType?: string;
    } | null>(location.state?.plan || null);

    const isEditing = location.state?.isEditing || false;
    const planId = location.state?.planId || null;

    const [activeCity, setActiveCity] = useState<string>('Bangkok');
    const [activeDay, setActiveDay] = useState(1);

    // FIX 1: Normalise itinerary keys so lookups are case-insensitive.
    // Also reset activeCity whenever aiPlan changes so we always land on a valid city.
    const normalisedItinerary: Record<string, any[]> | null = aiPlan?.itinerary
        ? Object.fromEntries(
            Object.entries(aiPlan.itinerary).map(([k, v]) => [k.trim(), v ?? []])
        )
        : null;

    useEffect(() => {
        if (normalisedItinerary) {
            const cities = Object.keys(normalisedItinerary);
            if (cities.length > 0 && !cities.includes(activeCity)) {
                setActiveCity(cities[0]);
                setActiveDay(normalisedItinerary[cities[0]]?.[0]?.day ?? 1);
            }
        }
    }, [aiPlan]);

    const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
    const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
    const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<string | null>(null);
    const [editingSlot, setEditingSlot] = useState<{ day: number; period: 'morning' | 'afternoon' | 'evening' } | null>(null);

    // FIX 2: Use normalisedItinerary only.
    const cityDays: any[] = normalisedItinerary
        ? (normalisedItinerary[activeCity] ?? [])
        : [];

    // FIX 3: Guard dayData — never undefined.
    const dayData = cityDays.length > 0
        ? (cityDays.find((d: any) => d.day === activeDay) ?? cityDays[0])
        : null;

    const displayFlights = aiPlan?.flights && aiPlan.flights.length > 0 ? aiPlan.flights : [];
    const displayHotels = aiPlan?.hotels && aiPlan.hotels.length > 0 ? aiPlan.hotels : [];
    const displayMealPlan = aiPlan?.mealPlan && aiPlan.mealPlan.length > 0 ? aiPlan.mealPlan : [];
    const displayCities = (normalisedItinerary && Object.keys(normalisedItinerary).length > 0)
        ? Object.keys(normalisedItinerary)
        : [];

    // Construct a full plan object for the summary modal
    const displayPlan = {
        title: aiPlan?.title || 'Your Leisure Plan',
        destinations: aiPlan?.destinations || 'Destinations Pending',
        dateRange: aiPlan?.dateRange || 'Dates Pending',
        passengers: aiPlan?.passengers || 'Passengers Pending',
        planType: aiPlan?.planType || 'Standard Plan',
        status: aiPlan?.status || 'Draft',
        tier: aiPlan?.tier || 'Standard',
        estimatedCost: aiPlan?.estimatedCost || 0,
        budget: aiPlan?.budget || 0,
        legs: aiPlan?.legs || [],
        flights: displayFlights,
        hotels: displayHotels,
        activities: (aiPlan?.activities && aiPlan.activities.length > 0)
            ? aiPlan.activities
            : [],
        mealPlan: displayMealPlan
    } as any;

    const isOverBudget = aiPlan && aiPlan.estimatedCost && aiPlan.budget
        ? aiPlan.estimatedCost > aiPlan.budget
        : false;

    // Price Parsing & Total Calculation
    const parsePrice = (priceStr: string | undefined): number => {
        if (!priceStr) return 0;
        const numeric = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(numeric) || 0;
    };

    const calculateTotal = (hotels: any[], flights: any[], itinerary: Record<string, any[]>, passengersStr: string) => {
        const pCount = parseInt(passengersStr.split(' ')[0]) || 1;
        const flightTotal = flights.reduce((sum, f) => sum + (parsePrice(f.price) * pCount), 0);
        const hotelTotal = hotels.reduce((sum, h) => {
            const nights = parseInt(h.nights?.split(' ')[0]) || 1;
            return sum + (parsePrice(h.price) * nights);
        }, 0);

        const itineraryTotal = Object.values(itinerary).flatMap(days => days).reduce((sum, day) => {
            const morningPrice = parsePrice(day.morning?.price);
            const afternoonPrice = parsePrice(day.afternoon?.price);
            const eveningPrice = parsePrice(day.evening?.price);
            return sum + morningPrice + afternoonPrice + eveningPrice;
        }, 0);

        return flightTotal + hotelTotal + itineraryTotal;
    };

    const handleSaveFlights = (selectedFlights: Record<string, string>) => {
        if (!aiPlan) return;

        let costDelta = 0;

        const updatedFlights = (aiPlan.flights || []).map(f => {
            const legTitle = f.type || 'OUTBOUND FLIGHTS';
            if (selectedFlights[legTitle]) {
                // In a real scenario, we'd find the new flight object and get its price.
                // Since modal currently returns mock IDs, we'll simulate a delta if it changed.
                if (f.id !== selectedFlights[legTitle]) {
                    // Simulating cost change for mock flights
                    costDelta += 50;
                }
                return { ...f, id: selectedFlights[legTitle] };
            }
            return f;
        });

        const newTotal = calculateTotal(aiPlan.hotels || [], updatedFlights, aiPlan.itinerary || {}, aiPlan.passengers || '1 Adult');
        setAiPlan(prev => prev ? { ...prev, flights: updatedFlights, estimatedCost: newTotal } : null);
        setIsFlightModalOpen(false);
    };

    const handleSaveMealPlan = (data: any) => {
        if (!aiPlan) return;

        // Update the global mealPlan state
        // Format to List<AIMealPlanDto> structure
        const updatedMealPlan = data.mealPlans.map((mp: any) => {
            const selectedBoard = data.selectedBoards[mp.city];
            const option = mp.options.find((o: any) => o.boardType === selectedBoard);
            return {
                city: mp.city,
                boardType: selectedBoard,
                description: option?.description || '',
                pricePerNight: option?.pricePerNight || ''
            };
        });

        setAiPlan(prev => prev ? { ...prev, mealPlan: updatedMealPlan } : null);
        setIsMealModalOpen(false);
    };

    const handleSaveHotels = (selectedHotels: Record<string, any>) => {
        if (!aiPlan) return;

        let costDelta = 0;
        const updatedHotels = (aiPlan.hotels || []).map(h => {
            const cityKey = Object.keys(selectedHotels).find(k => h.city.toLowerCase().includes(k.toLowerCase()));
            if (cityKey && selectedHotels[cityKey]) {
                const newHotel = selectedHotels[cityKey];
                const oldPrice = parsePrice(h.price);
                const newPrice = parsePrice(newHotel.price);
                const nights = parseInt(h.nights?.split(' ')[0]) || 1;

                costDelta += (newPrice - oldPrice) * nights;
                return { ...h, ...newHotel };
            }
            return h;
        });

        const newTotal = calculateTotal(updatedHotels, aiPlan.flights || [], aiPlan.itinerary || {}, aiPlan.passengers || '1 Adult');
        setAiPlan(prev => prev ? { ...prev, hotels: updatedHotels, estimatedCost: newTotal } : null);
        setIsHotelModalOpen(false);
    };

    const handleSaveActivities = (selectedActivities: any[]) => {
        if (!aiPlan || !editingCity) return;

        const updatedItinerary = { ...aiPlan.itinerary };
        const cityItinerary = [...(updatedItinerary[editingCity] || [])];

        if (editingSlot) {
            // 1. SLOT-SPECIFIC UPDATE
            const { day, period } = editingSlot;
            const dayIdx = cityItinerary.findIndex(d => d.day === day);
            if (dayIdx !== -1 && selectedActivities.length > 0) {
                const act = selectedActivities[0];
                cityItinerary[dayIdx] = {
                    ...cityItinerary[dayIdx],
                    [period]: {
                        title: act.title,
                        desc: act.description,
                        duration: '2-3 hours',
                        tags: act.tags || [],
                        price: act.price
                    }
                };
            }
        } else {
            // 2. FULL CITY REDISTRIBUTION
            if (cityItinerary.length > 0) {
                let activityIdx = 0;
                const periods = ['morning', 'afternoon', 'evening'] as const;

                for (let i = 0; i < cityItinerary.length; i++) {
                    const d = { ...cityItinerary[i] };
                    for (const p of periods) {
                        if (activityIdx < selectedActivities.length) {
                            const act = selectedActivities[activityIdx];
                            d[p] = {
                                title: act.title,
                                desc: act.description,
                                duration: '2-3 hours',
                                tags: act.tags || [],
                                price: act.price
                            };
                            activityIdx++;
                        } else {
                            d[p] = null;
                        }
                    }
                    cityItinerary[i] = d;
                }
            }
        }

        updatedItinerary[editingCity] = cityItinerary;

        // Aggregate ALL activity titles from ALL cities to update the global list
        const allActivityTitles: string[] = Object.values(updatedItinerary).flatMap((days: any) =>
            days.flatMap((d: any) => [d.morning?.title, d.afternoon?.title, d.evening?.title])
        ).filter(Boolean);

        const newTotal = calculateTotal(aiPlan.hotels || [], aiPlan.flights || [], updatedItinerary, aiPlan.passengers || '1 Adult');

        setAiPlan(prev => prev ? {
            ...prev,
            activities: allActivityTitles,
            itinerary: updatedItinerary,
            estimatedCost: newTotal
        } : null);

        setIsItineraryModalOpen(false);
        setEditingCity(null);
        setEditingSlot(null);
    };

    const handleSavePlan = async () => {
        const planToUse = displayPlan;
        if (!planToUse) return;

        try {
            const dateStr = planToUse.dateRange || '';
            let startStr = '';
            let endStr = '';

            if (dateStr.includes(' to ')) {
                [startStr, endStr] = dateStr.split(' to ');
            } else if (dateStr.includes(' - ')) {
                [startStr, endStr] = dateStr.split(' - ');
            } else if (dateStr.includes(' · ')) {
                [startStr, endStr] = dateStr.split(' · ');
            }

            const formatDate = (s: string) => {
                if (!s) return new Date().toISOString();
                const d = new Date(s);
                return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
            };

            const planToSave: CreateLeisurePlanDto = {
                title: planToUse.title || 'My Leisure Plan',
                planType: planToUse.planType || 'AI Generated',
                tier: planToUse.tier || 'Standard',
                departureAirport: planToUse.departureAirport || 'LHR',
                destinations: planToUse.destinations || 'Multiple Destinations',
                startDate: formatDate(startStr),
                endDate: formatDate(endStr),
                passengers: planToUse.passengers || '1 Adult',
                heroImage: planToUse.heroImage || (planToUse.legs && planToUse.legs[0]?.imageUrl) || '',
                estimatedCost: planToUse.estimatedCost || 0,
                budget: planToUse.budget || 0,
                legs: (planToUse.legs || []).map((l: any) => ({ flag: l.flag, city: l.city, days: l.days })),
                activities: planToUse.activities || [],
                flights: planToUse.flights || [],
                hotels: planToUse.hotels || [],
                itinerary: planToUse.itinerary || {},
                mealPlan: planToUse.mealPlan || []
            };

            console.log('Saving Plan:', planToSave);
            if (isEditing && planId) {
                const updatedPlan = await leisurePlanService.updatePlan(planId, planToSave);
                console.log('Plan updated successfully!');
                return updatedPlan.id;
            } else {
                const newPlan = await leisurePlanService.createPlan(planToSave);
                console.log('Plan saved successfully!');
                return newPlan.id;
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Failed to save plan. Please try again.');
            return null;
        }
    };

    const handleSaveOnly = async () => {
        const id = await handleSavePlan();
        if (id) {
            navigate('/leisure-plan');
        }
    };

    const handleCityChange = (city: string) => {
        setActiveCity(city);
        const days = normalisedItinerary
            ? (normalisedItinerary[city] ?? [])
            : [];
        setActiveDay(days[0]?.day ?? 1);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#f0f2f8] px-4 py-6" style={poppins}>

                {/*  Hero Banner  */}
                <div
                    className="rounded-2xl px-8 py-7 mb-6 relative overflow-hidden flex items-center gap-4"
                    style={{ background: 'linear-gradient(135deg, #1a2b6b 0%, #2d4a9e 100%)' }}
                >
                    <button
                        onClick={() => navigate('/leisure-plan/create')}
                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} className="text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">
                            {isEditing ? (
                                <>Editing <span style={{ color: '#F5C518' }}>{aiPlan?.title || 'Your Plan'}</span></>
                            ) : aiPlan?.title ? (
                                <>{aiPlan.title}</>
                            ) : (
                                <>Your <span style={{ color: '#F5C518' }}>AI Leisure Plan</span> is Ready</>
                            )}
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">
                            {aiPlan?.destinations ?? 'Based on your preferences.'}
                        </p>
                        {aiPlan?.dateRange && (
                            <p className="text-blue-300 text-xs mt-1">📅 {aiPlan.dateRange} · {aiPlan.passengers}</p>
                        )}
                    </div>
                </div>

                {/* Single-column full-width layout */}
                <div className="flex flex-col gap-5">

                    {/* Your destinations */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                            <MapPin size={16} className="text-amber-500" strokeWidth={2} />
                            <h2 className="text-base font-bold text-gray-900">Your destinations</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-auto">
                            {(aiPlan?.legs || []).map((leg, i) => (
                                <div key={i} className="relative h-64 overflow-hidden group">
                                    {leg.imageUrl ? (
                                        <img src={leg.imageUrl} alt={leg.city} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#1a2b6b] to-[#2d4a9e]" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <span className="absolute top-4 right-4 text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm">
                                        {leg.days}
                                    </span>
                                    <div className="absolute bottom-5 left-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">{leg.flag}</span>
                                            <p className="text-white font-bold text-2xl leading-tight">{leg.city}</p>
                                        </div>
                                        <p className="text-white/80 text-sm mt-0.5">Explore the culture, food, and views of {leg.city}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flight Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <Plane size={18} className="text-[#1a2b6b]" strokeWidth={2.5} />
                                <h2 className="text-base font-bold text-gray-900">Flight details</h2>
                            </div>
                            <button
                                onClick={() => setIsFlightModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a2b6b] border border-[#1a2b6b]/30 px-3.5 py-1.5 rounded-xl hover:bg-[#1a2b6b]/5 transition-all"
                            >
                                <Pencil size={12} strokeWidth={2} /> Edit flights
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 lg:divide-x divide-gray-100">
                            {displayFlights.map((f: any, idx: number) => (
                                <div key={idx} className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider bg-gray-50 px-2 py-0.5 rounded uppercase">{f.label || 'FLIGHT'}</span>
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: '#e8edf8', color: f.codeColor || '#1a2b6b' }}>{f.code}</span>
                                    </div>
                                    <div className="flex items-center justify-between -mt-1">
                                        <p className="text-[11px] font-medium text-gray-500">{f.airline}</p>
                                        <p className="text-[11px] font-bold text-gray-600">{f.date}</p>
                                    </div>

                                    <div className="flex items-center gap-4 my-2">
                                        <div className="text-left w-16">
                                            <p className="text-2xl font-extrabold text-[#1a2b6b] leading-none mb-1">{f.from}</p>
                                            <p className="text-xs font-bold text-gray-800">{f.dep}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{f.fromCity}</p>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center">
                                            <p className="text-[10px] text-gray-400 mb-1 font-medium">{f.duration}</p>
                                            <div className="relative w-full flex items-center">
                                                <div className="flex-1 h-px bg-gray-200" />
                                                <Plane size={10} className="text-gray-300 mx-2 rotate-90" />
                                                <div className="flex-1 h-px bg-gray-200" />
                                            </div>
                                            <p className={`text-[10px] mt-1 font-semibold ${f.stopsColored ? 'text-amber-500' : 'text-green-600'}`}>{f.stops}</p>
                                        </div>
                                        <div className="text-right w-16">
                                            <p className="text-2xl font-extrabold text-[#1a2b6b] leading-none mb-1">{f.to}</p>
                                            <p className="text-xs font-bold text-gray-800">{f.arr}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{f.toCity}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {(f.tags as string[]).map((t: string) => (
                                            <span key={t} className="text-[10px] font-medium text-gray-600 bg-gray-100/70 px-2.5 py-1 rounded-full border border-gray-100">{t}</span>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-gray-50 mt-auto">
                                        <p className="text-sm font-extrabold text-[#1a2b6b] text-right">{f.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hotel Suggestions */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Hotel Suggestions</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {displayHotels.map((h: any, idx: number) => (
                                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="px-5 py-2.5 flex items-center justify-between" style={{ background: '#f8f9ff' }}>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={13} className="text-red-400" strokeWidth={2} />
                                            <span className="text-[11px] font-bold text-[#1a2b6b] tracking-wider uppercase">{h.city} · {h.nights}</span>
                                        </div>
                                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">{h.badge}</span>
                                    </div>
                                    <div className="p-5 flex items-start gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-[#f0f3ff] flex items-center justify-center flex-shrink-0 ring-1 ring-[#1a2b6b]/5">
                                            <div className="grid grid-cols-3 gap-1">
                                                {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#1a2b6b]/20 rounded-full" />)}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-bold text-gray-900 leading-tight">{h.name}</h3>
                                                    <p className="text-xs text-gray-500">{h.location}</p>
                                                    <div className="flex gap-0.5 py-1">
                                                        {[...Array(h.stars)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" strokeWidth={0} />)}
                                                    </div>
                                                </div>
                                                <EditBtn onClick={() => {
                                                    setEditingCity(h.city.split(',')[0]);
                                                    setIsHotelModalOpen(true);
                                                }} />
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {(h.amenities as string[]).map((a: string, i: number) => (
                                                    <span key={a} className="text-[11px] px-3 py-1 rounded-full border border-gray-100 text-gray-600 font-medium" style={{ background: (h.amenityColors?.[i] ?? '#f0f4ff') + '44' }}>{a}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                                                <p className="text-[11px] text-green-600 font-bold bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle2 size={10} strokeWidth={3} /> Within budget
                                                </p>
                                                <p className="text-base font-extrabold text-[#1a2b6b]">{h.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day-By-Day Itinerary */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Day-By-Day Itinerary</h2>
                            <button
                                onClick={() => { setEditingCity(activeCity); setEditingSlot(null); setIsItineraryModalOpen(true); }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a2b6b] border border-[#1a2b6b]/30 px-3.5 py-1.5 rounded-xl hover:bg-[#1a2b6b]/5 transition-all"
                            >
                                <Pencil size={12} strokeWidth={2} /> Full Itinerary Edit
                            </button>
                        </div>

                        <div className="p-6">
                            {/* City tabs */}
                            <div className="flex gap-3 mb-6 bg-gray-50 p-1.5 rounded-2xl inline-flex flex-wrap">
                                {displayCities.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleCityChange(city)}
                                        className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all ${activeCity === city ? 'bg-[#1a2b6b] text-white shadow-lg shadow-[#1a2b6b]/20 scale-[1.02]' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <span className="text-base">📍</span>
                                        {city}
                                        <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${activeCity === city ? 'bg-white/20' : 'bg-gray-200'}`}>
                                            {normalisedItinerary
                                                ? (normalisedItinerary[city]?.length ?? 0)
                                                : (city === 'Bangkok' ? '5' : '7')}d
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Day selector */}
                            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                {cityDays.map((d: any) => (
                                    <button
                                        key={d.day}
                                        onClick={() => setActiveDay(d.day)}
                                        className={`min-w-[70px] text-xs font-extrabold px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${activeDay === d.day ? 'bg-[#1a2b6b] text-white border-[#1a2b6b] shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'}`}
                                    >
                                        <span className="uppercase tracking-tighter text-[9px] opacity-70">Day</span>
                                        <span className="text-base">{d.day}</span>
                                    </button>
                                ))}
                            </div>

                            {/* FIX 5: Guard the whole activity block against null dayData */}
                            {dayData ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                                        const activity = dayData[period];
                                        // FIX 6: Skip rendering if a period is missing from the data
                                        if (!activity) return null;
                                        return (
                                            <div key={period} className="relative">
                                                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-white border border-gray-100 rounded-full z-10 shadow-sm">
                                                    <p className="text-[10px] font-extrabold text-[#1a2b6b] tracking-wider uppercase">{period}</p>
                                                </div>
                                                <div className="bg-[#f8f9ff] hover:bg-white rounded-2xl p-6 pt-7 border border-gray-100 min-h-[180px] flex flex-col transition-all hover:shadow-lg hover:border-[#1a2b6b]/10 group">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1a2b6b] transition-colors">{activity.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{activity.desc}</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-4">
                                                            {activity.duration && (
                                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">⌛ {activity.duration}</span>
                                                            )}
                                                            {(activity.tags as any[]).map((t: any) => (
                                                                <Tag key={t.label} label={t.label} color={t.color} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <EditBtn onClick={() => {
                                                            setEditingCity(activeCity);
                                                            setEditingSlot({ day: dayData.day, period });
                                                            setIsItineraryModalOpen(true);
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    No itinerary data available for this day.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meal Plan */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Meal Plan Breakdown</h2>
                            <button
                                onClick={() => setIsMealModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a2b6b] border border-[#1a2b6b]/30 px-3.5 py-1.5 rounded-xl hover:bg-[#1a2b6b]/5 transition-all"
                            >
                                <Pencil size={12} strokeWidth={2} /> Edit Meals
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {displayMealPlan.map((m: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <p className="text-[10px] font-black text-[#1a2b6b] tracking-widest uppercase mb-3">{m.city}</p>
                                    <p className="text-sm font-bold text-gray-800 leading-snug">{m.plan}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Meal Preference applied</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── INTEGRATED TRIP SUMMARY ── */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mt-4">
                        <div className="bg-[#1a2b6b] px-8 py-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Trip Final Summary</h2>
                            <span className="text-[10px] font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">Pricing Breakdown</span>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Travelers &amp; Type</p>
                                    {[
                                        { label: 'Destinations', value: aiPlan?.destinations ?? 'Bangkok + Colombo' },
                                        { label: 'Date Range', value: aiPlan?.dateRange ?? '16 nights' },
                                        { label: 'Passengers', value: aiPlan?.passengers ?? '2 Adults' },
                                        { label: 'Cabin Class', value: 'Economy' },
                                        { label: 'Experience', value: aiPlan?.tier ?? 'Standard' },
                                    ].map((r) => (
                                        <div key={r.label} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{r.label}</span>
                                            <span className="font-bold text-gray-800">{r.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Cost Details</p>
                                    {[
                                        { label: 'Flights', value: aiPlan?.flights?.length ? `${aiPlan.flights.length} flights included` : 'Round-trip Flights' },
                                        { label: 'Accommodation', value: aiPlan?.hotels?.length ? `${aiPlan.hotels.length} hotels included` : 'Nights included' },
                                        { label: 'Activities', value: aiPlan?.activities?.length ? `${aiPlan.activities.length} activities planned` : 'Curated Activities' },
                                        { label: 'Meal Plan', value: aiPlan?.mealPlan?.length ? 'Full breakdown below' : 'Planned Meals' },
                                        { label: 'Plan Version', value: aiPlan?.planType || 'AI Draft' },
                                    ].map((r) => (
                                        <div key={r.label} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{r.label}</span>
                                            <span className="font-bold text-gray-700">{r.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#f8f9ff] rounded-2xl p-6 flex flex-col justify-between border border-[#1a2b6b]/5">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-gray-600 font-bold text-sm uppercase tracking-tight">Estimated Total</span>
                                            <span className="text-3xl font-black text-[#1a2b6b]">
                                                {aiPlan?.estimatedCost
                                                    ? aiPlan.estimatedCost.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
                                                    : '£5,400'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`rounded-full p-0.5 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}>
                                                {isOverBudget ? <X size={10} className="text-white" strokeWidth={3} /> : <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <p className={`text-[11px] font-extrabold uppercase tracking-widest ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                                {isOverBudget
                                                    ? `Over your ${aiPlan?.budget?.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })} budget`
                                                    : `Within your ${aiPlan?.budget?.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }) || '£6,000'} budget`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <button
                                            className="w-full py-4 rounded-xl text-white font-extrabold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#1a2b6b]/20"
                                            style={{ background: '#1a2b6b' }}
                                            onClick={() => setIsSummaryModalOpen(true)}
                                        >
                                            <CheckCircle2 size={20} strokeWidth={3} />
                                            Confirm & Book Now
                                        </button>
                                        <button
                                            className="w-full py-3 rounded-xl text-gray-500 text-sm font-bold border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all"
                                            onClick={() => navigate('/leisure-plan/create')}
                                        >
                                            ← Adjust Plan Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div >

            <FlightOptionsModal
                isOpen={isFlightModalOpen}
                onClose={() => setIsFlightModalOpen(false)}
                onSave={handleSaveFlights}
            />
            <HotelOptionsModal
                isOpen={isHotelModalOpen}
                onClose={() => {
                    setIsHotelModalOpen(false);
                    setEditingCity(null);
                }}
                onSave={handleSaveHotels}
                selectedCity={editingCity}
                plan={aiPlan}
                budgetPerNight={aiPlan?.budget ? Math.round(aiPlan.budget / (aiPlan?.legs?.reduce((acc, l) => acc + parseInt(l.days), 0) || 1)) : 150}
                adults={parseInt(aiPlan?.passengers?.split(' ')[0] || '1')}
                children={parseInt(aiPlan?.passengers?.split('Child')[0]?.split('Adults')[1]?.trim() || '0')}
                infants={parseInt(aiPlan?.passengers?.split('Infants')[0]?.split('Children')[1]?.trim() || '0')}
            />
            <ItineraryOptionsModal
                isOpen={isItineraryModalOpen}
                onClose={() => { setIsItineraryModalOpen(false); setEditingCity(null); setEditingSlot(null); }}
                onSave={handleSaveActivities}
                selectedCity={editingCity}
                isSingleSelect={!!editingSlot}
                plan={aiPlan}
                adults={parseInt(aiPlan?.passengers?.split(' ')[0] || '1')}
                children={parseInt(aiPlan?.passengers?.split('Child')[0]?.split('Adults')[1]?.trim() || '0')}
            />
            <MealPlanModal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                plan={aiPlan}
                cities={displayCities}
                onSave={handleSaveMealPlan}
            />
            <BookingSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                plan={displayPlan}
                onSave={handleSavePlan}
                onSaveOnly={handleSaveOnly}
                isEditing={isEditing}
                planId={planId}
            />
        </DashboardLayout >
    );
}