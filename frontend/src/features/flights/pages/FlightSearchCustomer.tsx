import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  Plane,
  Search,
  UserRound,
} from 'lucide-react';
import { useFlights } from '../hooks/useFlights';
import FlightCard from '../components/FlightCard';
import { getFlightUiMeta } from '../data/flightUiMeta';
import type { Flight, PassengerCounts, Segment, TripType } from '../types/flightTypes';
import { addDays, createSegment, toDateInput } from '../utils';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../profile/services/profileService';
import { AddTravellerModal } from '../../profile/components/AddTravellerModal';
import type { SavedTraveller } from '../../profile/types/profile';

const tripTypeTabs: Array<{ id: TripType; label: string }> = [
  { id: 'round-trip', label: 'Round Trip' },
  { id: 'one-way', label: 'One Way' },
  { id: 'multi-city', label: 'Multi-City' },
];

const cabinClasses = ['Economy Class', 'Premium Economy', 'Business', 'First'];

type TravelPlanPrefillPayload = {
  travelPlanId: number;
  tripType?: string;
  cabinClass?: string;
  adults?: number;
  children?: number;
  infants?: number;
  fromDate?: string;
  toDate?: string;
  flights?: Array<{ departureAirport?: string; arrivalAirport?: string; fromDate?: string | null }>;
};

type LocationState = {
  travelPlanPrefill?: TravelPlanPrefillPayload;
};

const normalizeDateInputValue = (value?: string | null) => {
  if (!value) return '';
  if (typeof value === 'string' && value.length >= 10) return value.slice(0, 10);
  return '';
};

const mapTripTypeFromTravelPlan = (value?: string): TripType => {
  const v = value?.toLowerCase?.() ?? '';
  if (v === 'multicity' || v === 'multi-city' || v === 'multi_city') return 'multi-city';
  if (v === 'return' || v === 'roundtrip' || v === 'round-trip') return 'round-trip';
  if (v === 'oneway' || v === 'one-way' || v === 'one_way') return 'one-way';
  return 'round-trip';
};

const mapCabinClassFromTravelPlan = (value?: string) => {
  const v = value?.trim?.() ?? '';
  if (!v) return cabinClasses[0];
  if (v.toLowerCase() === 'economy') return 'Economy Class';
  if (cabinClasses.includes(v)) return v;
  const normalized = v.toLowerCase();
  const match = cabinClasses.find((c) => c.toLowerCase() === normalized);
  return match ?? cabinClasses[0];
};

const FlightSearchCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flights } = useFlights();
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [segments, setSegments] = useState<Segment[]>([
    createSegment(1),
    createSegment(2, { departing: addDays(toDateInput(new Date()), 7) }),
  ]);
  const [returnDate, setReturnDate] = useState(addDays(toDateInput(new Date()), 7));
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [cabinClass, setCabinClass] = useState('Economy Class');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Saved Travelers State
  const { isAuthenticated } = useAuth();
  const [savedTravellers, setSavedTravellers] = useState<SavedTraveller[]>([]);
  const [selectedTravellerIds, setSelectedTravellerIds] = useState<number[]>([]);
  const [isTravellerSelectorOpen, setIsTravellerSelectorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFetchingTravellers, setIsFetchingTravellers] = useState(false);

  const lastAppliedPlanIdRef = useRef<number | null>(null);

  useEffect(() => {
    const state = (location.state ?? null) as LocationState | null;
    const prefill = state?.travelPlanPrefill;
    if (!prefill) return;
    if (lastAppliedPlanIdRef.current === prefill.travelPlanId) return;

    lastAppliedPlanIdRef.current = prefill.travelPlanId;

    const nextTripType = mapTripTypeFromTravelPlan(prefill.tripType);
    const fromDate = normalizeDateInputValue(prefill.fromDate) || toDateInput(new Date());
    const toDate = normalizeDateInputValue(prefill.toDate);

    const safePassengers: PassengerCounts = {
      adults: Math.max(1, Number(prefill.adults ?? 1) || 1),
      children: Math.max(0, Number(prefill.children ?? 0) || 0),
      infants: Math.max(0, Number(prefill.infants ?? 0) || 0),
    };

    const legs = Array.isArray(prefill.flights) ? prefill.flights : [];
    const firstLeg = legs[0];
    const firstLegDate = normalizeDateInputValue(firstLeg?.fromDate);
    const outbound = createSegment(1, {
      from: firstLeg?.departureAirport ?? '',
      to: firstLeg?.arrivalAirport ?? '',
      departing: firstLegDate || fromDate,
    });

    if (nextTripType === 'one-way') {
      setTripType('one-way');
      setSegments([outbound]);
      setReturnDate('');
    } else if (nextTripType === 'round-trip') {
      const nextReturnDate = toDate || addDays(fromDate, 7);
      setTripType('round-trip');
      setSegments([
        outbound,
        createSegment(2, {
          from: outbound.to,
          to: outbound.from,
          departing: nextReturnDate,
        }),
      ]);
      setReturnDate(nextReturnDate);
    } else {
      const nextSegments = (legs.length ? legs : [firstLeg ?? {}])
        .slice(0, 6)
        .map((leg, index) => {
          const legDate = normalizeDateInputValue(leg?.fromDate);
          return createSegment(index + 1, {
            from: leg?.departureAirport ?? '',
            to: leg?.arrivalAirport ?? '',
            departing: legDate || (index === 0 ? fromDate : ''),
          });
        });

      setTripType('multi-city');
      setSegments(nextSegments.length ? nextSegments : [outbound]);
      setReturnDate('');
    }

    setPassengers(safePassengers);
    setCabinClass(mapCabinClassFromTravelPlan(prefill.cabinClass));
    setShowResults(false);
  }, [location.state]);

  const fetchSavedTravellers = async () => {
    if (!isAuthenticated) return;
    try {
      setIsFetchingTravellers(true);
      const data = await profileService.getSavedTravellers();
      setSavedTravellers(data);
    } catch (error) {
      console.error('Failed to fetch saved travellers:', error);
    } finally {
      setIsFetchingTravellers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedTravellers();
    } else {
      setSavedTravellers([]);
      setSelectedTravellerIds([]);
      setPassengers({ adults: 1, children: 0, infants: 0 });
    }
  }, [isAuthenticated]);

  const calculateAge = (dob?: string) => {
    if (!dob) return 30;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const counts: PassengerCounts = { adults: 0, children: 0, infants: 0 };

    selectedTravellerIds.forEach((id) => {
      const traveller = savedTravellers.find((t) => t.id === id);
      if (traveller) {
        const age = calculateAge(traveller.dateOfBirth);
        if (age < 2) counts.infants++;
        else if (age < 12) counts.children++;
        else counts.adults++;
      }
    });

    setPassengers(counts);
  }, [selectedTravellerIds, savedTravellers, isAuthenticated]);

  const toggleTraveller = (id: number) => {
    setSelectedTravellerIds((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id],
    );
  };

  const getSummaryText = () => {
    if (isAuthenticated && selectedTravellerIds.length > 0) {
      const parts = [];
      if (passengers.adults > 0) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`);
      if (passengers.children > 0) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`);
      if (passengers.infants > 0) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`);
      return `${parts.join(', ')} • ${cabinClass.replace(' Class', '')}`;
    }
    return `${totalTravelers} Traveler${totalTravelers > 1 ? 's' : ''} • ${cabinClass.replace(' Class', '')}`;
  };

  const canAddSegment = tripType === 'multi-city' && segments.length < 6;

  const totalTravelers = useMemo(() => {
    return passengers.adults + passengers.children + passengers.infants;
  }, [passengers]);

  const customerFlights = useMemo(() => {
    return flights.map((flight) => ({ ...flight, ...getFlightUiMeta(flight) }));
  }, [flights]);

  const visibleFlights = useMemo(() => {
    const firstSegment = segments[0] ?? createSegment(1);
    const normalizedFrom = firstSegment.from.trim().toLowerCase();
    const normalizedTo = firstSegment.to.trim().toLowerCase();
    const normalizedDate = firstSegment.departing.trim();

    return customerFlights.filter((flight) => {
      const matchesFrom = !normalizedFrom || flight.departure.toLowerCase().includes(normalizedFrom);
      const matchesTo = !normalizedTo || flight.destination.toLowerCase().includes(normalizedTo);
      const matchesDate = !normalizedDate || flight.departureTime.startsWith(normalizedDate);
      return matchesFrom && matchesTo && matchesDate;
    });
  }, [customerFlights, segments]);

  const recommendedFlights = useMemo(() => {
    return [...customerFlights].sort((a, b) => a.price - b.price).slice(0, 3);
  }, [customerFlights]);

  const updateSegment = (id: number, field: keyof Omit<Segment, 'id'>, value: string) => {
    setSegments((prev) =>
      prev.map((segment) => (segment.id === id ? { ...segment, [field]: value } : segment)),
    );
  };

  const handleTripTypeChange = (nextTripType: TripType) => {
    if (nextTripType === tripType) return;

    setSegments((currentSegments) => {
      const firstSegment = currentSegments[0] ?? createSegment(1);
      const secondSegment = currentSegments[1];

      if (nextTripType === 'one-way') {
        return [firstSegment];
      }

      if (nextTripType === 'round-trip') {
        const outbound = firstSegment;
        const inbound =
          secondSegment ??
          createSegment(2, {
            from: firstSegment.to,
            to: firstSegment.from,
            departing: returnDate || addDays(firstSegment.departing, 7),
          });
        setReturnDate(inbound.departing || addDays(firstSegment.departing, 7));
        return [outbound, inbound];
      }

      const nextSegments = [...currentSegments];
      if (nextSegments.length < 2) {
        nextSegments.push(
          createSegment(2, {
            from: firstSegment.to,
            to: firstSegment.from,
            departing: returnDate || addDays(firstSegment.departing, 7),
          }),
        );
      }
      return nextSegments.slice(0, 6);
    });

    if (nextTripType === 'one-way') setReturnDate('');

    if (nextTripType === 'round-trip') {
      const seedDate = segments[0]?.departing || toDateInput(new Date());
      const nextReturnDate = segments[1]?.departing || addDays(seedDate, 7);
      setReturnDate(nextReturnDate);
    }

    setTripType(nextTripType);
  };

  const addSegment = () => {
    if (!canAddSegment) return;
    const nextId = segments.length ? Math.max(...segments.map((s) => s.id)) + 1 : 1;
    setSegments((prev) => [...prev, createSegment(nextId)]);
  };

  const removeSegment = (id: number) => {
    setSegments((prev) => prev.filter((segment) => segment.id !== id));
  };

  const updatePassengerCount = (key: keyof PassengerCounts, delta: 1 | -1) => {
    setPassengers((prev) => {
      const nextValue = Math.max(0, prev[key] + delta);
      if (key === 'adults' && nextValue === 0) return prev;
      return { ...prev, [key]: nextValue };
    });
  };

  const handleSearch = () => {
    setShowResults(true);
    const firstSegment = segments[0] ?? createSegment(1);
    const query = new URLSearchParams({
      from: firstSegment.from,
      to: firstSegment.to,
      date: firstSegment.departing,
      tripType,
      adults: String(passengers.adults),
      children: String(passengers.children),
      infants: String(passengers.infants),
      cabinClass,
    });

    if (isAuthenticated && selectedTravellerIds.length > 0) {
      query.set('travellerIds', selectedTravellerIds.join(','));
    }

    if (tripType === 'round-trip') query.set('returnDate', returnDate);
    if (tripType === 'multi-city') query.set('segments', encodeURIComponent(JSON.stringify(segments)));

    navigate(`/flights?${query.toString()}`);
  };

  const handleBook = (flight: Flight) => {
    navigate('/flight-booking', {
      state: {
        flight,
        passengerCount: Math.max(totalTravelers, 1),
        cabinClass,
        tripType,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        selectedTravellerIds: isAuthenticated ? selectedTravellerIds : undefined,
      },
    });
  };

  const renderSegment = (segment: Segment, index: number) => (
    <div key={segment.id} className="space-y-1 rounded-2xl border border-[#E8EEF9] bg-[#FBFCFF] p-2">
      <div className="flex items-center justify-between gap-3">
        {tripType === 'multi-city' ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4A69AA]">Flight {index + 1}</p>
        ) : (
          <span />
        )}
        {tripType === 'multi-city' && index > 0 && (
          <button
            onClick={() => removeSegment(segment.id)}
            className="inline-flex items-center gap-1 rounded-full border border-[#D8E1F5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#9B4F3F] transition hover:bg-[#FFF6F4]"
          >
            <CircleMinus size={12} />
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_190px]">
        <label className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Departure Airport</span>
          <input
            value={segment.from}
            onChange={(event) => updateSegment(segment.id, 'from', event.target.value)}
            placeholder="City or airport"
            className="h-9 w-full rounded-xl border border-[#E0E5F3] bg-[#F2F5FC] px-3 text-sm font-medium text-[#15326B] outline-none transition focus:border-[#8DA4D8]"
          />
        </label>

        <div className="hidden items-center justify-center lg:flex">
          <button
            type="button"
            className="rounded-full bg-white p-2 text-[#1E3A8A] shadow-sm ring-1 ring-[#E0E7F7]"
          >
            <ArrowRightLeft size={16} />
          </button>
        </div>

        <label className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Arrival Airport</span>
          <input
            value={segment.to}
            onChange={(event) => updateSegment(segment.id, 'to', event.target.value)}
            placeholder="City or airport"
            className="h-9 w-full rounded-xl border border-[#E0E5F3] bg-[#F2F5FC] px-3 text-sm font-medium text-[#15326B] outline-none transition focus:border-[#8DA4D8]"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Departing Date</span>
          <input
            type="date"
            value={segment.departing}
            onChange={(event) => updateSegment(segment.id, 'departing', event.target.value)}
            className="h-9 w-full rounded-xl border border-[#E0E5F3] bg-[#F2F5FC] px-3 text-sm font-medium text-[#15326B] outline-none transition focus:border-[#8DA4D8]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <section className="space-y-4 px-1 sm:px-0">
      <div className="rounded-2xl border border-[#DEE4F2] bg-white shadow-[0_12px_30px_rgba(30,58,138,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[#E8ECF7] px-3 py-3 sm:flex-row sm:items-start sm:justify-between lg:px-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
                <Plane size={18} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#1E3A8A]">Flight Details</h2>
                <p className="text-xs font-medium text-[#617CB4]">Search available routes and fares</p>
              </div>
            </div>

            <div className="inline-flex w-full flex-wrap rounded-xl bg-[#EDF2FD] p-1 sm:w-auto sm:flex-nowrap">
              {tripTypeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTripTypeChange(tab.id)}
                  className={`flex-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:flex-none ${
                    tab.id === tripType
                      ? 'bg-[#1E3A8A] text-white shadow-[0_4px_16px_rgba(30,58,138,0.35)]'
                      : 'text-[#1E3A8A] hover:bg-white/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 px-3 py-3 lg:px-4 lg:py-3.5">
            <div className="space-y-2">
              {tripType === 'round-trip' ? (
                <>
                  {renderSegment(segments[0] ?? createSegment(1), 0)}

                  <div className="grid gap-2 rounded-2xl border border-[#E8EEF9] bg-[#FBFCFF] p-2 sm:grid-cols-2 sm:items-end">
                    <label className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Return Date</span>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(event) => setReturnDate(event.target.value)}
                        className="h-9 w-full rounded-xl border border-[#E0E5F3] bg-[#F2F5FC] px-3 text-sm font-medium text-[#15326B] outline-none transition focus:border-[#8DA4D8]"
                      />
                    </label>

                    <div className="hidden rounded-xl bg-[#F4F7FE] px-4 py-3 text-xs font-semibold text-[#4A69AA] sm:block">
                      Return segment auto-follows your outbound route.
                    </div>
                  </div>
                </>
              ) : tripType === 'one-way' ? (
                renderSegment(segments[0] ?? createSegment(1), 0)
              ) : (
                <>
                  {segments.map((segment, index) => renderSegment(segment, index))}

                  <button
                    onClick={addSegment}
                    disabled={!canAddSegment}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#D8E1F5] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#F4F7FF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CirclePlus size={16} />
                    Add Another Flight
                  </button>
                </>
              )}
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_160px] xl:items-end">
              {/* Passengers section */}
              <div className="rounded-xl border border-[#E2E8F7] bg-white px-2 py-2">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Passengers</p>

                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsTravellerSelectorOpen(!isTravellerSelectorOpen)}
                      className="flex h-9 w-full items-center justify-between rounded-xl border border-[#E0E5F3] bg-[#F2F5FC] px-3 text-sm font-semibold text-[#15326B] outline-none transition focus:border-[#8DA4D8]"
                    >
                      <span className="truncate">
                        {selectedTravellerIds.length > 0
                          ? `${selectedTravellerIds.length} Traveler${selectedTravellerIds.length > 1 ? 's' : ''} Selected`
                          : 'Select Travelers'}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isTravellerSelectorOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isTravellerSelectorOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-[#D8E1F5] bg-white p-2 shadow-[0_20px_50px_rgba(30,58,138,0.15)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="mb-2 flex items-center justify-between border-b border-[#F0F4FD] pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5674AF]">
                            Your Saved Travelers
                          </span>
                          <span className="text-[10px] font-medium text-[#94A3B8]">{savedTravellers.length} total</span>
                        </div>

                        {isFetchingTravellers ? (
                          <div className="flex flex-col items-center py-6 text-xs text-gray-400">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E3A8A] border-t-transparent mb-2" />
                            Loading travelers...
                          </div>
                        ) : savedTravellers.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                            {savedTravellers.map((traveller) => {
                              const age = calculateAge(traveller.dateOfBirth);
                              const type = age < 2 ? 'Infant' : age < 12 ? 'Child' : 'Adult';
                              const isSelected = selectedTravellerIds.includes(traveller.id);

                              return (
                                <button
                                  key={traveller.id}
                                  onClick={() => toggleTraveller(traveller.id)}
                                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                                    isSelected
                                      ? 'bg-[#1E3A8A] text-white shadow-md'
                                      : 'text-[#1E3A8A] hover:bg-[#F2F5FC]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-colors ${
                                        isSelected
                                          ? 'bg-white border-white'
                                          : 'border-[#C9D5F0] bg-white group-hover:border-[#1E3A8A]'
                                      }`}
                                    >
                                      {isSelected && <div className="h-2 w-2 rounded-sm bg-[#1E3A8A]" />}
                                    </div>
                                    <div>
                                      <p className={`font-bold ${isSelected ? 'text-white' : 'text-[#1E3A8A]'}`}>
                                        {traveller.firstName} {traveller.lastName}
                                      </p>
                                      <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#6A84BA]'}`}>
                                        {traveller.nationality || 'Traveler'} • {type}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F5FC] text-[#C9D5F0]">
                              <UserRound size={20} />
                            </div>
                            <p className="text-xs font-bold text-[#5674AF]">No saved travelers found</p>
                            <p className="mt-1 text-[10px] text-[#94A3B8]">
                              Add your family and friends for quicker booking
                            </p>
                          </div>
                        )}

                        <div className="mt-3 border-t border-[#F0F4FD] pt-3">
                          <button
                            onClick={() => {
                              setIsAddModalOpen(true);
                              setIsTravellerSelectorOpen(false);
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2F5FC] py-2.5 text-xs font-bold text-[#1E3A8A] transition-all hover:bg-[#1E3A8A] hover:text-white"
                          >
                            <CirclePlus size={16} />
                            Add New Traveler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(['adults', 'children', 'infants'] as const).map((key) => (
                      <div key={key} className="rounded-lg bg-[#F4F7FE] px-2 py-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6A84BA]">{key}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <button
                            onClick={() => updatePassengerCount(key, -1)}
                            className="h-5 w-5 rounded-full bg-white text-sm font-bold text-[#1E3A8A] ring-1 ring-[#D8E1F5]"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-[#1E3A8A]">{passengers[key]}</span>
                          <button
                            onClick={() => updatePassengerCount(key, 1)}
                            className="h-5 w-5 rounded-full bg-white text-sm font-bold text-[#1E3A8A] ring-1 ring-[#D8E1F5]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5674AF]">Cabin class</span>
                <div className="relative">
                  <select
                    value={cabinClass}
                    onChange={(event) => setCabinClass(event.target.value)}
                    className="h-9 w-full appearance-none rounded-xl border border-[#E0E5F3] bg-white px-3 pr-8 text-sm font-semibold text-[#1E3A8A] outline-none transition focus:border-[#8DA4D8]"
                  >
                    {cabinClasses.map((cabin) => (
                      <option key={cabin} value={cabin}>
                        {cabin}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5E78AF]"
                  />
                </div>
              </label>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-transparent">Action</span>
                <button
                  onClick={handleSearch}
                  disabled={totalTravelers === 0}
                  className="h-10 w-full rounded-xl bg-[#B8C8EE] px-4 text-sm font-bold text-[#1E3A8A] transition hover:bg-[#9FB5E8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Search size={16} />
                    Search Flights
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#E8ECF7] pt-2">
              <button
                onClick={() => setPromoOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#32539A]"
              >
                <ChevronDown size={14} className={`transition ${promoOpen ? 'rotate-180' : ''}`} />
                Use promotional code
              </button>
              {promoOpen && (
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Enter promotional code"
                  className="h-9 w-full rounded-xl border border-[#D9E3F6] bg-[#F8FAFF] px-4 text-sm font-medium text-[#1E3A8A] outline-none transition focus:border-[#8DA4D8]"
                />
              )}

              <div className="flex flex-col gap-2 text-xs font-semibold text-[#4968A7] sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-1">
                  <UserRound size={13} />
                  {getSummaryText()}
                </span>
                <button className="hover:underline">Manage Rewards</button>
              </div>
            </div>
          </div>
        </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A8A] sm:text-xl">
              {showResults ? 'Search results' : 'Recommended flights'}
            </h3>
            <p className="text-sm text-[#617CB4]">
              {showResults
                ? 'Matching flights based on your selected route and date'
                : 'Top picks from current flights in our database'}
            </p>
          </div>
          <button className="self-start text-sm font-semibold text-[#32539A] hover:underline sm:self-auto">
            View all
          </button>
        </div>

        {showResults ? (
          <div className="grid gap-4">
            {(visibleFlights.length > 0 ? visibleFlights : customerFlights).map((flight) => (
              <FlightCard key={flight.id} flight={flight} onBook={handleBook} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {recommendedFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} onBook={handleBook} />
            ))}
          </div>
        )}
      </section>

      <AddTravellerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchSavedTravellers}
      />
    </section>
  );
};

export default FlightSearchCustomer;