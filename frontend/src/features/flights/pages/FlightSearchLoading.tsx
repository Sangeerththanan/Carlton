import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '../../landing/components/Navigation';

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  tripType?: string;
  adults?: string;
  children?: string;
  infants?: string;
  cabinClass?: string;
}

const FlightSearchLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromSearch?: boolean } | null;

  // If navigated back (no fromSearch flag), redirect directly to flights page
  useEffect(() => {
    if (!state?.fromSearch) {
      navigate({ pathname: '/flights', search: location.search }, { replace: true });
      return;
    }
  }, [state, location.search, navigate]);

  // Parse query parameters
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      from: params.get('from') || '',
      to: params.get('to') || '',
      date: params.get('date') || '',
      returnDate: params.get('returnDate') || '',
      tripType: params.get('tripType') || 'one-way',
      adults: params.get('adults') || '1',
      children: params.get('children') || '0',
      infants: params.get('infants') || '0',
      cabinClass: params.get('cabinClass') || 'Economy',
    } as SearchParams;
  }, [location.search]);

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ pathname: '/flights', search: location.search }, { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.search, navigate]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const passengerCount = {
    adults: parseInt(searchParams.adults || '0'),
    children: parseInt(searchParams.children || '0'),
    infants: parseInt(searchParams.infants || '0'),
  };

  const totalPassengers = passengerCount.adults + passengerCount.children + passengerCount.infants;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Loading Message */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">
              Please wait, we are finding great fares for you
            </h1>
            <p className="text-gray-600">This usually takes a few seconds...</p>
          </div>

          {/* Trip Details Card */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B66A1] mb-4">Trip Details</h2>

            {/* Trip Routes */}
            <div className="space-y-4">
              {searchParams.tripType === 'multi-city' ? (
                <div className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-black text-[#1E3A8A] mb-2">Multi-City Trip</p>
                    <div className="inline-block px-3 py-1 rounded-full bg-[#EDF2FF] text-xs font-semibold text-[#1E3A8A]">
                      Multiple Destinations
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Outbound Flight */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-2 sm:gap-6 flex-1 w-full sm:w-auto">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-black text-[#1E3A8A] truncate">{searchParams.from || 'XXX'}</p>
                        <p className="text-xs text-gray-500">Departure</p>
                      </div>
                      <div className="flex-1 border-t border-[#D6E0F4] relative min-w-[40px]">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-black text-[#1E3A8A] truncate">{searchParams.to || 'XXX'}</p>
                        <p className="text-xs text-gray-500">Arrival</p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-xs font-semibold text-[#6B82B0]">Outbound</p>
                      <p className="text-sm font-bold text-[#1E3A8A]">{formatDate(searchParams.date || '')}</p>
                    </div>
                  </div>

                  {/* Return Flight (if round-trip) */}
                  {searchParams.tripType === 'round-trip' && searchParams.returnDate && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                      <div className="flex items-center gap-2 sm:gap-6 flex-1 w-full sm:w-auto">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-black text-[#1E3A8A] truncate">{searchParams.to || 'XXX'}</p>
                          <p className="text-xs text-gray-500">Departure</p>
                        </div>
                        <div className="flex-1 border-t border-[#D6E0F4] relative min-w-[40px]">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-black text-[#1E3A8A] truncate">{searchParams.from || 'XXX'}</p>
                          <p className="text-xs text-gray-500">Arrival</p>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-xs font-semibold text-[#6B82B0]">Return</p>
                        <p className="text-sm font-bold text-[#1E3A8A]">{formatDate(searchParams.returnDate || '')}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Passengers Info */}
            <div className="mt-6 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#4B66A1] mb-3">Passengers</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#1E3A8A]">{totalPassengers}</span>
                <span className="text-sm text-gray-600">
                  {passengerCount.adults > 0 && `${passengerCount.adults} Adult${passengerCount.adults > 1 ? 's' : ''}`}
                  {passengerCount.children > 0 && `, ${passengerCount.children} Child${passengerCount.children > 1 ? 'ren' : ''}`}
                  {passengerCount.infants > 0 && `, ${passengerCount.infants} Infant${passengerCount.infants > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {/* Loading Progress Bar */}
          <div className="space-y-2 w-full">
            <div className="w-full h-3 bg-gray-300 overflow-hidden">
              <div className="h-full bg-[#F59E0B] animate-pulse" style={{
                animation: 'loading-progress 3s ease-in-out forwards'
              }} />
            </div>
            <p className="text-center text-sm text-gray-500">Finding flights...</p>
          </div>

          <style>{`
            @keyframes loading-progress {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchLoading;
