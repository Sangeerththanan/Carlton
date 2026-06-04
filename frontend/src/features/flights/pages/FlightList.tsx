import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plane, SlidersHorizontal } from 'lucide-react';
import { useFlights } from '../hooks/useFlights';
import { FlightCard, FlightForm } from '../components';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { useToast } from '../../../contexts/ToastContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigation } from '../../landing/components/Navigation';
import type { DayWindow, FilterSection, Flight, SortMode } from '../types/flightTypes';
import { getFlightUiMeta } from '../data/flightUiMeta';
import { formatDuration, formatPrice, getDurationMinutes, getErrorMessage, getFlightWindow, matchesAirportField } from '../utils';

const dayWindows: DayWindow[] = ['morning', 'afternoon', 'evening', 'night'];

const defaultSectionState: Record<FilterSection, boolean> = {
  stops: true,
  price: true,
  duration: true,
  depart: true,
  sort: true,
  cabin: true,
  airlines: true,
  baggage: true,
};


const FlightList = () => {
  const { flights, loading, error, createFlight, updateFlight, deleteFlight } = useFlights();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | undefined>();
  const [sortMode, setSortMode] = useState<SortMode>('quickest');
  const [stopFilters, setStopFilters] = useState<number[]>([0, 1, 2]);
  const [departureWindows, setDepartureWindows] = useState<DayWindow[]>(dayWindows);
  const [airlineFilters, setAirlineFilters] = useState<string[]>([]);
  const [checkInIncluded, setCheckInIncluded] = useState(false);
  const [handLuggageIncluded, setHandLuggageIncluded] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>(defaultSectionState);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const from = query.get('from')?.trim() ?? '';
  const to = query.get('to')?.trim() ?? '';
  const date = query.get('date')?.trim() ?? '';
  const returnDate = query.get('returnDate')?.trim() ?? '';
  const tripType = (query.get('tripType') ?? 'round-trip').toLowerCase();
  const legsParam = query.get('legs') ?? '';
  const cabinClass = query.get('cabinClass')?.trim() ?? 'Business';
  const adults = Number(query.get('adults') ?? 1);

  const isCustomer = isAuthenticated ? (user?.role ?? '').toLowerCase() === 'customer' : true;

  const renderLayout = (content: React.ReactNode) => {
    if (isAuthenticated) {
      return (
        <DashboardLayout>
          {content}
        </DashboardLayout>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6">
          {content}
        </div>
      </div>
    );
  };

  const customerFlights = useMemo(() => {
    return flights.map((flight) => ({ ...flight, ...getFlightUiMeta(flight) }));
  }, [flights]);

  const allAirlines = useMemo(() => {
    return [...new Set(customerFlights.map((flight) => flight.airline).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  }, [customerFlights]);

  const flightStats = useMemo(() => {
    const prices = customerFlights.map((flight) => flight.price);
    const durations = customerFlights.map((flight) => getDurationMinutes(flight));

    const getMinPriceForStop = (stop: number) => {
      const matching = customerFlights.filter((flight) => flight.stops === stop);
      return matching.length ? Math.min(...matching.map((flight) => flight.price)) : null;
    };

    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      minDuration: durations.length ? Math.min(...durations) : 0,
      maxDuration: durations.length ? Math.max(...durations) : 0,
      directPrice: getMinPriceForStop(0),
      oneStopPrice: getMinPriceForStop(1),
      twoStopPrice: getMinPriceForStop(2),
    };
  }, [customerFlights]);

  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedDurationRange, setSelectedDurationRange] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!allAirlines.length) {
      setAirlineFilters([]);
      return;
    }

    setAirlineFilters((previous) => {
      const valid = previous.filter((airline) => allAirlines.includes(airline));
      return valid.length ? valid : allAirlines;
    });
  }, [allAirlines]);

  useEffect(() => {
    setSelectedPriceRange([flightStats.minPrice, flightStats.maxPrice]);
    setSelectedDurationRange([flightStats.minDuration, flightStats.maxDuration]);
  }, [flightStats.minPrice, flightStats.maxPrice, flightStats.minDuration, flightStats.maxDuration]);

  const handleCreate = async (flightData: any) => {
    try {
      await createFlight(flightData);
      showSuccess('Flight created successfully!');
      setShowForm(false);
    } catch (errorValue) {
      showError(getErrorMessage(errorValue));
    }
  };

  const handleUpdate = async (id: number, flightData: any) => {
    try {
      await updateFlight(id, flightData);
      showSuccess('Flight updated successfully!');
      setShowForm(false);
      setEditingFlight(undefined);
    } catch (errorValue) {
      showError(getErrorMessage(errorValue));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;

    try {
      await deleteFlight(id);
      showSuccess('Flight deleted successfully!');
    } catch (errorValue) {
      showError(getErrorMessage(errorValue));
    }
  };

  const handleBook = (flight: Flight) => {
    navigate('/flight-booking-processing', {
      state: {
        flight,
        passengerCount: Math.max(adults, 1),
        cabinClass,
        tripType: query.get('tripType') ?? 'round-trip',
        returnDate: query.get('returnDate') ?? undefined,
      },
    });
  };

  const filteredFlights = useMemo(() => {
    const parsedLegs = (() => {
      if (!legsParam) return [] as Array<{ from?: string; to?: string; departureDate?: string }>;
      try {
        const raw = legsParam.includes('%') ? decodeURIComponent(legsParam) : legsParam;
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
      } catch {
        return [] as Array<{ from?: string; to?: string; departureDate?: string }>;
      }
    })();

    const isRoundTrip = tripType === 'round-trip' || tripType === 'return';
    const isMultiCity = tripType === 'multi-city' || tripType === 'multicity';

    const matchesRoute = (flight: Flight, routeFrom: string, routeTo: string) => (
      matchesAirportField(routeFrom, flight.departure) && matchesAirportField(routeTo, flight.destination)
    );

    const matchesDepartureDate = (flight: Flight, matchDate: string) => (
      !matchDate || flight.departureTime.startsWith(matchDate)
    );

    const matchesTripType = (flight: Flight) => {
      if (isRoundTrip) {
        const outboundMatch = matchesRoute(flight, from, to) && matchesDepartureDate(flight, date);
        const inboundMatch = matchesRoute(flight, to, from) && matchesDepartureDate(flight, returnDate);
        return outboundMatch || inboundMatch;
      }

      if (isMultiCity) {
        if (parsedLegs.length) {
          return parsedLegs.some((leg) => (
            matchesRoute(flight, leg.from ?? '', leg.to ?? '')
            && matchesDepartureDate(flight, leg.departureDate ?? '')
          ));
        }

        if (from || to || date) {
          return matchesRoute(flight, from, to) && matchesDepartureDate(flight, date);
        }

        return true;
      }

      return matchesRoute(flight, from, to) && matchesDepartureDate(flight, date);
    };

    const matchesAirlineFilter = (flight: Flight) => {
      if (!airlineFilters.length) return true;
      const flightAirline = String(flight.airline ?? '').toLowerCase();
      return airlineFilters.some((airline) => flightAirline.includes(String(airline).toLowerCase()));
    };

    const matchesBaggage = (flight: Flight) => {
      if (!checkInIncluded && !handLuggageIncluded) return true;
      return (checkInIncluded && flight.hasCheckInBaggage)
        || (handLuggageIncluded && flight.hasHandLuggage);
    };

    const matchScore = (flight: Flight) => {
      let score = 0;

      if (matchesRoute(flight, from, to)) score += 3;
      if (matchesDepartureDate(flight, date)) score += 2;
      if (matchesRoute(flight, to, from)) score += 2;
      if (returnDate && matchesDepartureDate(flight, returnDate)) score += 1;

      if (parsedLegs.length) {
        const legMatch = parsedLegs.some((leg) => (
          matchesRoute(flight, leg.from ?? '', leg.to ?? '')
          && matchesDepartureDate(flight, leg.departureDate ?? '')
        ));
        if (legMatch) score += 2;
      }

      return score;
    };

    const base = customerFlights.filter((flight) => {
      const matchesStops = stopFilters.includes(flight.stops);
      const matchesWindow = departureWindows.includes(getFlightWindow(flight.departureTime));
      const matchesPrice = flight.price >= selectedPriceRange[0] && flight.price <= selectedPriceRange[1];
      const duration = getDurationMinutes(flight);
      const matchesDuration = duration >= selectedDurationRange[0] && duration <= selectedDurationRange[1];

      return matchesTripType(flight)
        && matchesStops
        && matchesWindow
        && matchesAirlineFilter(flight)
        && matchesPrice
        && matchesDuration
        && matchesBaggage(flight);
    });

    const byDuration = (a: Flight, b: Flight) => getDurationMinutes(a) - getDurationMinutes(b);
    const byPrice = (a: Flight, b: Flight) => a.price - b.price;

    const bySortMode = (a: Flight, b: Flight) => {
      if (sortMode === 'cheapest') return byPrice(a, b);
      if (sortMode === 'quickest') return byDuration(a, b);

      const aScore = a.price * 0.6 + (getDurationMinutes(a) / 60) * 40;
      const bScore = b.price * 0.6 + (getDurationMinutes(b) / 60) * 40;
      return aScore - bScore;
    };

    return [...base].sort((a, b) => {
      const scoreDiff = matchScore(b) - matchScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return bySortMode(a, b);
    });
  }, [
    customerFlights,
    from,
    to,
    date,
    returnDate,
    tripType,
    legsParam,
    stopFilters,
    departureWindows,
    airlineFilters,
    selectedPriceRange,
    selectedDurationRange,
    checkInIncluded,
    handLuggageIncluded,
    sortMode,
  ]);

  const toggleStops = (stop: number) => {
    setStopFilters((prev) => (prev.includes(stop) ? prev.filter((value) => value !== stop) : [...prev, stop]));
  };

  const toggleDepartureWindow = (windowValue: DayWindow) => {
    setDepartureWindows((prev) => (
      prev.includes(windowValue)
        ? prev.filter((item) => item !== windowValue)
        : [...prev, windowValue]
    ));
  };

  const toggleAirline = (airline: string) => {
    setAirlineFilters((prev) => (
      prev.includes(airline)
        ? prev.filter((item) => item !== airline)
        : [...prev, airline]
    ));
  };

  const toggleSection = (section: FilterSection) => {
    setOpenSections((previous) => ({ ...previous, [section]: !previous[section] }));
  };

  const resetFilters = () => {
    setStopFilters([0, 1, 2]);
    setSortMode('quickest');
    setDepartureWindows(dayWindows);
    setAirlineFilters(allAirlines);
    setCheckInIncluded(false);
    setHandLuggageIncluded(false);
    setSelectedPriceRange([flightStats.minPrice, flightStats.maxPrice]);
    setSelectedDurationRange([flightStats.minDuration, flightStats.maxDuration]);
    setOpenSections(defaultSectionState);
  };

  if (isLoading || loading) {
    return renderLayout(
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg font-semibold text-slate-600">Loading flights...</div>
      </div>
    );
  }

  if (error) {
    return renderLayout(
      <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!isCustomer) {
    return renderLayout(
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Flight Management</h1>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingFlight(undefined);
              }}
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Add New Flight
            </button>
          </div>

          <Modal
            isOpen={showForm}
            onClose={() => {
              setShowForm(false);
              setEditingFlight(undefined);
            }}
            title={editingFlight ? 'Edit Flight' : 'Create New Flight'}
          >
            <FlightForm
              flight={editingFlight}
              onSubmit={editingFlight ? (data) => handleUpdate(editingFlight.id, data) : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingFlight(undefined);
              }}
            />
          </Modal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onEdit={(selected) => {
                  setEditingFlight(selected);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </>
    );
  }

  return renderLayout(
    <section className="space-y-5 px-1 sm:px-0">
        <div className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D6E0F4] bg-white text-[#1E3A8A] transition hover:bg-[#F3F6FD]"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1E3A8A] sm:text-4xl">Flight Search</h1>
          </div>
          <p className="mt-1 text-sm font-medium text-[#607BB1]">Search flights and quickly add your saved travelers</p>
        </div>

        <div className="rounded-2xl border border-[#E3E9F7] bg-white p-4 shadow-[0_10px_30px_rgba(30,58,138,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-black text-[#1E3A8A] sm:text-3xl">{filteredFlights.length}</p>
              <p className="text-sm font-semibold text-slate-500">flights found</p>
              <div className="hidden rounded-lg bg-[#F0F4FD] px-3 py-1 text-xs font-semibold text-[#1E3A8A] md:block">
                {from || 'From'} → {to || 'To'}
              </div>
              <div className="hidden rounded-lg bg-[#F0F4FD] px-3 py-1 text-xs font-semibold text-[#1E3A8A] md:block">
                x {adults} • {cabinClass.replace(' Class', '')}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['cheapest', 'quickest', 'best'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase ${
                    mode === sortMode
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-[#EEF3FD] text-[#1E3A8A]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`${mobileFilterOpen ? 'block' : 'hidden'} max-h-[70vh] overflow-y-auto rounded-2xl border border-[#E1E8F7] bg-white p-4 lg:block`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wider text-[#1E3A8A]">Filters</p>
              <button onClick={resetFilters} className="text-xs font-semibold text-[#E48C2A]">Reset All</button>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <button
                  onClick={() => toggleSection('stops')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Stops</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.stops ? 'rotate-180' : ''}`} />
                </button>
                {openSections.stops && <div className="space-y-2 text-slate-600">
                  {[
                    { id: 0, label: 'Direct', price: flightStats.directPrice },
                    { id: 1, label: '1 Stop', price: flightStats.oneStopPrice },
                    { id: 2, label: '2 Stops', price: flightStats.twoStopPrice },
                  ].map((stop) => (
                    <label key={stop.id} className="flex cursor-pointer items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={stopFilters.includes(stop.id)} onChange={() => toggleStops(stop.id)} />
                        {stop.label}
                      </span>
                      <span className="text-xs font-semibold text-[#607BB1]">
                        {stop.price != null ? `from ${formatPrice(stop.price)}` : '-'}
                      </span>
                    </label>
                  ))}
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Price per Adult</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.price ? 'rotate-180' : ''}`} />
                </button>
                {openSections.price && <div className="space-y-2">
                  <input
                    type="range"
                    min={flightStats.minPrice}
                    max={Math.max(flightStats.maxPrice, flightStats.minPrice + 1)}
                    value={selectedPriceRange[0]}
                    onChange={(event) => {
                      const nextMin = Number(event.target.value);
                      setSelectedPriceRange((previous) => [Math.min(nextMin, previous[1]), previous[1]]);
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={flightStats.minPrice}
                    max={Math.max(flightStats.maxPrice, flightStats.minPrice + 1)}
                    value={selectedPriceRange[1]}
                    onChange={(event) => {
                      const nextMax = Number(event.target.value);
                      setSelectedPriceRange((previous) => [previous[0], Math.max(nextMax, previous[0])]);
                    }}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between rounded-lg bg-[#EEF3FD] px-3 py-2 text-xs font-semibold text-[#1E3A8A]">
                    <span>{formatPrice(selectedPriceRange[0])}</span>
                    <span>{formatPrice(selectedPriceRange[1])}</span>
                  </div>
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('duration')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Max Duration</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.duration ? 'rotate-180' : ''}`} />
                </button>
                {openSections.duration && <div className="space-y-2">
                  <input
                    type="range"
                    min={flightStats.minDuration}
                    max={Math.max(flightStats.maxDuration, flightStats.minDuration + 1)}
                    value={selectedDurationRange[0]}
                    onChange={(event) => {
                      const nextMin = Number(event.target.value);
                      setSelectedDurationRange((previous) => [Math.min(nextMin, previous[1]), previous[1]]);
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={flightStats.minDuration}
                    max={Math.max(flightStats.maxDuration, flightStats.minDuration + 1)}
                    value={selectedDurationRange[1]}
                    onChange={(event) => {
                      const nextMax = Number(event.target.value);
                      setSelectedDurationRange((previous) => [previous[0], Math.max(nextMax, previous[0])]);
                    }}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between rounded-lg bg-[#EEF3FD] px-3 py-2 text-xs font-semibold text-[#1E3A8A]">
                    <span>{formatDuration(selectedDurationRange[0])}</span>
                    <span>{formatDuration(selectedDurationRange[1])}</span>
                  </div>
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('depart')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Outbound Depart</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.depart ? 'rotate-180' : ''}`} />
                </button>
                {openSections.depart && <>
                <p className="mb-2 text-[11px] font-semibold text-[#607BB1]">Departure Window</p>
                <div className="space-y-1.5 text-slate-600">
                  {dayWindows.map((windowValue) => (
                    <label key={windowValue} className="flex cursor-pointer items-center gap-2 capitalize">
                      <input
                        type="checkbox"
                        checked={departureWindows.includes(windowValue)}
                        onChange={() => toggleDepartureWindow(windowValue)}
                      />
                      {windowValue}
                    </label>
                  ))}
                </div>
                </>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('sort')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Sort Priority</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.sort ? 'rotate-180' : ''}`} />
                </button>
                {openSections.sort && <div className="grid grid-cols-3 gap-2">
                  {(['cheapest', 'quickest', 'best'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSortMode(mode)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${
                        mode === sortMode ? 'bg-[#1E3A8A] text-white' : 'bg-[#EEF3FD] text-[#1E3A8A]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('cabin')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Cabin</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.cabin ? 'rotate-180' : ''}`} />
                </button>
                {openSections.cabin && <div className="inline-flex items-center gap-2 rounded-lg bg-[#EEF3FD] px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                  <Plane size={12} />
                  {cabinClass}
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('airlines')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Airlines</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.airlines ? 'rotate-180' : ''}`} />
                </button>
                {openSections.airlines && <div className="space-y-1.5 text-slate-600">
                  {allAirlines.map((airline) => (
                    <label key={airline} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={airlineFilters.includes(airline)}
                        onChange={() => toggleAirline(airline)}
                      />
                      {airline}
                    </label>
                  ))}
                </div>}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('baggage')}
                  className="mb-2 flex w-full items-center justify-between"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#5C76AB]">Baggage</p>
                  <ChevronDown size={14} className={`text-[#5C76AB] transition ${openSections.baggage ? 'rotate-180' : ''}`} />
                </button>
                {openSections.baggage && <div className="space-y-1.5 text-slate-600">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={checkInIncluded} onChange={() => setCheckInIncluded((prev) => !prev)} />
                    Check-in baggage included
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={handLuggageIncluded} onChange={() => setHandLuggageIncluded((prev) => !prev)} />
                    Hand luggage included
                  </label>
                </div>}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex justify-end lg:hidden">
              <button
                onClick={() => setMobileFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-3 py-2 text-sm font-semibold text-white"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            {filteredFlights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C9D5F0] bg-white p-10 text-center text-[#5973AA]">
                No flights found for this route and date.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFlights.map((flight) => <FlightCard key={flight.id} flight={flight} onBook={handleBook} />)}
              </div>
            )}
          </div>
        </div>
    </section>
  );
};

export default FlightList;
