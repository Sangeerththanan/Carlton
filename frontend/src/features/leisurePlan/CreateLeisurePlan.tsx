import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Calendar, ClipboardList, Minus, Plus, Loader2, Plane } from 'lucide-react';
import { leisurePlanService } from './services/leisurePlanApi';
import type { AILeisurePlanRequest } from './services/leisurePlanApi';

const poppins: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };


/*Toggle-chip button */
function Chip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${selected
                ? 'bg-[#1a2b6b] text-white border-[#1a2b6b]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
        >
            {label}
        </button>
    );
}

/*Passengers and Room Preferences */
function CounterRow({
    label,
    sub,
    value,
    onChange,
}: {
    label: string;
    sub: string;
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-[#e8dfc8] last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(0, value - 1))}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                    <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-gray-800">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                    <Plus size={12} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

/* Section card wrapper */
function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            {children}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-base font-bold text-gray-900 mb-4">{children}</h3>;
}

/*Static options*/

const transportOptions = [
    'Private Van',
    'Private Taxi',
    'Shared Shuttle',
    'Public Transit',
    'Rental Car',
    'Motorbike Rental',
    'Airport Transit',
    'Tuk-tuk/local',
];

const experienceOptions = [
    'Beach & Swim',
    'Beauty & grooming',
    'Yoga retreats',
    'Food & Dining',
    'Nature & hiking',
    'Spa & massage',
    'Culture & History',
    'Night Life',
    'Adventure Sports',
    'Safari & Wildlife',
    'Cruise',
    'Shopping',
    'Fitness & gym',
];

const specialReqOptions = [
    'Wheel Chair access',
    'Hearing Assistance',
    'Visual impairment aid',
    'Traveling with Pet',
    'Dietary Restrictions',
    'Infant Bassinet',
    'Medical Equipment',
    'Extra Legroom Seats',
];

const mealOptions = [
    'No Preference',
    'Bed & Breakfast',
    'All Inclusive',
    'Vegetarian',
    'Half Board',
    'Vegan',
    'Full Board',
    'Halal',
    'Pescatarian',
    'Eggetarian',
    'Spicy',
    'Mild',
];

/* Types */

interface Destination {
    id: number;
    country: string;
    days: string;
}

/* Main Component  */

export default function CreateLeisurePlan() {
    const navigate = useNavigate();

    //Destinations
    const [destinations, setDestinations] = useState<Destination[]>([
        { id: 1, country: '', days: '' },
    ]);

    const [departure, setDeparture] = useState('London (LHR)');

    const addDestination = () =>
        setDestinations((prev) => [
            ...prev,
            { id: prev.length + 1, country: '', days: '' },
        ]);

    const updateDest = (id: number, field: 'country' | 'days', value: string) =>
        setDestinations((prev) =>
            prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
        );

    //Budget 
    const [budgetType, setBudgetType] = useState('Maximum');
    const [currency, setCurrency] = useState('USD');
    const [budget, setBudget] = useState(220);

    //Transport
    const [selectedTransport, setSelectedTransport] = useState<string[]>([]);
    const toggleTransport = (o: string) =>
        setSelectedTransport((prev) =>
            prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
        );

    // Experiences
    const [selectedExp, setSelectedExp] = useState<string[]>([]);
    const toggleExp = (o: string) =>
        setSelectedExp((prev) =>
            prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
        );

    // Special Requirements
    const [selectedReq, setSelectedReq] = useState<string[]>([]);
    const toggleReq = (o: string) =>
        setSelectedReq((prev) =>
            prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
        );
    const [mainNotes, setMainNotes] = useState('');
    const [reqNotes, setReqNotes] = useState('');

    // Date Range
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Passengers
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    // Room Preferences
    const [singleRoom, setSingleRoom] = useState(0);
    const [twinRoom, setTwinRoom] = useState(0);
    const [doubleRoom, setDoubleRoom] = useState(0);
    const [tripleRoom, setTripleRoom] = useState(0);
    const [familyRoom, setFamilyRoom] = useState(0);
    const [suite, setSuite] = useState(0);
    const [dormitory, setDormitory] = useState(0);

    // Meal Preferences
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const toggleMeal = (o: string) =>
        setSelectedMeals((prev) =>
            prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
        );
    const [mealNotes, setMealNotes] = useState('');

    // AI Generation
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreatePlan = async () => {
        setIsGenerating(true);
        try {
            const request: AILeisurePlanRequest = {
                destinations: destinations.map(d => ({
                    country: d.country,
                    days: parseInt(d.days) || 0
                })),
                budget,
                currency,
                departureAirport: departure,
                localTransportation: selectedTransport,
                experiences: selectedExp,
                specialRequirements: selectedReq,
                additionalNotes: mainNotes + "\n" + reqNotes,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                adults,
                children,
                infants,
                mealPreferences: selectedMeals,
                singleRooms: singleRoom,
                twinRooms: twinRoom,
                doubleRooms: doubleRoom,
                tripleRooms: tripleRoom,
                familyRooms: familyRoom,
                suites: suite,
                dormitories: dormitory
            };

            const generatedPlan = await leisurePlanService.generateAIPlan(request);

            // Navigate to results page with the generated data
            navigate('/leisure-plan/result', { state: { plan: generatedPlan } });
        } catch (error) {
            console.error('Error generating AI plan:', error);
            alert('Failed to generate AI plan. Please check your connection and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Derived
    const totalPassengers = adults + children + infants;
    const totalRooms =
        singleRoom + twinRoom + doubleRoom + tripleRoom + familyRoom + suite + dormitory;

    const formatDate = (d: string) => {
        if (!d) return '';
        const [y, m, day] = d.split('-');
        return `${m}/${day}/${y}`;
    };

    /* Render */
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#f0f2f8] px-6 py-6" style={poppins}>
                <div className="mb-2">
                    <h1 className="text-3xl font-extrabold text-[#1a2b6b]">Leisure Plan</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Plan your journey, book automatically at the best price.
                    </p>
                </div>
                <br></br>

                <div className="flex items-center gap-2 mb-6 mt-3">
                    <div className="w-6 h-6 rounded-full bg-[#1a2b6b] flex items-center justify-center">
                        <ArrowLeft
                            size={13}
                            strokeWidth={2.5}
                            className="text-white cursor-pointer"
                            onClick={() => navigate('/leisure-plan/packages')}
                        />
                    </div>
                    <h2 className="text-xl font-bold text-[#1a2b6b]">Create A New Leisure Plan</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* LEFT COLUMN  */}
                    <div className="flex-1 min-w-0">

                        {/* Departure */}
                        <Card>
                            <SectionTitle>Departure (from)</SectionTitle>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">City or Airport</label>
                                <div className="relative">
                                    <Plane
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30"
                                        placeholder="e.g. London (LHR)"
                                        value={departure}
                                        onChange={(e) => setDeparture(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Destinations */}
                        <Card>
                            <SectionTitle>Destinations</SectionTitle>
                            {destinations.map((dest, idx) => (
                                <div key={dest.id} className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Destination {idx + 1}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Country / City</label>
                                            <input
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30"
                                                placeholder=""
                                                value={dest.country}
                                                onChange={(e) => updateDest(dest.id, 'country', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Total Days</label>
                                            <input
                                                type="number"
                                                min={1}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30"
                                                placeholder=""
                                                value={dest.days}
                                                onChange={(e) => updateDest(dest.id, 'days', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addDestination}
                                className="w-full py-2.5 rounded-lg text-sm font-medium text-[#1a2b6b] border border-[#c5cef0] bg-[#eef1fb] hover:bg-[#dde3f7] transition-colors mt-1"
                            >
                                + Add Destination
                            </button>
                        </Card>

                        {/* Budget */}
                        <Card>
                            <SectionTitle>Budget</SectionTitle>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Budget Type</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 bg-white"
                                        value={budgetType}
                                        onChange={(e) => setBudgetType(e.target.value)}
                                    >
                                        <option>Maximum</option>
                                        <option>Fixed</option>
                                        <option>Flexible</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Currency</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 bg-white"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="GBP">GBP</option>
                                        <option value="EUR">EUR</option>
                                        <option value="AED">AED</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-gray-400">Maximum Budget</label>
                                    <span className="text-sm font-semibold text-gray-700">$ {budget}</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={10000}
                                    step={10}
                                    value={budget}
                                    onChange={(e) => setBudget(Number(e.target.value))}
                                    className="w-full accent-[#1a2b6b]"
                                />
                            </div>
                        </Card>

                        {/* Local Transportation */}
                        <Card>
                            <SectionTitle>Local Transportation</SectionTitle>
                            <div className="flex flex-wrap gap-2">
                                {transportOptions.map((o) => (
                                    <Chip
                                        key={o}
                                        label={o}
                                        selected={selectedTransport.includes(o)}
                                        onClick={() => toggleTransport(o)}
                                    />
                                ))}
                            </div>
                        </Card>

                        {/* Experiences */}
                        <Card>
                            <SectionTitle>Experiences</SectionTitle>
                            <div className="flex flex-wrap gap-2">
                                {experienceOptions.map((o) => (
                                    <Chip
                                        key={o}
                                        label={o}
                                        selected={selectedExp.includes(o)}
                                        onClick={() => toggleExp(o)}
                                    />
                                ))}
                            </div>
                        </Card>

                        {/* Additional Notes (main) */}
                        <Card>
                            <SectionTitle>Additional Notes</SectionTitle>
                            <textarea
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 resize-none"
                                placeholder="Any Other Special needs or requests..."
                                value={mainNotes}
                                onChange={(e) => setMainNotes(e.target.value)}
                            />
                        </Card>

                        {/* Special Requirements */}
                        <Card>
                            <SectionTitle>Special Requirements</SectionTitle>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {specialReqOptions.map((o) => (
                                    <Chip
                                        key={o}
                                        label={o}
                                        selected={selectedReq.includes(o)}
                                        onClick={() => toggleReq(o)}
                                    />
                                ))}
                            </div>

                            <SectionTitle>Additional Notes</SectionTitle>
                            <textarea
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 resize-none"
                                placeholder="Any Other Special needs or requests..."
                                value={reqNotes}
                                onChange={(e) => setReqNotes(e.target.value)}
                            />
                        </Card>

                        {/* Date Range */}
                        <Card>
                            <SectionTitle>Date Range</SectionTitle>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 block">From Date</label>
                                    <div className="relative">
                                        <Calendar
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 bg-white"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1.5 block">To Date</label>
                                    <div className="relative">
                                        <Calendar
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 bg-white"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {(fromDate || toDate) && (
                                <div className="py-2.5 px-4 rounded-lg bg-[#fdf8ee] border border-[#e8d9b0] text-sm text-gray-700 text-center">
                                    Selected Date Range [{formatDate(fromDate)} -{' '}
                                    {formatDate(toDate) || '?'}]
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT COLUMN  */}
                    <div className="lg:w-80 xl:w-96 flex-shrink-0">

                        {/* Passengers */}
                        <div
                            className="rounded-2xl border border-gray-100 shadow-sm p-5 mb-5"
                            style={{ background: '#fdf6e8' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Passengers</h3>
                                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                                    {totalPassengers} Total
                                </span>
                            </div>
                            <CounterRow label="Adults" sub="12+" value={adults} onChange={setAdults} />
                            <CounterRow label="Children" sub="Age 2-11" value={children} onChange={setChildren} />
                            <CounterRow label="Infants" sub="Under 2" value={infants} onChange={setInfants} />
                        </div>

                        {/* Room Preferences */}
                        <div
                            className="rounded-2xl border border-gray-100 shadow-sm p-5 mb-5"
                            style={{ background: '#fdf6e8' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Room Preferences</h3>
                                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                                    {totalRooms} Total
                                </span>
                            </div>
                            <CounterRow label="Single Room" sub="1 Person" value={singleRoom} onChange={setSingleRoom} />
                            <CounterRow label="Twin Room" sub="2 Single Beds" value={twinRoom} onChange={setTwinRoom} />
                            <CounterRow label="Double Room" sub="2 People" value={doubleRoom} onChange={setDoubleRoom} />
                            <CounterRow label="Triple Room" sub="3 People" value={tripleRoom} onChange={setTripleRoom} />
                            <CounterRow label="Family Room" sub="2 Adults + Up to 2 children" value={familyRoom} onChange={setFamilyRoom} />
                            <CounterRow label="Suite" sub="1-2 People" value={suite} onChange={setSuite} />
                            <CounterRow label="Dormitory" sub="1 Person Shared Room" value={dormitory} onChange={setDormitory} />
                        </div>

                        {/* Meal Preferences */}
                        <div
                            className="rounded-2xl border border-gray-100 shadow-sm p-5"
                            style={{ background: '#fdf6e8' }}
                        >
                            <h3 className="text-base font-bold text-gray-900 mb-3">Meal Preferences</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {mealOptions.map((o) => (
                                    <Chip
                                        key={o}
                                        label={o}
                                        selected={selectedMeals.includes(o)}
                                        onClick={() => toggleMeal(o)}
                                    />
                                ))}
                            </div>

                            <h3 className="text-base font-bold text-gray-900 mb-2">Additional Notes</h3>
                            <textarea
                                rows={4}
                                className="w-full border border-[#e8d9b0] rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b]/30 resize-none bg-white"
                                placeholder="Any Other Special needs or requests..."
                                value={mealNotes}
                                onChange={(e) => setMealNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 mb-8">
                    <button
                        type="button"
                        disabled={isGenerating}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-base font-semibold transition-opacity active:opacity-80 ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                            }`}
                        style={{ background: '#1a2b6b' }}
                        onClick={handleCreatePlan}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Generating Your Plan...
                            </>
                        ) : (
                            <>
                                <ClipboardList size={20} strokeWidth={1.8} />
                                Create My Leisure Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
