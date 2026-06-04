import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-6 font-poppins">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 text-center">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
                    <XCircle size={48} className="text-[#f2ae66]" strokeWidth={1.5} />
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    No worries — your plan is still saved. You can go back and complete payment whenever you're ready.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        id="go-back-btn"
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-[#f2ae66] text-[#1a2b6b] font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-200/50"
                    >
                        <RefreshCw size={16} strokeWidth={2.5} />
                        Try Again
                    </button>
                    <button
                        id="to-plans-btn"
                        onClick={() => navigate('/leisure-plan')}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back to My Plans
                    </button>
                </div>
            </div>

            <style>{`
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
        </div>
    );
}
