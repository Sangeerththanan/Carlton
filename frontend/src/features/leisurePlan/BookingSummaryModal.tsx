import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { AIFullLeisurePlan } from './services/leisurePlanApi';
import StripePayButton from '../../components/StripePayButton';

interface BookingSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: AIFullLeisurePlan | null;
    onSave: () => Promise<number | null | undefined> | void;
    onSaveOnly?: () => void;
    onConfirm?: () => void;
    isEditing?: boolean;
    planId?: number | null;
}

export default function BookingSummaryModal({ isOpen, onClose, plan, onSave, onSaveOnly, onConfirm, isEditing = false, planId }: BookingSummaryModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [resolvedPlanId, setResolvedPlanId] = useState<number | null>(planId ?? null);

    if (!isOpen) return null;
    if (!plan) return null;

    /**
     * Called by StripePayButton's onBeforeRedirect: save the plan first and
     * return the resolved plan ID so the success URL is correct.
     */
    const handleBeforeRedirect = async () => {
        if (onConfirm) {
            onConfirm();
            // Throw to stop StripePayButton from continuing to checkout
            throw new Error('__CONFIRM_ONLY__');
        }

        setIsSaving(true);
        const savedPlanId = await onSave();
        setIsSaving(false);
        const finalPlanId = savedPlanId || planId;

        if (!finalPlanId) {
            throw new Error('Unable to save plan. Please try again.');
        }

        setResolvedPlanId(finalPlanId);
        return finalPlanId;
    };

    // Map plan data to summary cards
    const summaryCards = [
        ...plan.flights.map(f => ({
            label: f.label,
            title: `${f.code} · ${f.route}`,
            sub: `${f.date} · ${f.airline} · ${f.dep}`
        })),
        { label: 'Passengers', title: plan.passengers, sub: 'Based on your request' },
        ...plan.hotels.map(h => ({
            label: h.city,
            title: h.name,
            sub: `${h.nights} · ${h.location} · ${h.stars}★`
        })),
        { label: 'Activities', title: `${plan.activities.length} included`, sub: plan.activities.slice(0, 4).join(', ') },
        { label: 'Booking ref', title: 'PENDING', sub: plan.tier + ' experience' },
    ];

    const pricing = [
        { item: 'Estimated Total', price: `£${plan.estimatedCost.toLocaleString()}` },
        { item: 'Included Items', price: 'Flights, Hotels, Activities' },
        { item: 'Tier', price: plan.tier },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden font-poppins">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-tight">{plan.title}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Review & confirm booking</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide container-bg">
                    {/* Info Bar */}
                    <div className="bg-[#f0f7ff] rounded-2xl px-8 py-5 flex flex-wrap items-center justify-between gap-6 border border-[#e0efff]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64a1e8] uppercase tracking-wider">Date Range</span>
                            <span className="text-sm font-bold text-[#1a2b6b]">{plan.dateRange}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64a1e8] uppercase tracking-wider">Plan Type</span>
                            <span className="text-sm font-bold text-[#1a2b6b]">{plan.planType}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64a1e8] uppercase tracking-wider">Status</span>
                            <span className="text-sm font-bold text-[#1a2b6b] text-amber-600">{plan.status}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64a1e8] uppercase tracking-wider">Passengers</span>
                            <span className="text-sm font-bold text-[#1a2b6b]">{plan.passengers}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64a1e8] uppercase tracking-wider">Budget</span>
                            <span className="text-sm font-bold text-[#1a2b6b]">£{plan.budget.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Booking Summary Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">BOOKING SUMMARY</h3>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summaryCards.map((card, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-[#1a2b6b]/20 transition-all">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-2">{card.label}</p>
                                    <h4 className="text-sm font-bold text-gray-900">{card.title}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Table */}
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 space-y-4">
                            {pricing.map((row, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">{row.item}</span>
                                    <span className="text-sm text-gray-900 font-bold">{row.price}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[#fff9e6] px-8 py-6 flex justify-between items-center border-t border-[#fbebc0]">
                            <span className="text-base font-black text-[#855e00] uppercase tracking-widest">Total Estimated</span>
                            <span className="text-xl font-black text-[#855e00]">£{plan.estimatedCost.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${plan.estimatedCost <= plan.budget ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                            {plan.estimatedCost <= plan.budget ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                            {plan.estimatedCost <= plan.budget ? `Within your £${plan.budget.toLocaleString()} budget` : `£${(plan.estimatedCost - plan.budget).toLocaleString()} over budget`}
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            Ref: <span className="text-gray-900">NEW-PLAN</span>
                        </p>
                    </div>

                    {/* Stripe Pay Button */}
                    <StripePayButton
                        planTitle={plan.title || 'Leisure Plan'}
                        amount={plan.estimatedCost}
                        leisurePlanId={resolvedPlanId ?? undefined}
                        label={`Confirm & book everything — £${plan.estimatedCost.toLocaleString()}`}
                        disabled={isSaving}
                        onBeforeRedirect={handleBeforeRedirect}
                    />

                    {/* Secondary Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                        <button className="flex items-center justify-center py-4 rounded-xl text-sm font-bold text-gray-600 border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
                            Download PDF
                        </button>
                        <button className="flex items-center justify-center py-4 rounded-xl text-sm font-bold text-[#1a2b6b] bg-[#ffe0bf] hover:bg-[#ffd5a8] transition-all">
                            Share plan
                        </button>
                        <button
                            onClick={onSaveOnly || onSave}
                            className="flex items-center justify-center py-4 rounded-xl text-sm font-bold text-white bg-[#1a2b6b] hover:opacity-90 transition-all shadow-lg shadow-[#1a2b6b]/20"
                        >
                            {isEditing ? 'Update Plan' : 'Save Plan'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .container-bg { background-color: #fcfcfc; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
