import React from 'react';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  passengers: PassengerCounts;
  onPassengersChange: (passengers: PassengerCounts) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const PassengerSelector: React.FC<PassengerSelectorProps> = ({
  passengers,
  onPassengersChange,
  isOpen = false,
  onOpenChange,
}) => {
  const handleUpdateCount = (key: keyof PassengerCounts, delta: number) => {
    const newValue = passengers[key] + delta;
    if (newValue < 0) return;
    onPassengersChange({
      ...passengers,
      [key]: newValue,
    });
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;
  const displayText = `${passengers.adults} Adult${passengers.adults !== 1 ? 's' : ''}${
    passengers.children > 0 ? `, ${passengers.children} Child${passengers.children !== 1 ? 'ren' : ''}` : ''
  }${passengers.infants > 0 ? `, ${passengers.infants} Infant${passengers.infants !== 1 ? 's' : ''}` : ''}`;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <button
        type="button"
        onClick={() => onOpenChange?.(!isOpen)}
        className="flex w-full min-w-0 flex-col items-start gap-1.5 text-left"
      >
        <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Passengers</span>
        <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#f2f3f5] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
          <span className="min-w-0 flex-1 truncate text-left">{displayText}</span>
          <span className="text-[#8f95a3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
            </svg>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl bg-white p-4 shadow-lg border border-[#e0e5f3]">
          <div className="space-y-3">
            {(['adults', 'children', 'infants'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5674af]">{key}</p>
                  <p className="text-xs text-[#707684]">
                    {key === 'adults' && '12+ years'}
                    {key === 'children' && '2-12 years'}
                    {key === 'infants' && 'Below 2 years'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(key, -1)}
                    disabled={passengers[key] === 0}
                    className="h-6 w-6 rounded-full bg-[#f2f3f5] text-sm font-bold text-[#1e3a8a] border border-[#d8e1f5] transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-[#1e3a8a]">{passengers[key]}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(key, 1)}
                    className="h-6 w-6 rounded-full bg-white text-sm font-bold text-[#1e3a8a] border border-[#d8e1f5] transition-colors hover:bg-[#f2f3f5]"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#e0e5f3] text-xs font-semibold text-[#1e3a8a]">
            Total: {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
          </div>
        </div>
      )}
    </div>
  );
};
