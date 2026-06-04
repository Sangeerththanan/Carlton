import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Minus, Plus, ShieldCheck } from 'lucide-react';
import type { BookingQuote, BookingState, FareBreakdown, PassengerForm } from '../types/flightTypes';
import { getFlightUiMeta } from '../data/flightUiMeta';
import type { SavedTraveler } from '../types/flightTypes';
import { flightUiConfig } from '../data/flightUiConfig';
import { bookingService } from '../services/bookingService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Navigation } from '../../landing/components/Navigation';
import { profileService } from '../../profile/services/profileService';
import type { SavedTraveller as ProfileSavedTraveller } from '../../profile/types/profile';
import type { PersonalDetails } from '../../profile/types/profile';
import { formatCurrency, formatDisplayDate, formatDisplayTime, getErrorMessage } from '../utils';

const ACCOUNT_OWNER_TRAVELER_ID = 'account-owner';

const splitName = (fullName?: string): { firstName: string; lastName: string } => {
  const safeName = (fullName ?? '').trim();
  if (!safeName) return { firstName: '', lastName: '' };

  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const mapProfileTravelerToBookingTraveler = (traveler: ProfileSavedTraveller): SavedTraveler => ({
  id: String(traveler.id),
  firstName: traveler.firstName,
  lastName: traveler.lastName,
  relation: 'Saved',
  title: 'Mr',
  gender: (traveler.gender === 'Female' || traveler.gender === 'Other' ? traveler.gender : 'Male') as SavedTraveler['gender'],
  dob: traveler.dateOfBirth ?? '',
  nationality: traveler.nationality ?? '',
  passportNumber: traveler.passportNumber ?? '',
  passportExpiry: traveler.passportExpiryDate ?? '',
});

const mapAccountOwnerToBookingTraveler = (
  details?: PersonalDetails,
  fallbackName?: string,
): SavedTraveler => {
  const fullName = `${details?.firstName ?? ''} ${details?.lastName ?? ''}`.trim() || fallbackName;
  const { firstName, lastName } = splitName(fullName);

  const resolvedTitle = details?.title;
  const safeTitle: SavedTraveler['title'] =
    resolvedTitle === 'Mr' || resolvedTitle === 'Ms' || resolvedTitle === 'Mrs' || resolvedTitle === 'Mx'
      ? resolvedTitle
      : 'Mr';

  return {
    id: ACCOUNT_OWNER_TRAVELER_ID,
    firstName,
    lastName,
    relation: 'Account Owner',
    title: safeTitle,
    gender: (details?.gender === 'Female' || details?.gender === 'Other' ? details.gender : 'Male') as SavedTraveler['gender'],
    dob: details?.dateOfBirth ?? '',
    nationality: details?.nationality ?? '',
    passportNumber: '',
    passportExpiry: '',
  };
};

const buildFormFromTraveler = (traveler?: SavedTraveler): PassengerForm => ({
  travelerId: traveler?.id ?? null,
  passengerType: traveler?.relation?.toLowerCase() === 'child' ? 'child' : 'adult',
  title: traveler?.title ?? 'Mr',
  givenName: traveler?.firstName ?? '',
  lastName: traveler?.lastName ?? '',
  gender: traveler?.gender ?? 'Male',
  dob: traveler?.dob ?? '',
  nationality: traveler?.nationality ?? '',
  passportNumber: traveler?.passportNumber ?? '',
  passportExpiry: traveler?.passportExpiry ?? '',
  mealPreference: 'Standard',
  seatPreference: 'Window',
});

const FlightBookingCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state ?? {}) as BookingState;
  const { showError } = useToast();
  const { isAuthenticated, user } = useAuth();

  const passengerCount = Math.max(1, Number(navState.passengerCount ?? 2));
  const [savedTravelers, setSavedTravelers] = useState<SavedTraveler[]>([]);
  const [selectedTravelerIds, setSelectedTravelerIds] = useState<string[]>([]);
  const [newTravelerIndex, setNewTravelerIndex] = useState(1);
  const [openExtrasIndex, setOpenExtrasIndex] = useState<number | null>(null);

  const [passengerForms, setPassengerForms] = useState<PassengerForm[]>(
    Array.from({ length: passengerCount }, () => buildFormFromTraveler()),
  );

  useEffect(() => {
    const fetchSavedTravelers = async () => {
      if (!isAuthenticated) {
        setSavedTravelers([]);
        setSelectedTravelerIds([]);
        return;
      }

      try {
        const [savedTravellersResult, personalDetailsResult] = await Promise.allSettled([
          profileService.getSavedTravellers(),
          profileService.getPersonalDetails(),
        ]);

        const mappedTravelers = savedTravellersResult.status === 'fulfilled'
          ? savedTravellersResult.value.map(mapProfileTravelerToBookingTraveler)
          : [];

        const accountOwner = personalDetailsResult.status === 'fulfilled'
          ? mapAccountOwnerToBookingTraveler(personalDetailsResult.value, user?.name)
          : mapAccountOwnerToBookingTraveler(undefined, user?.name);

        const combinedTravelers = [accountOwner, ...mappedTravelers];
        setSavedTravelers(combinedTravelers);
        setSelectedTravelerIds(combinedTravelers.slice(0, passengerCount).map((traveler) => traveler.id));

        const ownerEmail = personalDetailsResult.status === 'fulfilled'
          ? (personalDetailsResult.value.email ?? user?.username ?? '')
          : (user?.username ?? '');

        setContactDetails({
          email: ownerEmail,
          confirmEmail: ownerEmail,
          phone: personalDetailsResult.status === 'fulfilled' ? (personalDetailsResult.value.phone ?? '') : '',
          country: personalDetailsResult.status === 'fulfilled' ? (personalDetailsResult.value.country ?? '') : '',
        });

        if (savedTravellersResult.status === 'rejected') {
          showError(getErrorMessage(savedTravellersResult.reason));
        }

        if (personalDetailsResult.status === 'rejected') {
          showError(getErrorMessage(personalDetailsResult.reason));
        }
      } catch (errorValue) {
        showError(getErrorMessage(errorValue));
      }
    };

    fetchSavedTravelers();
  }, [passengerCount, showError, isAuthenticated, user?.name, user?.username]);

  useEffect(() => {
    setPassengerForms((previous) => {
      if (previous.length === 0) {
        return Array.from({ length: passengerCount }, () => buildFormFromTraveler());
      }

      return previous.map((form, index) => {
        if (index === 0 && form.passengerType !== 'adult') {
          return { ...form, passengerType: 'adult' };
        }

        return form;
      });
    });
  }, [passengerCount]);

  const selectedTravelers = useMemo(() => {
    return selectedTravelerIds
      .map((id) => savedTravelers.find((traveler) => traveler.id === id))
      .filter((traveler): traveler is SavedTraveler => Boolean(traveler));
  }, [savedTravelers, selectedTravelerIds]);

  useEffect(() => {
    setPassengerForms((previous) => {
      const nextLength = Math.max(previous.length, passengerCount, selectedTravelers.length);
      const nextForms = Array.from({ length: nextLength }, (_, index) => {
        const traveler = selectedTravelers[index];
        if (traveler) return buildFormFromTraveler(traveler);

        const existing = previous[index];
        if (existing?.travelerId) {
          return buildFormFromTraveler();
        }

        return existing ?? buildFormFromTraveler();
      });
      return nextForms;
    });
  }, [selectedTravelers, passengerCount]);

  const chosenFlight = useMemo(() => {
    if (!navState.flight) return null;
    return { ...navState.flight, ...getFlightUiMeta(navState.flight) };
  }, [navState.flight]);

  const isRoundTrip = navState.tripType === 'round-trip' || Boolean(navState.returnDate);
  const [quote, setQuote] = useState<BookingQuote | null>(null);

  const hasPassengerData = (form: PassengerForm) => Boolean(
    form.travelerId ||
    form.givenName.trim() ||
    form.lastName.trim() ||
    form.dob.trim() ||
    form.passportNumber.trim() ||
    form.passportExpiry.trim()
  );

  const activePassengerForms = useMemo(
    () => passengerForms.filter(hasPassengerData),
    [passengerForms],
  );

  const passengerTypeCounts = useMemo(() => {
    return {
      adultCount: activePassengerForms.filter((form) => form.passengerType === 'adult').length,
      childCount: activePassengerForms.filter((form) => form.passengerType === 'child').length,
      infantCount: activePassengerForms.filter((form) => form.passengerType === 'infant').length,
    };
  }, [activePassengerForms]);

  useEffect(() => {
    if (!chosenFlight) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      try {
        const response = await bookingService.getBookingQuote({
          flightId: chosenFlight.id,
          adultCount: Math.max(1, passengerTypeCounts.adultCount),
          childCount: passengerTypeCounts.childCount,
          infantCount: passengerTypeCounts.infantCount,
          isRoundTrip,
          cabinClass: navState.cabinClass ?? 'Economy',
        });

        setQuote(response);
      } catch (errorValue) {
        showError(getErrorMessage(errorValue));
      }
    };

    fetchQuote();
  }, [
    chosenFlight,
    isRoundTrip,
    navState.cabinClass,
    passengerTypeCounts.adultCount,
    passengerTypeCounts.childCount,
    passengerTypeCounts.infantCount,
    showError,
  ]);

  const fareBreakdown = useMemo<FareBreakdown>(() => {
    if (quote) {
      return {
        adultCount: quote.adultCount,
        childCount: quote.childCount,
        infantCount: quote.infantCount,
        adultSubtotal: quote.adultSubtotal,
        childSubtotal: quote.childSubtotal,
        infantSubtotal: quote.infantSubtotal,
        baseFare: quote.baseFare,
        taxes: quote.taxes,
        fees: quote.fees,
        total: quote.total,
      };
    }

    return {
      adultCount: passengerTypeCounts.adultCount,
      childCount: passengerTypeCounts.childCount,
      infantCount: passengerTypeCounts.infantCount,
      adultSubtotal: 0,
      childSubtotal: 0,
      infantSubtotal: 0,
      baseFare: 0,
      taxes: 0,
      fees: 0,
      total: 0,
    };
  }, [passengerTypeCounts.adultCount, passengerTypeCounts.childCount, passengerTypeCounts.infantCount, quote]);

  const passengerRateRule = quote
    ? {
      adultMultiplier: quote.adultMultiplier,
      childMultiplier: quote.childMultiplier,
      infantMultiplier: quote.infantMultiplier,
      label: quote.passengerRateRuleLabel,
    }
    : {
      adultMultiplier: 1,
      childMultiplier: 0.75,
      infantMultiplier: 0.1,
      label: 'Standard family fare rule',
    };

  const pointsEarned = quote?.pointsEarned ?? 0;

  const leadPassenger = passengerForms[0];

  const [contactDetails, setContactDetails] = useState({
    email: '',
    confirmEmail: '',
    phone: '',
    country: '',
  });

  const toggleTraveler = (id: string) => {
    setSelectedTravelerIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((travelerId) => travelerId !== id);
      }

      return [...previous, id];
    });
  };

  const addPassenger = () => {
    setPassengerForms((previous) => [...previous, buildFormFromTraveler()]);
  };

  const removePassenger = (index: number) => {
    if (index === 0) return;

    setPassengerForms((previous) => previous.filter((_, current) => current !== index));
    setSelectedTravelerIds((previous) => previous.filter((_, current) => current !== index));
    setOpenExtrasIndex((current) => (current === index ? null : current));
  };

  const addNewTraveler = () => {
    const key = `N${newTravelerIndex}`;
    const traveler: SavedTraveler = {
      id: key,
      firstName: `Traveler${newTravelerIndex}`,
      lastName: 'New',
      relation: 'Guest',
      title: 'Mr',
      gender: 'Male',
      dob: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
    };

    setSavedTravelers((previous) => [...previous, traveler]);
    setNewTravelerIndex((value) => value + 1);
    toggleTraveler(key);
  };

  const updatePassengerField = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengerForms((previous) => previous.map((form, current) => (
      current === index ? { ...form, [field]: value } : form
    )));
  };

  const updatePassengerType = (index: number, value: PassengerForm['passengerType']) => {
    setPassengerForms((previous) => previous.map((form, current) => (
      current === index ? { ...form, passengerType: value } : form
    )));
  };

  const handleGoToPayment = () => {
    navigate('/flight-package', {
      state: {
        flight: chosenFlight,
        passengerForms: activePassengerForms,
        savedTravelers,
        selectedTravelerIds,
        cabinClass: navState.cabinClass,
        tripType: navState.tripType,
        returnDate: navState.returnDate,
        passengerCount: Math.max(1, activePassengerForms.length),
        passengerRateRule,
        total: fareBreakdown.total,
        taxes: fareBreakdown.taxes,
        fees: fareBreakdown.fees,
        pointsEarned,
        fareBreakdown,
        quote,
      },
    });
  };

  if (!chosenFlight) {
    const content = (
      <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[#4B66A1]">No flight selected for booking.</p>
        <button
          onClick={() => navigate('/flights')}
          className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Flights
        </button>
      </section>
    );

    if (isAuthenticated) {
      return <DashboardLayout>{content}</DashboardLayout>;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6">
          {content}
        </div>
      </div>
    );
  }

  const bookingContent = (
    <section className="space-y-4 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6E0F4] bg-white text-[#1E3A8A] hover:bg-[#F3F6FD]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#1E3A8A]">
              {isAuthenticated ? 'Quick-Fill from Saved Travelers' : 'Flight Booking'}
            </h1>
            <p className="text-sm text-[#607BB1]">
              {isAuthenticated ? 'Select profiles below - forms fill automatically' : 'Complete your passenger details'}
            </p>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={addNewTraveler}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4DEEF] bg-white px-3 py-2 text-sm font-semibold text-[#1E3A8A] hover:bg-[#F4F7FE] sm:w-auto"
          >
            <Plus size={14} />
            New Traveler
          </button>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-4">
          {isAuthenticated && (
            <section className="rounded-2xl border border-[#E1E8F7] bg-white p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1E3A8A]">Selected:</p>
                <span className="text-xs text-[#6C83B3]">{selectedTravelers.length} selected</span>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTravelers.map((traveler) => (
                  <button
                    key={traveler.id}
                    onClick={() => toggleTraveler(traveler.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#EEF3FD] px-2.5 py-1 text-xs font-semibold text-[#1E3A8A]"
                  >
                    <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1E3A8A] text-[9px] text-white">
                      {traveler.id}
                    </span>
                    {traveler.firstName}
                    <span>×</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {savedTravelers.map((traveler) => {
                  const selected = selectedTravelerIds.includes(traveler.id);
                  return (
                    <button
                      key={traveler.id}
                      onClick={() => toggleTraveler(traveler.id)}
                      className={`rounded-xl border px-2.5 py-2 text-left ${
                        selected
                          ? 'border-[#8EA5D9] bg-[#F1F5FE]'
                          : 'border-[#E3EAF8] bg-white hover:bg-[#FAFCFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1E3A8A]">
                          {traveler.firstName} {traveler.lastName}
                        </span>
                        {selected && <Check size={14} className="text-[#1E3A8A]" />}
                      </div>
                      <p className="text-xs text-[#6D84B3]">{traveler.relation}</p>
                      <p className="text-xs text-slate-500">Passport: {traveler.passportNumber}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {passengerForms.map((form, index) => (
            <section key={`${index}-${form.travelerId ?? 'manual'}`} className="rounded-2xl border border-[#E1E8F7] bg-white p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1E3A8A]">
                    {index + 1}. {index === 0 ? 'Lead Passenger' : `Passenger ${index + 1}`}
                  </p>
                  <p className="text-xs text-[#6B82B0]">As per passport</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EFF5FF] px-2.5 py-1 text-xs font-semibold text-[#1E3A8A]">
                    {form.travelerId ? 'Auto-filled' : 'Manual'}
                  </span>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D6E0F4] text-[#9B4F3F] hover:bg-[#FFF6F4]"
                    >
                      <Minus size={12} />
                    </button>
                  )}
                </div>
              </div>

              {index === 0 && (
                <div className="mb-3 rounded-xl border border-dashed border-[#D8E4F7] bg-[#FBFCFF] p-3 text-xs text-[#607BB1]">
                  As per passport - {leadPassenger?.givenName || 'Lead passenger'} {leadPassenger?.lastName || ''}
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-semibold text-[#607BB1] md:col-span-3">
                  Passenger Type
                  <select
                    value={form.passengerType}
                    onChange={(event) => updatePassengerType(index, event.target.value as PassengerForm['passengerType'])}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant">Infant</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Title
                  <select
                    value={form.title}
                    onChange={(event) => updatePassengerField(index, 'title', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Mx">Mx</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Given Name
                  <input
                    value={form.givenName}
                    onChange={(event) => updatePassengerField(index, 'givenName', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Last Name
                  <input
                    value={form.lastName}
                    onChange={(event) => updatePassengerField(index, 'lastName', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Gender
                  <select
                    value={form.gender}
                    onChange={(event) => updatePassengerField(index, 'gender', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Date of Birth
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(event) => updatePassengerField(index, 'dob', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Nationality
                  <input
                    value={form.nationality}
                    onChange={(event) => updatePassengerField(index, 'nationality', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Passport Number
                  <input
                    value={form.passportNumber}
                    onChange={(event) => updatePassengerField(index, 'passportNumber', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>

                <label className="text-xs font-semibold text-[#607BB1]">
                  Passport Expiry
                  <input
                    type="date"
                    value={form.passportExpiry}
                    onChange={(event) => updatePassengerField(index, 'passportExpiry', event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                  />
                </label>
              </div>

              <button
                onClick={() => setOpenExtrasIndex((current) => (current === index ? null : index))}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#496BB0]"
              >
                Optional Extras - Meal & seat preferences
                <ChevronDown size={14} className={openExtrasIndex === index ? 'rotate-180' : ''} />
              </button>

              {openExtrasIndex === index && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#607BB1]">
                    Meal
                    <select
                      value={form.mealPreference}
                      onChange={(event) => updatePassengerField(index, 'mealPreference', event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                    >
                      <option>Standard</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                      <option>Gluten Free</option>
                    </select>
                  </label>

                  <label className="text-xs font-semibold text-[#607BB1]">
                    Seat
                    <select
                      value={form.seatPreference}
                      onChange={(event) => updatePassengerField(index, 'seatPreference', event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                    >
                      <option>Window</option>
                      <option>Aisle</option>
                      <option>Middle</option>
                    </select>
                  </label>
                </div>
              )}
            </section>
          ))}

          <button
            type="button"
            onClick={addPassenger}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#CAD7F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#1E3A8A] hover:bg-[#F5F8FF]"
          >
            <Plus size={14} />
            Add More Passenger Details
          </button>

          <section className="rounded-2xl border border-[#E1E8F7] bg-white p-4">
            <h3 className="text-base font-bold text-[#1E3A8A]">Contact Details</h3>
            <p className="mb-3 text-xs text-[#6A81AF]">Booking confirmation and e-tickets sent here</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#607BB1]">
                Email Address
                <input
                  value={contactDetails.email}
                  onChange={(event) => setContactDetails((previous) => ({ ...previous, email: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                />
              </label>

              <label className="text-xs font-semibold text-[#607BB1]">
                Confirm Email
                <input
                  value={contactDetails.confirmEmail}
                  onChange={(event) => setContactDetails((previous) => ({ ...previous, confirmEmail: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                />
              </label>

              <label className="text-xs font-semibold text-[#607BB1]">
                Phone Number
                <input
                  value={contactDetails.phone}
                  onChange={(event) => setContactDetails((previous) => ({ ...previous, phone: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                />
              </label>

              <label className="text-xs font-semibold text-[#607BB1]">
                Country of Residence
                <input
                  value={contactDetails.country}
                  onChange={(event) => setContactDetails((previous) => ({ ...previous, country: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-[#DCE5F6] px-3 text-sm"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#DCE6FA] bg-white p-4 shadow-[0_8px_24px_rgba(30,58,138,0.08)] lg:sticky lg:top-4">
            <h3 className="text-lg font-black text-[#1E3A8A]">Booking Summary</h3>

            <div className="mt-3 rounded-xl border border-[#E5ECFB] bg-[#F8FAFF] p-3">
              <div className="flex items-center justify-between text-sm font-semibold text-[#1E3A8A]">
                <span>{chosenFlight.departure.split('(')[0].trim()}</span>
                <span>{chosenFlight.destination.split('(')[0].trim()}</span>
              </div>
              <p className="mt-1 text-xs text-[#6C83B3]">
                {formatDisplayDate(chosenFlight.departureTime)} · {formatDisplayTime(chosenFlight.departureTime)}
              </p>
              <p className="text-xs text-[#6C83B3]">
                {formatDisplayDate(chosenFlight.arrivalTime)} · {formatDisplayTime(chosenFlight.arrivalTime)}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#4C67A2]">
                {chosenFlight.stops === 0 ? 'Direct' : `${chosenFlight.stops} stop`} · {chosenFlight.airline}
              </p>
              <p className="text-xs text-[#4C67A2]">{navState.cabinClass ?? 'Business'} · Baggage incl.</p>
              <p className="text-xs text-[#4C67A2]">
                {chosenFlight.flightNumber}
                {isRoundTrip ? ` · Round Trip${navState.returnDate ? ` · ${formatDisplayDate(navState.returnDate)} return` : ''}` : ' · One Way'}
              </p>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Base fare
                  {fareBreakdown.adultCount > 0 ? ` - ${fareBreakdown.adultCount} adult${fareBreakdown.adultCount > 1 ? 's' : ''}` : ''}
                  {fareBreakdown.childCount > 0 ? `, ${fareBreakdown.childCount} child${fareBreakdown.childCount > 1 ? 'ren' : ''}` : ''}
                  {fareBreakdown.infantCount > 0 ? `, ${fareBreakdown.infantCount} infant${fareBreakdown.infantCount > 1 ? 's' : ''}` : ''}
                </span>
                <span className="font-semibold text-[#1E3A8A]">{formatCurrency(fareBreakdown.baseFare)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6A81AF]">
                <span>Child rate</span>
                <span>{Math.round(passengerRateRule.childMultiplier * 100)}% rule</span>
              </div>
              <div className="flex justify-between text-xs text-[#6A81AF]">
                <span>Infant rate</span>
                <span>{Math.round(passengerRateRule.infantMultiplier * 100)}% rule</span>
              </div>
              <p className="text-xs font-semibold text-[#4E67A0]">{passengerRateRule.label}</p>
              <div className="flex justify-between">
                <span className="text-slate-600">Taxes</span>
                <span className="font-semibold text-[#1E3A8A]">{formatCurrency(fareBreakdown.taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fees</span>
                <span className="font-semibold text-[#1E3A8A]">{formatCurrency(fareBreakdown.fees)}</span>
              </div>
              <div className="border-t border-[#E4EAF7] pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#1E3A8A]">Total Price</span>
                  <span className="text-lg font-black text-[#1E3A8A]">{formatCurrency(fareBreakdown.total)}</span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-[#5E78AF]">
              You'll earn {pointsEarned.toLocaleString()} loyalty points on this booking
            </p>

            <div className="mt-3 rounded-xl border border-[#E4ECFB] bg-[#F9FBFF] p-3">
              <p className="text-xs font-semibold text-[#4D69A5]">Lead Passenger</p>
              <p className="text-sm font-bold text-[#1E3A8A]">
                {leadPassenger?.title} {leadPassenger?.givenName} {leadPassenger?.lastName}
              </p>
              <p className="text-xs text-slate-500">Passport: {leadPassenger?.passportNumber || '-'}</p>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-[#F59E0B] px-4 py-3 text-sm font-bold text-white hover:bg-[#d88c0b]"
              onClick={handleGoToPayment}
            >
              Go for Payment {'->'}
            </button>

            <div className="mt-3 space-y-1 text-xs text-[#5F78AB]">
              <p className="inline-flex items-center gap-1">
                <ShieldCheck size={13} />
                Secure and encrypted payment
              </p>
              <p>{flightUiConfig.supportLabel}: {flightUiConfig.supportPhone}</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );

  // Render with appropriate layout based on auth status
  if (isAuthenticated) {
    return <DashboardLayout>{bookingContent}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6">
        {bookingContent}
      </div>
    </div>
  );
};

export default FlightBookingCustomer;
