import { useState, ReactNode } from 'react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CarSearchData {
  pickupLocation: string;
  returnLocation: string;
  departureDate: DateRange;
  returnDate: DateRange;
  pickupTime: string;
  returnTime: string;
  differentReturn: boolean;
  driverAge30to65: boolean;
}

interface CarSearchFormProps {
  onSearch?: (data: CarSearchData) => void;
  variant?: 'inline' | 'booking';
  showSearchButton?: boolean;
}

// Icons
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Shared input style
const inputCls =
  'flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] placeholder-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20 sm:h-12';

// PlainTextInput
function PlainTextInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <label className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">{label}</span>
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e3a8a]">{icon}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </label>
  );
}

// Checkbox
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[12px] font-medium text-[#2e3447] select-none sm:text-[13px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#aeb5c2] text-[#1c3f95] focus:ring-[#1c3f95]"
      />
      {label}
    </label>
  );
}

const CarSearchForm = ({ onSearch, variant = 'inline', showSearchButton = true }: CarSearchFormProps) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [differentReturn, setDifferentReturn] = useState(false);
  const [driverAge30to65, setDriverAge30to65] = useState(false);
  const [departureDateRange, setDepartureDateRange] = useState<DateRange>({ start: null, end: null });
  const [returnDateRange, setReturnDateRange] = useState<DateRange>({ start: null, end: null });

  const formatTimeDisplay = (time: string) => {
    if (!time) return 'Select time';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const formatDateDisplay = (range: DateRange) => {
    if (!range.start) return 'Select date';
    return range.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        pickupLocation,
        returnLocation,
        departureDate: departureDateRange,
        returnDate: returnDateRange,
        pickupTime: departureTime,
        returnTime,
        differentReturn,
        driverAge30to65,
      });
    }
  };

  if (variant === 'booking') {
    return (
      <section className="rounded-2xl border border-dashed border-[#1E3A8A] bg-[#F7F9FF] p-4 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A8A]">Car Rental</p>
          <p className="text-sm text-[#627BAB] mt-1">Add car rental to your booking</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="pl-2 text-[10px] font-semibold text-[#3d4255]">Pickup Location</span>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="City, airport or address"
              className="flex h-10 items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] placeholder-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="pl-2 text-[10px] font-semibold text-[#3d4255]">Pickup Date</span>
            <input
              type="date"
              value={departureDateRange.start ? departureDateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => setDepartureDateRange({ ...departureDateRange, start: e.target.value ? new Date(e.target.value) : null })}
              className="flex h-10 items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="pl-2 text-[10px] font-semibold text-[#3d4255]">Return Location</span>
            <input
              type="text"
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              placeholder="City, airport or address"
              className="flex h-10 items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] placeholder-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="pl-2 text-[10px] font-semibold text-[#3d4255]">Return Date</span>
            <input
              type="date"
              value={returnDateRange.start ? returnDateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => setReturnDateRange({ ...returnDateRange, start: e.target.value ? new Date(e.target.value) : null })}
              className="flex h-10 items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20"
            />
          </label>
        </div>

        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-lg bg-[#1c3f95] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(28,63,149,0.2)] transition hover:bg-[#15357f]"
          >
            Search Cars
          </button>
        )}
      </section>
    );
  }

  // Inline variant (for SearchWidget)
  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-dashed border-[#c2cfe8] bg-[#f7f9ff] p-4">
      {/* Section heading */}
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1c3f95]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 5v3h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        Car Rental
      </p>

      {/* Row 1 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PlainTextInput
          label="Pickup Location"
          value={pickupLocation}
          onChange={setPickupLocation}
          placeholder="City, airport or address"
          icon={<MapPinIcon />}
        />

        {/* Departure date */}
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Pickup Date</span>
          <input
            type="date"
            value={departureDateRange.start ? departureDateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => setDepartureDateRange({ ...departureDateRange, start: e.target.value ? new Date(e.target.value) : null })}
            className={inputCls}
          />
        </label>

        {/* Departure time */}
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Pickup Time</span>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {/* Row 2 — Return */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Return date */}
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Return Date</span>
          <input
            type="date"
            value={returnDateRange.start ? returnDateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => setReturnDateRange({ ...returnDateRange, start: e.target.value ? new Date(e.target.value) : null })}
            className={inputCls}
          />
        </label>

        {/* Return time */}
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Return Time</span>
          <input
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className={inputCls}
          />
        </label>

        <div className="hidden lg:block" />
      </div>

      {/* Row 3 — Checkboxes + optional return location */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex flex-col gap-2.5">
          <Checkbox
            checked={differentReturn}
            onChange={() => {
              setDifferentReturn((p) => !p);
              if (differentReturn) setReturnLocation('');
            }}
            label="Return to a different location"
          />
          <Checkbox checked={driverAge30to65} onChange={() => setDriverAge30to65((p) => !p)} label="Driver age 30–65" />
        </div>

        {differentReturn && (
          <div className="min-w-[220px] flex-1">
            <PlainTextInput
              label="Return Location"
              value={returnLocation}
              onChange={setReturnLocation}
              placeholder="City, airport or address"
              icon={<MapPinIcon />}
            />
          </div>
        )}
      </div>

      {showSearchButton && (
        <button
          type="button"
          onClick={handleSearch}
          className="w-full rounded-lg bg-[#1c3f95] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(28,63,149,0.28)] transition-colors hover:bg-[#15357f]"
        >
          Search Cars
        </button>
      )}
    </div>
  );
};

export default CarSearchForm;
