import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlaneTakeoff } from 'lucide-react';

interface BookingState {
  flight?: any;
  passengerCount?: number;
  cabinClass?: string;
  tripType?: string;
  returnDate?: string;
}

const FlightBookingProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingState | null;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/flight-booking', {
        state: state,
        replace: true,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [state, navigate]);

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="text-center space-y-6">
        {/* Header */}
        <h2 className="text-xl font-bold text-[#1E3A8A]">
          Please give us a moment....
        </h2>

        {/* Airplane Icon */}
        <div
          className="flex justify-center text-gray-700"
          style={{ animation: 'floatPlane 2s ease-in-out infinite' }}
        >
          <PlaneTakeoff size={80} strokeWidth={1.5} />
        </div>

        {/* Message */}
        <p className="text-gray-700 text-sm leading-relaxed">
          Rechecking the seats and fare for your selected itinerary
        </p>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F59E0B]"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">This usually takes a few seconds...</p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatPlane {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default FlightBookingProcessing;