import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface StripePayButtonProps {
    /** Display label and amount shown on the button, e.g. "Confirm & Pay — £1,200" */
    label?: string;
    /** Amount in GBP (backend converts to pence) */
    amount: number;
    /** Title of the plan / product being purchased */
    planTitle: string;
    /** ID of the saved leisure plan on the backend. Can be omitted if onBeforeRedirect returns it. */
    leisurePlanId?: number;
    /** Extra CSS classes to apply to the button */
    className?: string;
    /** Callback fired immediately before the Stripe redirect (optional). Can return the leisurePlanId if created dynamically limit. */
    onBeforeRedirect?: () => number | void | Promise<number | void>;
    /** Whether the button should be disabled (e.g. while a parent is loading) */
    disabled?: boolean;
    /** Optional class to apply to the outermost wrapper div */
    wrapperClassName?: string;
    /** Hide the Stripe 'Secure payment' badge text */
    hideBadge?: boolean;
}

/**
 * StripePayButton
 *
 * A self-contained, reusable Stripe Checkout button.
 * Import and drop it into any page or modal:
 *
 * ```tsx
 * import StripePayButton from '@/components/StripePayButton';
 *
 * <StripePayButton
 *     planTitle="Paris Escape"
 *     amount={1200}
 *     leisurePlanId={42}
 * />
 * ```
 */
export default function StripePayButton({
    label,
    amount,
    planTitle,
    leisurePlanId,
    className = '',
    onBeforeRedirect,
    disabled = false,
    wrapperClassName = 'w-full space-y-3',
    hideBadge = false,
}: StripePayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleClick = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let dynamicPlanId: number | undefined = undefined;
            if (onBeforeRedirect) {
                const result = await onBeforeRedirect();
                if (typeof result === 'number') {
                    dynamicPlanId = result;
                }
            }

            const finalPlanId = dynamicPlanId ?? leisurePlanId;
            if (!finalPlanId) {
                throw new Error("Missing leisurePlanId: the plan must be saved before payment.");
            }

            // Redirect to custom in-app checkout page
            navigate('/leisure-plan/checkout', {
                state: {
                    planTitle,
                    amount: Math.max(amount || 1, 1),
                    leisurePlanId: finalPlanId
                }
            });
        } catch (err: any) {
            // Check for our custom internal error token so we don't display an error if the consumer aborted intentionally
            if (err?.message === '__CONFIRM_ONLY__') {
                setIsLoading(false);
                return;
            }

            const message =
                err?.response?.data?.error ||
                err?.message ||
                'Payment failed. Please try again.';
            setError(message);
            setIsLoading(false);
        }
    };

    const defaultLabel = `Pay £${amount.toLocaleString()}`;

    return (
        <div className={wrapperClassName}>
            <button
                onClick={handleClick}
                disabled={isLoading || disabled}
                className={`w-full py-5 rounded-[20px] bg-[#f2ae66] text-[#1a2b6b] text-base font-black shadow-xl shadow-orange-200/50 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${className}`}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Redirecting to payment…
                    </>
                ) : (
                    label ?? defaultLabel
                )}
            </button>

            {/* Stripe security badge */}
            {!hideBadge && (
                <p className="text-center text-[11px] text-gray-400 font-medium">
                    🔒 Secure payment powered by{' '}
                    <span className="font-bold text-gray-500">Stripe</span>
                </p>
            )}

            {/* Inline error message */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 flex items-start gap-3 mt-3">
                    <X size={16} className="text-red-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
