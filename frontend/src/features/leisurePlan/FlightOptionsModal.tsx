import React from 'react';
import { X, Plane, Wifi, Briefcase, Utensils } from 'lucide-react';

interface Flight {
    id: string;
    airline: string;
    model: string;
    code: string;
    from: string;
    to: string;
    dep: string;
    arr: string;
    duration: string;
    stops: string;
    price: string;
    class: string;
    features: string[];
}

interface FlightLeg {
    title: string;
    route: string;
    date: string;
    options: Flight[];
    selectedId: string;
}

interface FlightOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedFlights: Record<string, string>) => void;
}

const mockLegs: FlightLeg[] = [
    {
        title: 'OUTBOUND FLIGHTS',
        route: 'LHR → BKK',
        date: '02 JUL 2026',
        selectedId: 'f1',
        options: [
            {
                id: 'f1',
                airline: 'Emirates',
                model: 'Boeing 777-300ER',
                code: 'EK 236',
                from: 'LHR',
                to: 'BKK',
                dep: '08:45',
                arr: '23:15',
                duration: '9h 30m',
                stops: 'Direct · no stops',
                price: '£820/pp',
                class: 'Economy',
                features: ['Economy class', '30kg baggage', 'Meal served', 'Wi-Fi'],
            },
            {
                id: 'f2',
                airline: 'SriLankan Airlines',
                model: 'Airbus A330',
                code: 'UL 228',
                from: 'LHR',
                to: 'BKK',
                dep: '08:30',
                arr: '22:00',
                duration: '10h 30m',
                stops: '1 stop · CMB',
                price: '£520/pp',
                class: 'Economy',
                features: ['Economy class', '23kg baggage', 'Meal served'],
            },
            {
                id: 'f3',
                airline: 'Emirates',
                model: 'Boeing 777',
                code: 'EK 238',
                from: 'LHR',
                to: 'BKK',
                dep: '01:30',
                arr: '17:15',
                duration: '11h 45m',
                stops: 'Direct · no stops',
                price: '£1,240/pp',
                class: 'Business',
                features: ['Business class', '30kg baggage', 'Meal served', 'Wi-Fi'],
            },
        ],
    },
    {
        title: 'CONNECTING FLIGHT',
        route: 'BKK → CMB',
        date: '07 JUL 2026',
        selectedId: 'f4',
        options: [
            {
                id: 'f4',
                airline: 'SriLankan Airlines',
                model: 'Airbus A330',
                code: 'UL 404',
                from: 'BKK',
                to: 'CMB',
                dep: '09:00',
                arr: '10:45',
                duration: '3h 40m',
                stops: 'Direct · no stops',
                price: '£280/pp',
                class: 'Economy',
                features: ['Economy class', '30kg baggage', 'Meal served'],
            },
            {
                id: 'f5',
                airline: 'Thai Airways',
                model: 'Boeing 787',
                code: 'TG 465',
                from: 'BKK',
                to: 'CMB',
                dep: '14:20',
                arr: '16:15',
                duration: '3h 50m',
                stops: 'Direct · no stops',
                price: '£310/pp',
                class: 'Economy',
                features: ['Economy class', '30kg baggage', 'Meal served', 'Wi-Fi'],
            },
        ],
    },
    {
        title: 'RETURN FLIGHTS',
        route: 'CMB → LHR',
        date: '16 JUL 2026',
        selectedId: 'f6',
        options: [
            {
                id: 'f6',
                airline: 'SriLankan Airlines',
                model: 'Airbus A330',
                code: 'UL 501',
                from: 'CMB',
                to: 'LHR',
                dep: '02:10',
                arr: '09:00',
                duration: '10h 50m',
                stops: 'Direct · no stops',
                price: '£420/pp',
                class: 'Economy',
                features: ['Economy class', '30kg baggage', 'Meal served'],
            },
        ],
    },
];

