import React from 'react';
import { X, Check } from 'lucide-react';
import { leisurePlanService, type AIActivityOptionDto } from './services/leisurePlanApi';

interface ItineraryOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedActivities: AIActivityOptionDto[]) => void;
    initialSelectedIds?: string[];
    selectedCity: string | null;
    plan?: any;
    adults?: number;
    children?: number;
    isSingleSelect?: boolean;
}

export default function ItineraryOptionsModal({
    isOpen,
    onClose,
    onSave,
    initialSelectedIds = [],
    selectedCity,
    plan,
    adults = 1,
    children = 0,
    isSingleSelect = false
}: ItineraryOptionsModalProps) {
    const [selectedIds, setSelectedIds] = React.useState<string[]>(initialSelectedIds);
    const [activities, setActivities] = React.useState<AIActivityOptionDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen && selectedCity) {
            setActivities([]);
            setError(null);
            fetchActivities(selectedCity);
        }
    }, [isOpen, selectedCity]);

    const fetchActivities = async (city: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leisurePlanService.getAlternativeActivities({
                city,
                adults,
                children
            });
            setActivities(data);
        } catch (err: any) {
            console.error('Error fetching activities:', err);
            setError(err?.response?.data || err?.message || 'Failed to load activities');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const toggleSelection = (id: string) => {
        if (isSingleSelect) {
            setSelectedIds([id]);
        } else {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Edit activities</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Add or remove activities · {selectedCity} · {plan?.dateRange}
                        </p>
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
                            <p className="text-gray-500 font-medium">Finding best activities in {selectedCity}...</p>
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase">
                                    {selectedCity} ACTIVITIES
                                </h3>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {activities.map(activity => {
                                    const isSelected = selectedIds.includes(activity.id);
                                    return (
                                        <div
                                            key={activity.id}
                                            onClick={() => toggleSelection(activity.id)}
                                            className={`relative bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group hover:shadow-lg ${isSelected ? 'border-[#1a2b6b] ring-1 ring-[#1a2b6b]/10 shadow-md' : 'border-gray-100'}`}
                                        >
                                            <div className="h-32 relative overflow-hidden">
                                                <img
                                                    src={activity.imageUrl}
                                                    alt={activity.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors border shadow-sm ${isSelected ? 'bg-[#1a2b6b] border-[#1a2b6b]' : 'bg-white/80 border-white'}`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col min-h-[140px]">
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1a2b6b] transition-colors line-clamp-1">{activity.title}</h4>
                                                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 min-h-[32px]">{activity.description}</p>

                                                <div className="mt-auto pt-3">
                                                    <p className="text-sm font-black text-[#1a2b6b]">{activity.price}</p>
                                                    <div className="flex gap-1.5 mt-2">
                                                        {activity.tags.map(tag => (
                                                            <span
                                                                key={tag.label}
                                                                className="text-[9px] font-bold px-2 py-0.5 rounded-md text-gray-600 border border-black/5"
                                                                style={{ background: tag.color }}
                                                            >
                                                                {tag.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            {error ? (
                                <>
                                    <p className="text-red-400 font-medium">Could not load activities</p>
                                    <p className="text-gray-400 text-xs text-center max-w-sm">{error}</p>
                                    <button
                                        onClick={() => fetchActivities(selectedCity!)}
                                        className="mt-2 px-5 py-2 rounded-xl bg-[#1a2b6b] text-white text-sm font-bold hover:opacity-90 transition-all"
                                    >
                                        Retry
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-400">No activities found for {selectedCity}.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={onClose} className="px-7 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            const selected = activities.filter(a => selectedIds.includes(a.id));
                            onSave(selected);
                        }}
                        className="px-7 py-2.5 rounded-xl bg-[#1a2b6b] text-white text-sm font-bold shadow-lg shadow-[#1a2b6b]/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Save changes
                    </button>
                </div>
            </div>
        </div>
    );
}
