import { CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { leisurePlanService } from './services/leisurePlanApi';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const planIdStr = searchParams.get('plan_id');

    const [isConfirming, setIsConfirming] = useState(true);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const confirmAttempted = useRef(false);

    useEffect(() => {
        const confirmPlan = async () => {
            if (!planIdStr) {
                setIsConfirming(false);
                return;
            }

            // Prevent strict mode double-firing from doing it twice
            if (confirmAttempted.current) return;
            confirmAttempted.current = true;

            try {
                await leisurePlanService.confirmPlan(parseInt(planIdStr));
                setIsConfirming(false);
            } catch (err) {
                console.error("Failed to confirm plan:", err);
                setConfirmError("Payment successful, but we had trouble updating the plan status. Please contact support.");
                setIsConfirming(false);
            }
        };

        confirmPlan();
    }, [planIdStr]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-6 font-poppins">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 text-center">
                {isConfirming ? (
                    <div className="py-10 flex flex-col items-center">
                        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" strokeWidth={1.5} />
                        <h1 className="text-xl font-black text-gray-900 mb-2">Confirming Booking...</h1>
                        <p className="text-gray-500 text-sm">Please do not close this page.</p>
                    </div>
                ) : confirmError ? (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={48} className="text-red-500" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Attention Needed</h1>
                        <p className="text-red-600 font-medium text-sm leading-relaxed mb-6">
                            {confirmError}
                        </p>
                        {sessionId && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 mb-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Reference</p>
                                <p className="text-xs font-mono text-gray-600 break-all">{sessionId}</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/leisure-plan')}
                            className="w-full py-4 rounded-[16px] bg-[#1a2b6b] text-white font-bold text-sm shadow-lg shadow-[#1a2b6b]/25"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} className="inline mr-2 -mt-0.5" />
                            Back to My Plans
                        </button>
                    </>
                ) : (
                    <>
                        {/* Icon */}
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} className="text-emerald-500" strokeWidth={1.5} />
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Your payment was processed successfully. Your Carlton leisure plan is now booked and confirmed.
                        </p>

                        {/* Session ref */}
                        {sessionId && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 mb-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Reference</p>
                                <p className="text-xs font-mono text-gray-600 break-all">{sessionId}</p>
                            </div>
                        )}

                        {/* Action */}
                        <button
                            id="back-to-plans-btn"
                            onClick={() => navigate('/leisure-plan')}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-[#1a2b6b] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#1a2b6b]/25"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            Back to My Plans
                        </button>
                    </>
                )}
            </div>

            <style>{`
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
        </div>
    );
}
