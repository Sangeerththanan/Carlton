import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import type { BookingState, RefundOption, ServicePackageOption } from '../types/flightTypes';
import { getFlightUiMeta } from '../data/flightUiMeta';
import { flightUiConfig } from '../data/flightUiConfig';
import { bookingService } from '../services/bookingService';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Navigation } from '../../landing/components/Navigation';
import { formatCurrency, formatDisplayDateShortYear } from '../utils';
import CarSearchForm from '../components/CarSearchForm';

const FlightBookingPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as BookingState;
  const { showError } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedRefundId, setSelectedRefundId] = useState('');
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [servicePackages, setServicePackages] = useState<ServicePackageOption[]>([]);
  const [refundOptions, setRefundOptions] = useState<RefundOption[]>([]);
  const [quote, setQuote] = useState(state.quote ?? null);
  const [showCarSection, setShowCarSection] = useState(false);

  const selectedFlight = useMemo(() => {
    if (!state.flight) return null;
    return { ...state.flight, ...getFlightUiMeta(state.flight) };
  }, [state.flight]);

  const passengerForms = state.passengerForms ?? [];
  const activePassengerForms = useMemo(
    () =>
      passengerForms.filter((passenger) =>
        Boolean(
          passenger.travelerId ||
            passenger.givenName.trim() ||
            passenger.lastName.trim() ||
            passenger.dob.trim() ||
            passenger.passportNumber.trim() ||
            passenger.passportExpiry.trim(),
        ),
      ),
    [passengerForms],
  );
  const passengerCount = Math.max(1, state.passengerCount ?? activePassengerForms.length ?? 1);
  const passengerRateRule = state.passengerRateRule ?? { adultMultiplier: 1, childMultiplier: 0.75, infantMultiplier: 0.1, label: 'Standard family fare rule' };

  const getDefaultPackage = (packages: ServicePackageOption[]) => {
    if (!packages.length) return null;
    return (
      [...packages]
        .filter((entry) => entry.pricePerPassenger >= 0)
        .sort((left, right) => left.pricePerPassenger - right.pricePerPassenger)[0] ?? packages[0]
    );
  };

  // Catalog endpoints are anonymous-friendly, so guests and logged-in users share the same source.
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [packagesResponse, refundsResponse] = await Promise.all([
          bookingService.getServicePackages(),
          bookingService.getRefundOptions(),
        ]);

        setServicePackages(packagesResponse);
        setRefundOptions(refundsResponse);

        const topPackage = getDefaultPackage(packagesResponse) ?? packagesResponse[0];
        const recommendedRefund = refundsResponse.find((entry) => entry.recommended) ?? refundsResponse[0];

        setSelectedPackageId(topPackage?.id ?? '');
        setSelectedRefundId(recommendedRefund?.id ?? '');
      } catch {
        showError('Failed to load package and refund options.');
      } finally {
        setIsCatalogLoading(false);
      }
    };

    fetchCatalogs();
  }, [showError]);

  const selectedPackage = servicePackages.find((entry) => entry.id === selectedPackageId) ?? servicePackages[0] ?? null;
  const selectedRefund = refundOptions.find((entry) => entry.id === selectedRefundId) ?? refundOptions[0] ?? null;

  useEffect(() => {
    if (isCatalogLoading || !selectedFlight || !selectedPackage || !selectedRefund) {
      return;
    }

    const adultCount =
      (state.fareBreakdown?.adultCount ?? activePassengerForms.filter((passenger) => passenger.passengerType === 'adult').length) || 1;
    const childCount = state.fareBreakdown?.childCount ?? activePassengerForms.filter((passenger) => passenger.passengerType === 'child').length;
    const infantCount =
      state.fareBreakdown?.infantCount ?? activePassengerForms.filter((passenger) => passenger.passengerType === 'infant').length;

    const fetchQuote = async () => {
      try {
        const response = await bookingService.getBookingQuote({
          flightId: selectedFlight.id,
          adultCount,
          childCount,
          infantCount,
          isRoundTrip: state.tripType === 'round-trip' || Boolean(state.returnDate),
          cabinClass: state.cabinClass ?? 'Economy',
          packageId: selectedPackage.id,
          refundId: selectedRefund.id,
        });

        setQuote(response);
      } catch {
        showError('Failed to calculate quote.');
      }
    };

    fetchQuote();
  }, [
    activePassengerForms,
    isCatalogLoading,
    selectedFlight,
    selectedPackage,
    selectedRefund,
    showError,
    state.cabinClass,
    state.fareBreakdown?.adultCount,
    state.fareBreakdown?.childCount,
    state.fareBreakdown?.infantCount,
    state.returnDate,
    state.tripType,
  ]);

  const baseTotal = Number(quote?.baseFare ?? state.fareBreakdown?.baseFare ?? state.fareBreakdown?.total ?? state.total ?? 0);
  const packageCharge = Number(quote?.packageChargePerPassenger ?? selectedPackage?.pricePerPassenger ?? 0);
  const refundableCharge = Number(quote?.refundChargePerPassenger ?? selectedRefund?.pricePerPassenger ?? 0);
  const packageChargeTotal = Number(quote?.packageChargeTotal ?? packageCharge * passengerCount);
  const refundChargeTotal = Number(quote?.refundChargeTotal ?? refundableCharge * passengerCount);
  const finalTotal = Number(quote?.total ?? (baseTotal + packageChargeTotal + refundChargeTotal));

  if (!selectedFlight) {
    return (
      <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[#4B66A1]">No booking found.</p>
        <button
          onClick={() => navigate('/flights')}
          className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Flights
        </button>
      </section>
    );
  }

  const content = (
    <section className="space-y-4 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6E0F4] bg-white text-[#1E3A8A] hover:bg-[#F3F6FD]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#1E3A8A]">Choose Your Service Pack</h1>
          <p className="text-sm text-[#607BB1]">Enhance your booking with protection and perks</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)] xl:items-start">
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#DCE6FA] bg-white p-4 shadow-[0_8px_24px_rgba(30,58,138,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B66A1]">Selected Flight</p>
                <h2 className="mt-1 text-xl font-black text-[#1E3A8A]">
                  {selectedFlight.airline} · {state.cabinClass ?? 'Business'} Class
                </h2>
                <p className="text-sm text-[#6A81AF]">{selectedFlight.departure} → {selectedFlight.destination}</p>
              </div>
              <div className="rounded-full bg-[#FFF7E6] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#E08A00]">
                Top choice
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Outbound', value: new Date(selectedFlight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Duration', value: state.tripType === 'round-trip' ? 'Round Trip' : 'One Way' },
                { label: 'Flight No.', value: selectedFlight.flightNumber },
                { label: 'Cabin', value: state.cabinClass ?? 'Business' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#E5ECFB] bg-[#FBFCFF] px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B82B0]">{item.label}</p>
                  <p className="mt-1 text-sm font-black text-[#1E3A8A]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl bg-[#F8FAFF] p-3 text-sm text-[#425C93] ring-1 ring-[#E5ECFB]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>{selectedFlight.departure.split('(')[0].trim()} · {selectedFlight.destination.split('(')[0].trim()}</span>
                <span>{selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop`}</span>
                <span>{selectedFlight.hasCheckInBaggage ? 'Check-in bag included' : 'No check-in bag'}</span>
                <span>{state.returnDate ? `${formatDisplayDateShortYear(state.returnDate)} return` : 'Outbound only'}</span>
              </div>
            </div>
            </section>

            <section className="rounded-2xl border border-[#DCE6FA] bg-white p-4 shadow-[0_8px_24px_rgba(30,58,138,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B66A1]">Traveller Information</p>
                <h3 className="text-base font-black text-[#1E3A8A]">Passenger details as entered</h3>
              </div>
              <button onClick={() => navigate('/flight-booking', { state })} className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                Edit Passengers
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {passengerForms.map((passenger, index) => (
                <div key={`${passenger.travelerId ?? 'manual'}-${index}`} className="rounded-xl border border-[#E7EDF8] bg-[#FBFCFF] p-3">
                  <p className="text-xs font-semibold text-[#6A81AF]">{index === 0 ? 'Lead' : `Passenger ${index + 1}`}</p>
                  <p className="mt-1 text-sm font-bold text-[#1E3A8A]">{passenger.givenName} {passenger.lastName}</p>
                  <p className="text-xs text-slate-500">DOB: {formatDisplayDateShortYear(passenger.dob)}</p>
                  <p className="mt-1 text-xs text-[#5D76AD]">{passenger.passengerType}</p>
                </div>
              ))}
            </div>
            </section>
          </div>

          <section className="rounded-2xl border border-[#F0D199] bg-[#FFFDF5] p-4 shadow-[0_8px_24px_rgba(224,138,0,0.06)] xl:row-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D07E00]">Make My Booking Refundable</p>
                <h3 className="text-base font-black text-[#1E3A8A]">Recommended</h3>
              </div>
              <p className="text-sm font-semibold text-[#1E3A8A]">{formatCurrency(refundableCharge)} per passenger</p>
            </div>

            <div className="mt-3 space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {(selectedRefund?.bullets ?? []).map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2 text-sm text-[#425C93]">
                    <Check size={14} className="text-[#F59E0B]" />
                    {bullet}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#F2D9A3] bg-white p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {refundOptions.map((option) => {
                    const isSelected = selectedRefundId === option.id;
                    const subtitle = option.recommended
                      ? `${formatCurrency(option.pricePerPassenger)} per passenger`
                      : 'No additional charge';
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedRefundId(option.id)}
                        className={`rounded-xl border px-3 py-3 text-left ${isSelected ? 'border-[#243E99] bg-[#F4F7FF]' : 'border-[#DCE6FA] bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full border-2 ${isSelected ? 'border-[#243E99] bg-[#243E99]' : 'border-[#BFC9DF]'}`} />
                          <div>
                            <p className="text-sm font-bold text-[#1E3A8A]">{option.title}</p>
                            <p className="text-xs text-[#6A81AF]">{subtitle}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-[#5F78AB]">
                  <p>
                    Upgrade your booking and receive a 100% refund if you cannot attend for one of the many reasons in our Terms and Conditions.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-2xl border border-[#DCE6FA] bg-white p-4 shadow-[0_8px_24px_rgba(30,58,138,0.08)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B66A1]">Choose Your Service Pack</p>
                <p className="text-sm text-[#627BAB]">Enhance your booking with protection and perks</p>
              </div>
              <span className="rounded-full bg-[#FFF1D6] px-3 py-1 text-xs font-bold text-[#E08A00]">Recommended</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {servicePackages.map((entry) => {
                const selected = selectedPackageId === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedPackageId(entry.id)}
                    className={`rounded-2xl border p-3 text-left transition ${selected ? 'border-[#1E3A8A] bg-[#F4F7FF]' : 'border-[#DDE6F8] bg-white hover:bg-[#FBFCFF]'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-[#1E3A8A]">{entry.name}</p>
                          {entry.topChoice && <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">Top Choice</span>}
                        </div>
                        <p className="text-xs text-[#6D84B3]">Price {formatCurrency(entry.pricePerPassenger)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${selected ? 'bg-[#243E99] text-white' : 'bg-[#E6EBF5] text-[#223B88]'}`}>
                        {selected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-xs text-[#425C93]">
                      {(entry.features ?? []).slice(0, 3).map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check size={13} className="text-[#1E3A8A]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <section className="mt-4 rounded-xl border border-[#DCE6FA] bg-[#FBFCFF] p-3 text-xs text-[#5F78AB]">
              <p className="font-semibold text-[#1E3A8A]">Payment notice</p>
              <p className="mt-1">
                Payments for airline failure protection or service packages at any level are non-refundable. Please review before selecting.
              </p>
            </section>

            {/* Add Car Section Button */}
            <button
              onClick={() => setShowCarSection(!showCarSection)}
              className="mt-4 w-full rounded-xl border-2 border-[#1E3A8A] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#F3F6FD]"
            >
              {showCarSection ? '✕ Remove Car' : '+ Add Car Rental'}
            </button>

            {/* Car Search Section */}
            {showCarSection && (
              <CarSearchForm 
                variant="inline"
                onSearch={(data) => console.log('Car search:', data)}
              />
            )}
          </section>

          <section className="rounded-2xl border border-[#DCE6FA] bg-white p-4 shadow-[0_8px_24px_rgba(30,58,138,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4B66A1]">Booking Summary</p>
                <h3 className="text-base font-black text-[#1E3A8A]">Ready for payment</h3>
              </div>
              <div className="text-right text-sm font-semibold text-[#1E3A8A]">
                Total Price {formatCurrency(finalTotal)}
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-xl border border-[#E5ECFB] bg-[#FBFCFF] p-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Base fare
                    {state.fareBreakdown?.adultCount ? ` - ${state.fareBreakdown.adultCount} adult${state.fareBreakdown.adultCount > 1 ? 's' : ''}` : ''}
                    {state.fareBreakdown?.childCount ? `, ${state.fareBreakdown.childCount} child${state.fareBreakdown.childCount > 1 ? 'ren' : ''}` : ''}
                    {state.fareBreakdown?.infantCount ? `, ${state.fareBreakdown.infantCount} infant${state.fareBreakdown.infantCount > 1 ? 's' : ''}` : ''}
                  </span>
                  <span className="font-semibold text-[#1E3A8A]">{formatCurrency(baseTotal)}</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#6A81AF]">
                  <span>Child rate</span>
                  <span>{Math.round(passengerRateRule.childMultiplier * 100)}% rule</span>
                </div>
                <div className="flex justify-between text-xs text-[#6A81AF]">
                  <span>Infant rate</span>
                  <span>{Math.round(passengerRateRule.infantMultiplier * 100)}% rule</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-[#4E67A0]">{passengerRateRule.label}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E5ECFB] bg-[#FBFCFF] p-3 text-sm text-[#425C93]">
                  <span className="block text-xs text-[#6A81AF]">Taxes</span>
                  <span className="mt-1 block font-semibold text-[#1E3A8A]">{formatCurrency(Number(state.taxes ?? 0))}</span>
                </div>
                <div className="rounded-xl border border-[#E5ECFB] bg-[#FBFCFF] p-3 text-sm text-[#425C93]">
                  <span className="block text-xs text-[#6A81AF]">Fees</span>
                  <span className="mt-1 block font-semibold text-[#1E3A8A]">{formatCurrency(Number(state.fees ?? 0))}</span>
                </div>
                <div className="rounded-xl border border-[#E5ECFB] bg-[#FBFCFF] p-3 text-sm text-[#425C93]">
                  <span className="block text-xs text-[#6A81AF]">Travellers</span>
                  <span className="mt-1 block font-semibold text-[#1E3A8A]">{passengerCount} passengers</span>
                </div>
              </div>

              <div className="border-t border-[#E5ECFB] pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#1E3A8A]">Total Price</span>
                  <span className="text-lg font-black text-[#1E3A8A]">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-[#5E78AF]">
              You'll earn {Number(state.pointsEarned ?? Math.round(finalTotal * 0.342)).toLocaleString()} loyalty points on this booking
            </p>

            <button
              className="mt-4 w-full rounded-xl bg-[#F59E0B] px-4 py-3 text-sm font-bold text-white hover:bg-[#d88c0b] disabled:cursor-not-allowed disabled:bg-[#f3be64]"
              disabled={isCatalogLoading || !selectedPackage || !selectedRefund}
              onClick={() => {
                if (!selectedPackage || !selectedRefund) {
                  showError('Package and refund options are still loading. Please wait a moment and try again.');
                  return;
                }

                navigate('/flight-payment', {
                  state: {
                    ...state,
                    total: finalTotal,
                    baseFareTotal: baseTotal,
                    selectedPackageId,
                    selectedPackageName: selectedPackage.name,
                    packageChargePerPassenger: packageCharge,
                    packageChargeTotal,
                    selectedRefundId,
                    selectedRefundTitle: selectedRefund.title,
                    refundChargePerPassenger: refundableCharge,
                    refundChargeTotal,
                    quote,
                  },
                });
              }}
            >
              Go for Payment -&gt;
            </button>

            <div className="mt-3 space-y-1 text-xs text-[#5F78AB]">
              <p className="inline-flex items-center gap-1">
                <Check size={13} />
                Secure & encrypted payment
              </p>
              <p>
                {flightUiConfig.supportLabel}: {flightUiConfig.supportPhone}
              </p>
            </div>
          </section>
        </div>
      </div>
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
};

export default FlightBookingPackage;
