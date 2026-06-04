import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';


import AirportList from 'airports';
import AirlineList from 'airline-codes/airlines.json';
import { PassengerSelector } from './PassengerSelector';
import { DateRangeModal } from './DateRangeModal';
import { TimePickerModal } from './TimePickerModal';
import { searchService } from '../services/searchService';
import { getDeviceId } from '../../../utils/deviceFingerprint';

type TabId = 'flights' | 'hotels' | 'flightHotels' | 'cars';
type TripType = 'oneWay' | 'return' | 'multiCity';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface RoomCounts {
  standard: number;
  deluxe: number;
  suite: number;
  family: number;
}

interface FlightSearchFormPayload {
  from: string;
  to: string;
  date: Date | null;
  returnDate: Date | null;
  tripType: TripType;
  passengers: PassengerCounts;
  cabinClass: string;
  airlines: string;
  directOnly: boolean;
  legs: CityLeg[];
}

interface CityLeg {
  id: string;
  from: string;
  to: string;
  dateRange: DateRange;
}

interface Airline {
  name?: string;
  iata?: string;
  icao?: string;
  country?: string;
  active?: string;
}

const getFilteredAirports = (searchTerm: string) => {
  if (!searchTerm || searchTerm.length < 1) return [];
  return AirportList.filter((airport: any) => {
    const search = searchTerm.toLowerCase();
    return (
      airport.name?.toLowerCase().includes(search) ||
      airport.city?.toLowerCase().includes(search) ||
      airport.iata?.toLowerCase().includes(search) ||
      airport.country?.toLowerCase().includes(search)
    );
  }).slice(0, 10);
};

const getFilteredAirlines = (searchTerm: string) => {
  if (!searchTerm || searchTerm.length < 1) return [];
  const search = searchTerm.toLowerCase();
  return (AirlineList as Airline[])
    .filter((airline) => airline.active !== 'N')
    .filter(
      (airline) =>
        airline.name?.toLowerCase().includes(search) ||
        airline.iata?.toLowerCase().includes(search) ||
        airline.icao?.toLowerCase().includes(search) ||
        airline.country?.toLowerCase().includes(search)
    )
    .slice(0, 10);
};

const formatAirlineLabel = (airline: Airline) => {
  const code = airline.iata && airline.iata !== '-' ? airline.iata : airline.icao;
  if (code) return `${airline.name ?? 'Unknown'} (${code})`;
  return airline.name ?? 'Unknown';
};

const formatDateValue = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

//Icons

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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

//Shared input style

const inputCls =
  'flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] placeholder-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]/20 sm:h-12 truncate';

//LocationInput


function LocationInput({
  label,
  value,
  onChange,
  placeholder,
  enableDropdown = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  enableDropdown?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const filteredAirports = getFilteredAirports(value);

  return (
    <label className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); if (enableDropdown) setIsOpen(true); }}
          onFocus={() => { if (enableDropdown) setIsOpen(true); }}
          onBlur={() => { if (enableDropdown) setTimeout(() => setIsOpen(false), 200); }}
          placeholder={placeholder}
          className={inputCls}
        />
        {enableDropdown && isOpen && (value || filteredAirports.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl bg-white shadow-lg border border-[#e0e5f3] max-h-60 overflow-y-auto">
            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport: any) => (
                <button
                  key={airport.iata}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const label = airport.name ?? airport.city ?? airport.iata ?? 'Unknown airport';
                    onChange(`${label} (${airport.iata ?? 'N/A'})`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#f2f3f5] transition-colors text-sm text-[#3d4255] border-b border-[#f2f3f5] last:border-b-0"
                >
                  <div className="font-semibold">{airport.name}</div>
                  <div className="text-xs text-[#707684]">{airport.iata} • {airport.city}, {airport.country}</div>
                </button>
              ))
            ) : (
              value && <div className="px-4 py-3 text-sm text-gray-500">No airports found</div>
            )}
          </div>
        )}
      </div>
    </label>
  );
}

//PlainTextInput

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
        {icon && <span className="absolute left-4 text-[#1e3a8a] pointer-events-none">{icon}</span>}
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

//AirlineInput

function AirlineInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const filteredAirlines = getFilteredAirlines(value);

  return (
    <label className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={inputCls}
        />
        {isOpen && (value || filteredAirlines.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[#e0e5f3] bg-white shadow-lg">
            {filteredAirlines.length > 0 ? (
              filteredAirlines.map((airline) => (
                <button
                  key={`${airline.iata ?? 'xx'}-${airline.icao ?? 'xx'}-${airline.name}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(formatAirlineLabel(airline)); setIsOpen(false); }}
                  className="w-full border-b border-[#f2f3f5] px-4 py-3 text-left text-sm text-[#1e3a8a] transition-colors hover:bg-[#f2f3f5] last:border-b-0"
                >
                  <div className="font-semibold">{airline.name ?? 'Unknown airline'}</div>
                  <div className="text-xs text-[#707684]">
                    {(airline.iata && airline.iata !== '-' ? airline.iata : airline.icao) ?? 'N/A'}
                    {airline.country ? ` • ${airline.country}` : ''}
                  </div>
                </button>
              ))
            ) : (
              value && <div className="px-4 py-3 text-sm text-gray-500">No airlines found</div>
            )}
          </div>
        )}
      </div>
    </label>
  );
}

//SearchButton

function SearchButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 w-full rounded-lg bg-[#1c3f95] px-6 text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(28,63,149,0.28)] transition-colors hover:bg-[#15357f] sm:h-12 sm:w-auto sm:px-7 sm:text-[14px]"
    >
      {label}
    </button>
  );
}

//TripTypeRadio

function TripTypeRadio({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (v: TripType) => void;
}) {
  const options: Array<{ id: TripType; label: string }> = [
    { id: 'oneWay', label: 'One Way' },
    { id: 'return', label: 'Return' },
    { id: 'multiCity', label: 'Multi-City' },
  ];

  return (
    <div className="flex items-center gap-5 pb-1">
      {options.map((opt) => (
        <label
          key={opt.id}
          className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[#3d4255] select-none"
        >
          <span className="relative flex items-center justify-center">
            <input
              type="radio"
              name="tripType"
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${value === opt.id ? 'border-[#1c3f95]' : 'border-[#aeb5c2]'
                }`}
            >
              {value === opt.id && <span className="h-2 w-2 rounded-full bg-[#1c3f95]" />}
            </span>
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

//Checkbox

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

//MultiCityLegRow

function MultiCityLegRow({
  leg,
  index,
  totalLegs,
  onUpdate,
  onRemove,
}: {
  leg: CityLeg;
  index: number;
  totalLegs: number;
  onUpdate: (id: string, updates: Partial<CityLeg>) => void;
  onRemove: (id: string) => void;
}) {
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const formatDate = (range: DateRange) => {
    if (!range.start) return 'Select date';
    return range.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="relative grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] items-end">
      {/* Leg label */}
      <div className="sm:col-span-4">
        <span className="pl-1 text-[10px] font-bold uppercase tracking-widest text-[#1c3f95]">
          Flight {index + 1}
        </span>
      </div>

      <LocationInput
        label="From"
        value={leg.from}
        onChange={(v) => onUpdate(leg.id, { from: v })}
        placeholder="Enter city or airport"
      />
      <LocationInput
        label="To"
        value={leg.to}
        onChange={(v) => onUpdate(leg.id, { to: v })}
        placeholder="Enter city or airport"
      />

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Departure Date</span>
        <button
          type="button"
          onClick={() => setIsDateModalOpen(true)}
          className="flex h-11 w-full min-w-[160px] items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12"
        >
          <CalendarIcon />
          <span className="truncate text-left">{formatDate(leg.dateRange)}</span>
        </button>
        <DateRangeModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          onSelect={(range) => onUpdate(leg.id, { dateRange: range })}
          selectedRange={leg.dateRange}
        />
      </label>

      {/* Remove button — only show if more than 2 legs */}
      <div className="flex items-end pb-0.5">
        {totalLegs > 2 ? (
          <button
            type="button"
            onClick={() => onRemove(leg.id)}
            title="Remove this flight"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ffd0d0] bg-[#fff5f5] text-[#e05252] transition-colors hover:bg-[#ffe0e0] sm:h-12 sm:w-12"
          >
            <TrashIcon />
          </button>
        ) : (
          // placeholder so grid doesn't collapse
          <div className="h-11 w-11 sm:h-12 sm:w-12" />
        )}
      </div>
    </div>
  );
}

//MultiCityForm

function MultiCitySection({
  legs,
  onLegsChange,
}: {
  legs: CityLeg[];
  onLegsChange: (legs: CityLeg[]) => void;
}) {
  const addLeg = () => {
    if (legs.length >= 6) return; // max 6 city pairs
    const lastLeg = legs[legs.length - 1];
    onLegsChange([
      ...legs,
      {
        id: `leg-${Date.now()}`,
        from: lastLeg.to, // pre-fill from = previous destination
        to: '',
        dateRange: { start: null, end: null },
      },
    ]);
  };

  const updateLeg = (id: string, updates: Partial<CityLeg>) => {
    onLegsChange(legs.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLeg = (id: string) => {
    onLegsChange(legs.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-1">
      {legs.map((leg, index) => (
        <MultiCityLegRow
          key={leg.id}
          leg={leg}
          index={index}
          totalLegs={legs.length}
          onUpdate={updateLeg}
          onRemove={removeLeg}
        />
      ))}
      {legs.length < 6 && (
        <button
          type="button"
          onClick={addLeg}
          className="mt-2 flex items-center gap-2 rounded-full border border-dashed border-[#1c3f95] px-4 py-2 text-[12px] font-semibold text-[#1c3f95] transition-colors hover:bg-[#edf2ff]"
        >
          <PlusIcon />
          Add another city
        </button>
      )}
    </div>
  );
}

//RoomsSelector 

function RoomsSelector({
  rooms,
  onRoomsChange,
  isOpen,
  onOpenChange,
}: {
  rooms: RoomCounts;
  onRoomsChange: (rooms: RoomCounts) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleUpdateCount = (key: keyof RoomCounts, delta: number) => {
    const newValue = rooms[key] + delta;
    if (newValue < 0) return;
    onRoomsChange({ ...rooms, [key]: newValue });
  };

  const totalRooms = rooms.standard + rooms.deluxe + rooms.suite + rooms.family;
  const displayText = totalRooms > 0
    ? `${rooms.standard} Standard${rooms.standard !== 1 ? 's' : ''}${rooms.deluxe > 0 ? `, ${rooms.deluxe} Deluxe${rooms.deluxe !== 1 ? 's' : ''}` : ''}${rooms.suite > 0 ? `, ${rooms.suite} Suite${rooms.suite !== 1 ? 's' : ''}` : ''}${rooms.family > 0 ? `, ${rooms.family} Family${rooms.family !== 1 ? 's' : ''}` : ''}`
    : 'Select rooms';

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <button type="button" onClick={() => onOpenChange(!isOpen)} className="flex w-full min-w-0 flex-col items-start gap-1.5 text-left">
        <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Rooms</span>
        <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
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
            {(['standard', 'deluxe', 'suite', 'family'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5674af]">{key}</p>
                  <p className="text-xs text-[#707684]">Room type</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleUpdateCount(key, -1)} disabled={rooms[key] === 0} className="h-6 w-6 rounded-full bg-[#f2f3f5] text-sm font-bold text-[#1e3a8a] border border-[#d8e1f5] transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">−</button>
                  <span className="w-6 text-center text-sm font-bold text-[#1e3a8a]">{rooms[key]}</span>
                  <button type="button" onClick={() => handleUpdateCount(key, 1)} className="h-6 w-6 rounded-full bg-white text-sm font-bold text-[#1e3a8a] border border-[#d8e1f5] transition-colors hover:bg-[#f2f3f5]">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#e0e5f3] text-xs font-semibold text-[#1e3a8a]">Total: {totalRooms} {totalRooms === 1 ? 'Room' : 'Rooms'}</div>
        </div>
      )}
    </div>
  );
}

//MealPreferenceSelector

function MealPreferenceSelector({
  selections,
  onSelectionsChange,
  isOpen,
  onOpenChange,
}: {
  selections: string[];
  onSelectionsChange: (value: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const options = ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Kosher', 'Halal'];
  const toggleSelection = (option: string) => {
    if (selections.includes(option)) { onSelectionsChange(selections.filter((i) => i !== option)); return; }
    onSelectionsChange([...selections, option]);
  };
  const displayText = selections.length > 0 ? selections.join(', ') : 'Select preferences';

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <button type="button" onClick={() => onOpenChange(!isOpen)} className="flex w-full min-w-0 flex-col items-start gap-1.5 text-left">
        <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Meal Preference</span>
        <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
          <span className="min-w-0 flex-1 truncate text-left">{displayText}</span>
          <span className="text-[#8f95a3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
            </svg>
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl bg-white p-2 shadow-lg border border-[#e0e5f3]">
          {options.map((option) => {
            const isSelected = selections.includes(option);
            return (
              <button
                key={option}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleSelection(option)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${isSelected ? 'bg-[#edf2ff] text-[#1e3a8a] font-semibold' : 'text-[#3d4255] hover:bg-[#f2f3f5]'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

//CabinClassSelector

function CabinClassSelector({
  value,
  onChange,
  isOpen,
  onOpenChange,
}: {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const options = ['Economy', 'Premium Economy', 'Business', 'First'];
  return (
    <div className="relative">
      <button type="button" onClick={() => onOpenChange(!isOpen)} className="flex w-full min-w-0 flex-col items-start gap-1.5 text-left">
        <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Cabin Class</span>
        <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
          <span className="min-w-0 flex-1 truncate text-left">{value}</span>
          <span className="text-[#8f95a3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
            </svg>
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl bg-white p-2 shadow-lg border border-[#e0e5f3]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option);
                onOpenChange(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${option === value ? 'bg-[#edf2ff] text-[#1e3a8a] font-semibold' : 'text-[#3d4255] hover:bg-[#f2f3f5]'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// InlineCarsForm has been replaced with the CarSearchForm component

//FlightsForm

function FlightsForm({
  from, to, dateRange, passengers, airlines, cabinClass,
  onFromChange, onToChange, onDateClick, onPassengersChange, onAirlinesChange, onCabinClassChange,
  onSearch,
}: any) {
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [isCabinOpen, setIsCabinOpen] = useState(false);
  const [directOnly, setDirectOnly] = useState(true);
  const [tripType, setTripType] = useState<TripType>('return');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Multi-city legs — start with 2 empty legs
  const [multiCityLegs, setMultiCityLegs] = useState<CityLeg[]>([
    { id: 'leg-1', from: '', to: '', dateRange: { start: null, end: null } },
    { id: 'leg-2', from: '', to: '', dateRange: { start: null, end: null } },
  ]);

  const formatDateRange = () => {
    if (!dateRange.start) return 'Select dates';
    const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (dateRange.end && !isSameDay(dateRange.start, dateRange.end)) {
      return `${dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} - ${dateRange.end.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`;
    }
    return dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const handleSearch = () => {
    onSearch({
      from,
      to,
      date: dateRange.start,
      returnDate: tripType === 'return' ? dateRange.end : null,
      tripType,
      passengers,
      cabinClass,
      airlines,
      directOnly,
      legs: tripType === 'multiCity' ? multiCityLegs : [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Trip type radio — now includes Multi-City */}
      <TripTypeRadio value={tripType} onChange={setTripType} />

      {/* ── Normal / Return mode ── */}
      {tripType !== 'multiCity' && (
        <>
          <div className={`grid gap-3 ${tripType === 'return' ? 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            <LocationInput label="From" value={from} onChange={onFromChange} placeholder="Enter city or airport" />
            <LocationInput label="To" value={to} onChange={onToChange} placeholder="Enter city or airport" />

            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">
                {tripType === 'return' ? 'Departure – Return' : 'Departure Date'}
              </span>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(true)}
                className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12"
              >
                <CalendarIcon />
                <span className="min-w-0 flex-1 truncate text-left">{formatDateRange()}</span>
              </button>
            </label>

            <DateRangeModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onSelect={(range) => onDateClick(range)} selectedRange={dateRange} />
            <PassengerSelector passengers={passengers} onPassengersChange={onPassengersChange} isOpen={isPassengerOpen} onOpenChange={setIsPassengerOpen} />
          </div>

          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_auto]">
            <AirlineInput label="Airlines" value={airlines} onChange={onAirlinesChange} placeholder="Select airline" />
            <CabinClassSelector value={cabinClass} onChange={onCabinClassChange} isOpen={isCabinOpen} onOpenChange={setIsCabinOpen} />

            <div className="flex h-11 flex-col justify-center gap-2 px-2 sm:h-12">
              <Checkbox checked={directOnly} onChange={() => setDirectOnly((p) => !p)} label="Direct Flights Only" />
            
            </div>
          </div>
        </>
      )}

      {/* ── Multi-City mode ── */}
      {tripType === 'multiCity' && (
        <>
          <MultiCitySection legs={multiCityLegs} onLegsChange={setMultiCityLegs} />

          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_auto]">
            {/* Shared passenger / cabin selectors still apply */}
            <PassengerSelector passengers={passengers} onPassengersChange={onPassengersChange} isOpen={isPassengerOpen} onOpenChange={setIsPassengerOpen} />
            <CabinClassSelector value={cabinClass} onChange={onCabinClassChange} isOpen={isCabinOpen} onOpenChange={setIsCabinOpen} />

            <div className="flex h-11 flex-col justify-center gap-2 px-2 sm:h-12">
              <Checkbox checked={directOnly} onChange={() => setDirectOnly((p) => !p)} label="Direct Flights Only" />
             
            </div>
          </div>
        </>
      )}

      

      {/* ── Search button (after car section) ── */}
      <div className="flex justify-end">
        <SearchButton label="Search Flights" onClick={handleSearch} />
      </div>
    </div>
  );
}

//HotelsForm

function HotelsForm({ deviceId }: { deviceId: string }) {
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 2, children: 0, infants: 0 });
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomCounts>({ standard: 1, deluxe: 0, suite: 0, family: 0 });
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [mealPreferences, setMealPreferences] = useState<string[]>([]);
  const [isMealOpen, setIsMealOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange.start) return 'Select dates';
    const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (dateRange.end && !isSameDay(dateRange.start, dateRange.end)) {
      return `${dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} - ${dateRange.end.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`;
    }
    return dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const handleSearch = async () => {
    try {
      const resolvedDeviceId = deviceId || await getDeviceId();
      await searchService.logHotelSearch({
        deviceId: resolvedDeviceId,
        destination,
        checkInDate: formatDateValue(dateRange.start),
        checkOutDate: formatDateValue(dateRange.end),
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        roomsStandard: rooms.standard,
        roomsDeluxe: rooms.deluxe,
        roomsSuite: rooms.suite,
        roomsFamily: rooms.family,
        mealPreferences,
      });
    } catch (error) {
      console.error('Error saving hotel search:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <LocationInput
          label="Destination"
          value={destination}
          onChange={setDestination}
          placeholder="Enter city"
          enableDropdown={false}
        />
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Date / Date Range</span>
          <button type="button" onClick={() => setIsDateModalOpen(true)} className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
            <CalendarIcon />
            <span className="min-w-0 flex-1 truncate text-left">{formatDateRange()}</span>
          </button>
        </label>
        <PassengerSelector passengers={passengers} onPassengersChange={setPassengers} isOpen={isPassengerOpen} onOpenChange={setIsPassengerOpen} />
        <RoomsSelector rooms={rooms} onRoomsChange={setRooms} isOpen={isRoomsOpen} onOpenChange={setIsRoomsOpen} />
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_auto]">
        <MealPreferenceSelector selections={mealPreferences} onSelectionsChange={setMealPreferences} isOpen={isMealOpen} onOpenChange={setIsMealOpen} />
        <div className="flex justify-end">
          <SearchButton label="Search Hotels" onClick={handleSearch} />
        </div>
      </div>
      <DateRangeModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onSelect={setDateRange} selectedRange={dateRange} />
    </div>
  );
}

//FlightHotelsForm

function FlightHotelsForm({ deviceId }: { deviceId: string }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 2, children: 0, infants: 0 });
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [directOnly, setDirectOnly] = useState(false);
  const [airlines, setAirlines] = useState('');
  const [mealPreferences, setMealPreferences] = useState<string[]>([]);
  const [isMealOpen, setIsMealOpen] = useState(false);
  const [tripType, setTripType] = useState<TripType>('return');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const [multiCityLegs, setMultiCityLegs] = useState<CityLeg[]>([
    { id: 'leg-1', from: '', to: '', dateRange: { start: null, end: null } },
    { id: 'leg-2', from: '', to: '', dateRange: { start: null, end: null } },
  ]);

  const formatDateRange = () => {
    if (!dateRange.start) return 'Select dates';
    const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (dateRange.end && !isSameDay(dateRange.start, dateRange.end)) {
      return `${dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} - ${dateRange.end.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`;
    }
    return dateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const handleSearch = async () => {
    try {
      const resolvedDeviceId = deviceId || await getDeviceId();
      await searchService.logFlightHotelSearch({
        deviceId: resolvedDeviceId,
        from,
        to,
        tripType,
        departureDate: formatDateValue(dateRange.start),
        returnDate: tripType === 'return' ? formatDateValue(dateRange.end) : null,
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        airlines,
        mealPreferences,
        directOnly,
        legs: tripType === 'multiCity'
          ? multiCityLegs.map((leg) => ({
              from: leg.from,
              to: leg.to,
              departureDate: formatDateValue(leg.dateRange.start),
            }))
          : [],
      });
    } catch (error) {
      console.error('Error saving flight + hotel search:', error);
    }
  };

  return (
    <div className="space-y-4">
      <TripTypeRadio value={tripType} onChange={setTripType} />

      {/* ── Normal / Return mode ── */}
      {tripType !== 'multiCity' && (
        <>
          <div className={`grid gap-3 ${tripType === 'return' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            <LocationInput label="From" value={from} onChange={setFrom} placeholder="Enter city or airport" />
            <LocationInput label="To" value={to} onChange={setTo} placeholder="Enter city or airport" />

            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">
                {tripType === 'return' ? 'Departure – Return' : 'Departure Date'}
              </span>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(true)}
                className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12"
              >
                <CalendarIcon />
                <span className="min-w-0 flex-1 truncate text-left">{formatDateRange()}</span>
              </button>
            </label>

            <DateRangeModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onSelect={setDateRange} selectedRange={dateRange} />
            <PassengerSelector passengers={passengers} onPassengersChange={setPassengers} isOpen={isPassengerOpen} onOpenChange={setIsPassengerOpen} />
          </div>

          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_auto]">
            <AirlineInput label="Airlines" value={airlines} onChange={setAirlines} placeholder="Select airline" />
            <MealPreferenceSelector selections={mealPreferences} onSelectionsChange={setMealPreferences} isOpen={isMealOpen} onOpenChange={setIsMealOpen} />

            <div className="flex h-11 flex-col justify-center gap-2 px-2 sm:h-12">
              <Checkbox checked={directOnly} onChange={() => setDirectOnly((p) => !p)} label="Direct Flights Only" />
            </div>
          </div>
        </>
      )}

      {/* ── Multi-City mode ── */}
      {tripType === 'multiCity' && (
        <>
          <MultiCitySection legs={multiCityLegs} onLegsChange={setMultiCityLegs} />

          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_auto]">
            <PassengerSelector passengers={passengers} onPassengersChange={setPassengers} isOpen={isPassengerOpen} onOpenChange={setIsPassengerOpen} />
            <MealPreferenceSelector selections={mealPreferences} onSelectionsChange={setMealPreferences} isOpen={isMealOpen} onOpenChange={setIsMealOpen} />

            <div className="flex h-11 flex-col justify-center gap-2 px-2 sm:h-12">
              <Checkbox checked={directOnly} onChange={() => setDirectOnly((p) => !p)} label="Direct Flights Only" />
             
            </div>
          </div>
        </>
      )}

      {/* ── Search button (after car section) ── */}
      <div className="flex justify-end">
        <SearchButton label="Search" onClick={handleSearch} />
      </div>
    </div>
  );
}

//CarsForm (standalone tab) 

function CarsForm({ deviceId }: { deviceId: string }) {
  const [pickupLocation, setPickupLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [differentReturn, setDifferentReturn] = useState(false);
  const [returnLocation, setReturnLocation] = useState('');
  const [driverAge30to65, setDriverAge30to65] = useState(false);
  const [isDepartureDateOpen, setIsDepartureDateOpen] = useState(false);
  const [departureDateRange, setDepartureDateRange] = useState<DateRange>({ start: null, end: null });
  const [isReturnDateOpen, setIsReturnDateOpen] = useState(false);
  const [returnDateRange, setReturnDateRange] = useState<DateRange>({ start: null, end: null });
  const [isDepartureTimeOpen, setIsDepartureTimeOpen] = useState(false);
  const [isReturnTimeOpen, setIsReturnTimeOpen] = useState(false);

  const formatTimeDisplay = (time: string) => {
    if (!time) return 'Select time';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleSearch = async () => {
    try {
      const resolvedDeviceId = deviceId || await getDeviceId();
      await searchService.logCarSearch({
        deviceId: resolvedDeviceId,
        pickupLocation,
        returnLocation,
        pickupDate: formatDateValue(departureDateRange.start),
        returnDate: formatDateValue(returnDateRange.start),
        pickupTime: departureTime || null,
        returnTime: returnTime || null,
        differentReturn,
        driverAge30To65: driverAge30to65,
      });
    } catch (error) {
      console.error('Error saving car search:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PlainTextInput label="Pickup Location" value={pickupLocation} onChange={setPickupLocation} placeholder="City, airport or address" />
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Departure Date</span>
          <button type="button" onClick={() => setIsDepartureDateOpen(true)} className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
            <CalendarIcon />
            <span className="min-w-0 flex-1 truncate text-left">
              {departureDateRange.start ? departureDateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}
            </span>
          </button>
          <DateRangeModal isOpen={isDepartureDateOpen} onClose={() => setIsDepartureDateOpen(false)} onSelect={setDepartureDateRange} selectedRange={departureDateRange} />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Departure Time</span>
          <button type="button" onClick={() => setIsDepartureTimeOpen(true)} className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
            <ClockIcon />
            <span className="min-w-0 flex-1 truncate text-left">{formatTimeDisplay(departureTime)}</span>
          </button>
          <TimePickerModal isOpen={isDepartureTimeOpen} onClose={() => setIsDepartureTimeOpen(false)} onSelect={setDepartureTime} selectedTime={departureTime} label="Departure Time" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Return Date</span>
          <button type="button" onClick={() => setIsReturnDateOpen(true)} className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
            <CalendarIcon />
            <span className="min-w-0 flex-1 truncate text-left">
              {returnDateRange.start ? returnDateRange.start.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}
            </span>
          </button>
          <DateRangeModal isOpen={isReturnDateOpen} onClose={() => setIsReturnDateOpen(false)} onSelect={setReturnDateRange} selectedRange={returnDateRange} />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="pl-4 text-[10px] font-semibold text-[#3d4255]">Return Time</span>
          <button type="button" onClick={() => setIsReturnTimeOpen(true)} className="flex h-11 w-full items-center gap-2 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] px-4 text-[12px] text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:border-[#c7cedb] sm:h-12">
            <ClockIcon />
            <span className="min-w-0 flex-1 truncate text-left">{formatTimeDisplay(returnTime)}</span>
          </button>
          <TimePickerModal isOpen={isReturnTimeOpen} onClose={() => setIsReturnTimeOpen(false)} onSelect={setReturnTime} selectedTime={returnTime} label="Return Time" />
        </label>
        <div className="hidden lg:block" />
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex flex-col gap-2.5">
          <Checkbox checked={differentReturn} onChange={() => { setDifferentReturn((p) => !p); if (differentReturn) setReturnLocation(''); }} label="Return to a different location" />
          <Checkbox checked={driverAge30to65} onChange={() => setDriverAge30to65((p) => !p)} label="Driver age 30–65" />
        </div>
        {differentReturn && (
          <div className="min-w-[220px] flex-1">
            <PlainTextInput label="Return Location" value={returnLocation} onChange={setReturnLocation} placeholder="City, airport or address" icon={<MapPinIcon />} />
          </div>
        )}
        <div className="ml-auto">
          <SearchButton label="Search Cars" onClick={handleSearch} />
        </div>
      </div>
    </div>
  );
}

//Root widget

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'flights', label: 'Flights' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'flightHotels', label: 'Flight + Hotels' },
  { id: 'cars', label: 'Cars' },
];

export default function SearchWidget() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('flights');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });
  const [airlines, setAirlines] = useState('');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    getDeviceId().then(setDeviceId).catch(() => {});
  }, []);

  const resolveDeviceId = async () => {
    if (deviceId) return deviceId;
    return getDeviceId();
  };

  const formatDate = (date: Date | null) => formatDateValue(date) ?? '';

  const formatCabinClass = (value: string) => {
    if (value.toLowerCase().includes('class')) return value;
    return `${value} Class`;
  };

  const handleFlightSearch = async ({
    from: searchFrom,
    to: searchTo,
    date,
    returnDate,
    tripType,
    passengers: pax,
    cabinClass: cabin,
    airlines: selectedAirlines,
    directOnly,
    legs,
  }: FlightSearchFormPayload) => {
    const params = new URLSearchParams();
    if (searchFrom) params.set('from', searchFrom);
    if (searchTo) params.set('to', searchTo);
    if (date) params.set('date', formatDate(date));
    params.set('tripType', tripType === 'return' ? 'round-trip' : tripType === 'multiCity' ? 'multi-city' : 'one-way');
    params.set('adults', String(pax.adults));
    params.set('children', String(pax.children));
    params.set('infants', String(pax.infants));
    params.set('cabinClass', formatCabinClass(cabin));
    if (returnDate) params.set('returnDate', formatDate(returnDate));

    try {
      const resolvedDeviceId = await resolveDeviceId();
      await searchService.logFlightSearch({
        deviceId: resolvedDeviceId,
        from: searchFrom,
        to: searchTo,
        tripType,
        departureDate: formatDateValue(date),
        returnDate: tripType === 'return' ? formatDateValue(returnDate) : null,
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        cabinClass: cabin,
        airlines: selectedAirlines,
        directOnly,
        legs: legs.map((leg) => ({
          from: leg.from,
          to: leg.to,
          departureDate: formatDateValue(leg.dateRange.start),
        })),
      });
    } catch (error) {
      console.error('Error saving flight search:', error);
    }

    navigate({ pathname: '/flights-loading', search: params.toString() ? `?${params.toString()}` : '' }, { state: { fromSearch: true } });
  };

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`h-10 rounded-full px-4 text-[12px] font-semibold leading-none transition-all sm:h-11 sm:px-6 sm:text-[13px] md:h-12 md:px-8 md:text-[14px] ${activeTab === tab.id
              ? 'bg-[#1f43a0] text-white shadow-[0_14px_30px_rgba(31,67,160,0.24)]'
              : 'bg-white text-[#1f2434] shadow-[0_5px_15px_rgba(19,25,45,0.12)]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[22px] bg-white p-4 shadow-[0_24px_50px_rgba(13,23,48,0.22)] sm:p-5 md:p-6">
        {activeTab === 'flights' && (
          <FlightsForm
            from={from} to={to} dateRange={dateRange} passengers={passengers}
            airlines={airlines} cabinClass={cabinClass}
            onFromChange={setFrom} onToChange={setTo} onDateClick={setDateRange}
            onPassengersChange={setPassengers} onAirlinesChange={setAirlines} onCabinClassChange={setCabinClass}
            onSearch={handleFlightSearch}
          />
        )}
        {activeTab === 'hotels' && <HotelsForm deviceId={deviceId} />}
        {activeTab === 'flightHotels' && <FlightHotelsForm deviceId={deviceId} />}
        {activeTab === 'cars' && <CarsForm deviceId={deviceId} />}
      </div>
    </div>
  );
}