import React from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface AIMealPlanOption {
    boardType: string;
    description: string;
    pricePerNight: string;
    recommended: boolean;
}

interface AIDestinationMealPlan {
    city: string;
    nights: string;
    hotel: string;
    options: AIMealPlanOption[];
}

interface MealPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    plan?: any;
    cities?: string[];
}

const GROQ_API_KEY = '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';
const dietaryOptions = ['No restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Gluten free', 'Nut allergy'];
const boardOptions = ['Room only', 'Bed & breakfast', 'Half board', 'Full board', 'All inclusive'];

async function fetchMealPlans(plan: any, cities: string[]): Promise<AIDestinationMealPlan[]> {
    const destinations = cities.length > 0
        ? cities.join(', ')
        : (plan?.destinations || 'the destination');

    const prompt = `Generate meal plan options for a luxury travel itinerary visiting: ${destinations}.
For each city, suggest board types based on real hotels typically found there.
Return ONLY a JSON array, no markdown:
[
  {
    "city": "Bangkok",
    "nights": "5 NIGHTS",
    "hotel": "Anantara Riverside Bangkok",
    "options": [
      {"boardType": "Bed & breakfast", "description": "Start the day with a lavish buffet breakfast", "pricePerNight": "£18", "recommended": true},
      {"boardType": "Half board", "description": "Breakfast plus dinner at the hotel restaurant", "pricePerNight": "£35", "recommended": false},
      {"boardType": "Full board", "description": "All three meals included", "pricePerNight": "£55", "recommended": false}
    ]
  }
]
Include ${cities.length > 0 ? cities.length : 2} destination objects matching exactly these cities: ${destinations}.`;

    try {
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a luxury travel expert. Return ONLY valid JSON array.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            },
            { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
        );

        let content: string = groqResponse.data.choices[0].message.content;
        if (content.includes('```json')) content = content.split('```json')[1].split('```')[0].trim();
        else if (content.includes('```')) content = content.split('```')[1].split('```')[0].trim();

        return JSON.parse(content);
    } catch {
        // Sensible fallback if AI fails
        return cities.map((city, i) => ({
            city,
            nights: `${(i + 1) * 3} NIGHTS`,
            hotel: `${city} Hotel`,
            options: boardOptions.slice(0, 3).map((b, j) => ({
                boardType: b,
                description: `Standard ${b.toLowerCase()} arrangement at the hotel`,
                pricePerNight: `£${10 + j * 10}`,
                recommended: j === 1
            }))
        }));
    }
}

export default function MealPlanModal({ isOpen, onClose, onSave, plan, cities = [] }: MealPlanModalProps) {
    const [mealPlans, setMealPlans] = React.useState<AIDestinationMealPlan[]>([]);
    const [selectedBoards, setSelectedBoards] = React.useState<Record<string, string>>({});
    const [dietary, setDietary] = React.useState<string[]>(['No restrictions']);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setMealPlans([]);
            setIsLoading(true);
            fetchMealPlans(plan, cities)
                .then(data => {
                    setMealPlans(data);
                    // Auto-select recommended board per city
                    const defaults: Record<string, string> = {};
                    data.forEach(dest => {
                        const recommended = dest.options.find(o => o.recommended) || dest.options[0];
                        if (recommended) defaults[dest.city] = recommended.boardType;
                    });
                    setSelectedBoards(defaults);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleDietary = (opt: string) => {
        if (opt === 'No restrictions') { setDietary(['No restrictions']); return; }
        setDietary(prev => {
            const filtered = prev.filter(i => i !== 'No restrictions');
            if (filtered.includes(opt)) {
                const next = filtered.filter(i => i !== opt);
                return next.length === 0 ? ['No restrictions'] : next;
            }
            return [...filtered, opt];
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden font-poppins">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Edit meal plan</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Customise board type per destination · Dietary preferences</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 scrollbar-hide bg-[#fcfcfc]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#1a2b6b] border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium">Building personalised meal plans for your destinations...</p>
                        </div>
                    ) : (
                        <>
                            {/* Per-destination meal plan sections */}
                            {mealPlans.map(dest => (
                                <div key={dest.city} className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
                                            {dest.city.toUpperCase()} · {dest.nights} · {dest.hotel.toUpperCase()}
                                        </h3>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{dest.city} meal plan</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">{dest.hotel}</p>
                                            </div>
                                            {dest.options.find(o => o.boardType === selectedBoards[dest.city]) && (
                                                <p className="text-sm font-black text-gray-900">
                                                    from {dest.options.find(o => o.boardType === selectedBoards[dest.city])!.pricePerNight}/night
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {dest.options.map(opt => (
                                                <button
                                                    key={opt.boardType}
                                                    onClick={() => setSelectedBoards(prev => ({ ...prev, [dest.city]: opt.boardType }))}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedBoards[dest.city] === opt.boardType ? 'bg-[#1a2b6b] text-white border-[#1a2b6b] shadow-md shadow-[#1a2b6b]/20' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
                                                >
                                                    {opt.boardType}
                                                    {opt.recommended && <span className="ml-1 text-[9px] opacity-70">★</span>}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedBoards[dest.city] && (
                                            <p className="text-[11px] text-gray-400 mt-3">
                                                {dest.options.find(o => o.boardType === selectedBoards[dest.city])?.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Dietary Preferences */}
                            <div className="space-y-5 pb-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">DIETARY PREFERENCES</h3>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4">Select any that apply</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dietaryOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => toggleDietary(opt)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${dietary.includes(opt) ? 'bg-[#1a2b6b] text-white border-[#1a2b6b] shadow-md shadow-[#1a2b6b]/20' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} className="px-8 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ mealPlans, selectedBoards, dietary })}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-[#1a2b6b] text-white text-sm font-bold shadow-lg shadow-[#1a2b6b]/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Save meal plan
                    </button>
                </div>
            </div>
            <style>{`
                .font-poppins { font-family: 'Poppins', sans-serif; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