export default function FlightOptionsModal({ isOpen, onClose, onSave }: FlightOptionsModalProps) {
    const [selectedIds, setSelectedIds] = React.useState<Record<string, string>>({
        'OUTBOUND FLIGHTS': 'f1',
        'CONNECTING FLIGHT': 'f4',
        'RETURN FLIGHTS': 'f6',
    });

    if (!isOpen) return null;

    const handleSelect = (legTitle: string, flightId: string) => {
        setSelectedIds((prev) => ({ ...prev, [legTitle]: flightId }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-[#f8faff] w-full max-w-5xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/20">

                {/* Header */}
                <div className="bg-white px-8 py-6 flex items-start justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">London → Bangkok → Colombo</h2>
                        <p className="text-sm text-gray-400 mt-1">Select flights for each leg of your journey</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Info Bar */}
                <div className="px-8 py-4">
                    <div className="bg-[#eef2ff] rounded-xl px-6 py-4 flex flex-wrap gap-8 items-center border border-blue-100/50">
                        {[
                            { label: 'Departure', value: '02 Jul 2026' },
                            { label: 'Return', value: '16 Jul 2026' },
                            { label: 'Duration', value: '16 Nights' },
                            { label: 'Passengers', value: '2 adults · 1 child' },
                            { label: 'Budget', value: 'Max £6,000' },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{item.label}</p>
                                <p className="text-sm font-bold text-gray-800">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 scrollbar-hide">
                    {mockLegs.map((leg) => (
                        <div key={leg.title} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[12px] font-black text-blue-900 tracking-widest uppercase">
                                    {leg.title} — {leg.route} · {leg.date}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {leg.options.map((flight) => {
                                    const isSelected = selectedIds[leg.title] === flight.id;
                                    return (
                                        <div
                                            key={flight.id}
                                            onClick={() => handleSelect(leg.title, flight.id)}
                                            className={`relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer group ${isSelected ? 'border-[#1a2b6b] shadow-md ring-1 ring-[#1a2b6b]/10' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 bg-[#1a2b6b] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                    Selected
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-medium text-gray-400">
                                                        {flight.airline} · {flight.model} · {flight.code}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    {/* Departure */}
                                                    <div className="text-left w-20">
                                                        <p className="text-2xl font-extrabold text-gray-900 leading-none">{flight.from}</p>
                                                        <p className="text-sm font-bold text-gray-700 mt-1">{flight.dep} · T1</p>
                                                    </div>

                                                    {/* Timeline */}
                                                    <div className="flex-1 flex flex-col items-center justify-center">
                                                        <p className="text-[11px] font-bold text-gray-400 mb-2">{flight.duration}</p>
                                                        <div className="w-full relative flex items-center">
                                                            <div className="w-2 h-2 rounded-full bg-[#1a2b6b] flex-shrink-0" />
                                                            <div className="flex-1 h-px bg-gray-200 dashed mx-1" style={{ borderTop: '1px dashed #e2e8f0' }} />
                                                            <Plane size={14} className="text-[#1a2b6b] rotate-90 mx-1" />
                                                            <div className="flex-1 h-px bg-gray-200 dashed mx-1" style={{ borderTop: '1px dashed #e2e8f0' }} />
                                                            <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#1a2b6b] flex-shrink-0" />
                                                        </div>
                                                        <p className="text-[10px] font-medium text-gray-400 mt-2">{flight.stops}</p>
                                                    </div>

                                                    {/* Arrival */}
                                                    <div className="text-right w-20">
                                                        <p className="text-2xl font-extrabold text-gray-900 leading-none">{flight.to}</p>
                                                        <p className="text-sm font-bold text-gray-700 mt-1">{flight.arr} · T3</p>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right ml-4 min-w-[80px]">
                                                        <p className="text-lg font-black text-gray-900">{flight.price}</p>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{flight.class}</p>
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 mt-1">
                                                    {flight.features.map(feature => (
                                                        <span key={feature} className="text-[11px] font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1.5 capitalize">
                                                            {feature.toLowerCase().includes('wifi') && <Wifi size={11} />}
                                                            {feature.toLowerCase().includes('baggage') && <Briefcase size={11} />}
                                                            {feature.toLowerCase().includes('meal') && <Utensils size={11} />}
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-white px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(selectedIds)}
                        className="px-8 py-3 rounded-xl bg-[#1a2b6b] text-white text-sm font-bold shadow-lg shadow-[#1a2b6b]/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Save changes
                    </button>
                </div>

            </div>
        </div>
    );
}
