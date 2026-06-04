import React from 'react';
import { X, Calendar, MapPin, Users, CheckCircle2, Plane, Hotel, Clock, Utensils } from 'lucide-react';
import type { LeisurePlan } from './services/leisurePlanApi';
import StripePayButton from '../../components/StripePayButton';
import { useNavigate } from 'react-router-dom';

interface RecreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: LeisurePlan | null;
}

export default function RecreatePlanModal({ isOpen, onClose, plan }: RecreatePlanModalProps) {
    const navigate = useNavigate();

    if (!isOpen || !plan) return null;

    // Helper to flatten itinerary for display
    let flattenedItinerary: any[] = [];
    if (plan.itinerary && typeof plan.itinerary === 'object' && !Array.isArray(plan.itinerary)) {
        Object.entries(plan.itinerary).forEach(([city, days]: [string, any]) => {
            if (Array.isArray(days)) {
                days.forEach(day => {
                    flattenedItinerary.push({
                        ...day,
                        city,
                        displayDay: `Day ${day.day}`
                    });
                });
            }
        });
        // Sort by day number
        flattenedItinerary.sort((a, b) => a.day - b.day);
    } else if (Array.isArray(plan.itinerary)) {
        flattenedItinerary = plan.itinerary;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden font-poppins animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 bg-[#1a2b6b]">
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">Recreate Plan: {plan.title}</h2>
                        <p className="text-sm text-white/70 mt-1">Review the full details before booking again</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 bg-gray-50/50 scrollbar-hide">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Dates</p>
                                <p className="text-xs font-bold text-gray-900">{plan.dateRange}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Departure</p>
                                <p className="text-xs font-bold text-gray-900">{plan.departureAirport || 'LHR'}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Travelers</p>
                                <p className="text-xs font-bold text-gray-900">{plan.passengers}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Cost</p>
                                <p className="text-xs font-bold text-gray-900">£{plan.estimatedCost.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Flights & Hotels Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Flights */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#1a2b6b] flex items-center gap-2 uppercase tracking-wider">
                                <Plane size={18} className="rotate-45" /> Flights
                            </h3>
                            <div className="space-y-3">
                                {plan.flights && plan.flights.length > 0 ? plan.flights.map((f: any, idx: number) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">{f.date}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded">{f.code}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">{f.route}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{f.airline} · {f.dep} Departure</p>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No direct flights listed</p>}
                            </div>
                        </div>

                        {/* Hotels */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#1a2b6b] flex items-center gap-2 uppercase tracking-wider">
                                <Hotel size={18} /> Hotels
                            </h3>
                            <div className="space-y-3">
                                {plan.hotels && plan.hotels.length > 0 ? plan.hotels.map((h: any, idx: number) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-orange-500 uppercase">{h.city}</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(h.stars)].map((_, i) => (
                                                    <span key={i} className="text-amber-400 text-[10px]">★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">{h.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{h.nights} · {h.location}</p>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No hotel bookings listed</p>}
                            </div>
                        </div>
                    </div>

                    {/* Itinerary Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-[#1a2b6b] flex items-center gap-2 uppercase tracking-wider">
                            <Clock size={18} /> Daily Itinerary
                        </h3>
                        <div className="space-y-6 relative overflow-hidden">
                            {/* Vertical Line */}
                            <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gray-200" />

                            {flattenedItinerary.map((day: any, idx: number) => (
                                <div key={idx} className="flex gap-6 relative group">
                                    {/* Circle Marker */}
                                    <div className="w-[44px] h-[44px] rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center text-[#1a2b6b] text-xs font-bold shadow-sm z-10 group-hover:border-[#1a2b6b] transition-all">
                                        {day.day}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-sm font-black text-[#1a2b6b] uppercase tracking-wide">{day.city}</h4>
                                                <span className="text-[10px] font-bold text-gray-400">ACTIVITIES: {Object.keys(day).filter(k => ['morning', 'afternoon', 'evening'].includes(k)).length}</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {day.morning && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded tracking-tighter">MORNING</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-gray-900">{day.morning.title}</p>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed">{day.morning.desc}</p>
                                                    </div>
                                                )}
                                                {day.afternoon && (
                                                    <div className="space-y-2 border-l border-gray-50 md:pl-6">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] font-black bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded tracking-tighter">AFTERNOON</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-gray-900">{day.afternoon.title}</p>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed">{day.afternoon.desc}</p>
                                                    </div>
                                                )}
                                                {day.evening && (
                                                    <div className="space-y-2 border-l border-gray-50 md:pl-6">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded tracking-tighter">EVENING</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-gray-900">{day.evening.title}</p>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed">{day.evening.desc}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meal Plan & Activities Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Activities List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#1a2b6b] flex items-center gap-2 uppercase tracking-wider">
                                <CheckCircle2 size={18} /> Included Experiences
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {plan.activities.map((act, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-white border border-gray-100 text-[11px] font-bold text-gray-700 rounded-xl shadow-sm">
                                        {act}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Meal Plan */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#1a2b6b] flex items-center gap-2 uppercase tracking-wider">
                                <Utensils size={18} /> Dining Overview
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {plan.mealPlan && plan.mealPlan.length > 0 ? plan.mealPlan.map((m: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{m.city}</p>
                                        <p className="text-xs font-bold text-gray-900">{m.type}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 italic">"{m.description}"</p>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">Default breakfast included</p>}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                            <span className="text-xl font-black text-[#1a2b6b]">£{plan.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <StripePayButton
                                planTitle={plan.title || 'Leisure Plan'}
                                amount={plan.estimatedCost}
                                leisurePlanId={plan.id}
                                label={`Confirm & Book Again`}
                                wrapperClassName="shrink-0"
                                className="!w-auto !py-2.5 !px-6 !rounded-xl !shadow-lg shadow-blue-900/20 !text-sm !text-white !font-bold !bg-[#1a2b6b]"
                                hideBadge={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
        </div>
    );
}
