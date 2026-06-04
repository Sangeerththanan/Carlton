import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { AlertCircle, ArrowLeft, Check, Circle, CreditCard, Loader2, Lock, Shield } from 'lucide-react';
import type { BookingState } from '../types/flightTypes';
import { getFlightUiMeta } from '../data/flightUiMeta';
import { flightUiConfig } from '../data/flightUiConfig';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../../leisurePlan/services/paymentApi';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Navigation } from '../../landing/components/Navigation';
import {
  formatCardNumberForInput,
  formatCountdown,
  formatCurrency,
  formatExpiryMmYyInput,
  formatShortDateUpper,
  formatTime,
  getErrorMessage,
  getInitials,
  getOrCreateReservationEndAt,
  toTitleCase,
} from '../utils';

const ENV_STRIPE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.STRIPE_PUBLISHABLE_KEY as string) ||
  '';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#2C407A',
      fontFamily: '"Inter", "Poppins", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};

type PaymentMethod = 'card' | 'bank' | 'apple_pay' | 'google_pay' | 'klarna' | 'link';

const FlightPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as BookingState;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderType, setCardHolderType] = useState<'lead' | 'other'>('lead');
  const [billingType, setBillingType] = useState<'same' | 'different'>('same');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string>(ENV_STRIPE_PUBLISHABLE_KEY);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeInitLoading, setStripeInitLoading] = useState(false);
  const [stripeInitError, setStripeInitError] = useState<string | null>(null);
  const { showError } = useToast();
  const { isAuthenticated } = useAuth();

  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

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
  const finalTotal = Number(state.total ?? state.fareBreakdown?.total ?? 0);
  const ticketsAmount = Number(state.baseFareTotal ?? state.fareBreakdown?.baseFare ?? state.total ?? 0);
  const packageChargeTotal = Number(state.packageChargeTotal ?? 0);
  const refundShieldAmount = Number(state.refundChargeTotal ?? Math.max(0, finalTotal - ticketsAmount - packageChargeTotal));
  const taxesAndFees = Number(state.taxes ?? 0) + Number(state.fees ?? 0);
  const leadPassenger = state.passengerForms?.[0];
  const passengersForPayment = activePassengerForms.slice(0, Math.max(1, passengerCount));
  const reservationDurationSeconds = flightUiConfig.payment.reservationDurationMinutes * 60;
  const reservationStorageKey = useMemo(() => {
    const flightId = state.flight?.id ?? 'no-flight';
    const departureTime = state.flight?.departureTime ?? 'no-time';
    const selectedPackage = state.selectedPackageId ?? 'no-package';
    const selectedRefund = state.selectedRefundId ?? 'no-refund';
    const passengers = state.passengerCount ?? activePassengerForms.length ?? 1;
    return `flight-payment-reservation:${flightId}:${departureTime}:${passengers}:${selectedPackage}:${selectedRefund}`;
  }, [activePassengerForms.length, state.flight?.departureTime, state.flight?.id, state.passengerCount, state.selectedPackageId, state.selectedRefundId]);
  const [remainingReservationSeconds, setRemainingReservationSeconds] = useState(() => reservationDurationSeconds);

  useEffect(() => {
    if (paymentMethod !== 'card' || cardHolderType !== 'lead') {
      return;
    }

    if (leadPassenger) {
      setCardName(`${leadPassenger.givenName} ${leadPassenger.lastName}`.trim());
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }
  }, [cardHolderType, leadPassenger, paymentMethod]);

  useEffect(() => {
    const tick = () => {
      const endAt = getOrCreateReservationEndAt(reservationStorageKey, reservationDurationSeconds);
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemainingReservationSeconds(remaining);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [reservationDurationSeconds, reservationStorageKey]);

  useEffect(() => {
    if (!selectedFlight || paymentMethod !== 'card' || finalTotal <= 0) {
      setClientSecret('');
      setStripeInitError(null);
      setStripeInitLoading(false);
      return;
    }

    let cancelled = false;

    const initStripe = async () => {
      setStripeInitLoading(true);
      setStripeInitError(null);
      setClientSecret('');

      try {
        let pk = ENV_STRIPE_PUBLISHABLE_KEY;
        if (!pk) {
          const keyRes = await axios.get<{ publishableKey: string | null }>(`${API_ENDPOINTS.PAYMENT}/stripe-publishable-key`);
          pk = keyRes.data?.publishableKey?.trim() ?? '';
        }
        if (cancelled) return;
        if (!pk) {
          setStripeInitError(
            'Stripe publishable key is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY or Stripe:PublishableKey in appsettings.',
          );
          setStripeInitLoading(false);
          return;
        }
        setPublishableKey(pk);

        const summary = `${selectedFlight.departure.slice(-3)} → ${selectedFlight.destination.slice(-3)} · ${formatShortDateUpper(selectedFlight.departureTime)}`;
        const intentRes = await paymentService.createFlightPaymentIntent({
          flightId: selectedFlight.id,
          amount: finalTotal,
          summary,
        });
        if (!cancelled) {
          setClientSecret(intentRes.clientSecret);
        }
      } catch (errorValue) {
        if (!cancelled) {
          const ax = errorValue as { response?: { data?: { error?: string } }; message?: string };
          setStripeInitError(ax?.response?.data?.error ?? ax?.message ?? 'Could not start secure checkout.');
        }
      } finally {
        if (!cancelled) {
          setStripeInitLoading(false);
        }
      }
    };

    void initStripe();
    return () => {
      cancelled = true;
    };
  }, [finalTotal, paymentMethod, selectedFlight]);

  if (!selectedFlight) {
    return (
      <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[#4B66A1]">No payment data found.</p>
        <button
          onClick={() => navigate('/flight-search-customer')}
          className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Flights
        </button>
      </section>
    );
  }

  const useStripeCardCheckout = paymentMethod === 'card' && finalTotal > 0;

  const completeBooking = async (stripePaymentIntentId?: string, stripePaymentStatus?: string) => {
    const validPassengers = passengersForPayment.filter((passenger) => passenger.givenName || passenger.lastName);
    const passengerNames = validPassengers
      .map((passenger) => `${passenger.givenName} ${passenger.lastName}`.trim())
      .filter(Boolean)
      .join(', ');

    if (!passengerNames) {
      showError('Please add at least one passenger name before continuing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const digitsOnly = cardNumber.replace(/\s+/g, '');
      const passengerDetailsJson = JSON.stringify(passengersForPayment);
      const packageMetadataJson = JSON.stringify({
        selectedPackageId: state.selectedPackageId ?? null,
        selectedPackageName: state.selectedPackageName ?? null,
        packageChargePerPassenger: Number(state.packageChargePerPassenger ?? 0),
        packageChargeTotal,
      });
      const refundMetadataJson = JSON.stringify({
        selectedRefundId: state.selectedRefundId ?? null,
        selectedRefundTitle: state.selectedRefundTitle ?? null,
        refundChargePerPassenger: Number(state.refundChargePerPassenger ?? 0),
        refundChargeTotal: refundShieldAmount,
      });
      const paymentMetadataJson = JSON.stringify({
        paymentMethod,
        cardHolderType,
        billingType,
        amountCharged: finalTotal,
        baseFareAmount: ticketsAmount,
        taxesAndFees,
        acceptedTerms,
        paidAtUtc: new Date().toISOString(),
        cardLast4:
          paymentMethod === 'card' && !useStripeCardCheckout ? digitsOnly.slice(-4) : '',
        guestCheckout: !isAuthenticated,
        stripePaymentIntentId: stripePaymentIntentId ?? '',
        stripePaymentStatus: stripePaymentStatus ?? '',
      });

      const payload = {
        flightId: selectedFlight.id,
        seatsBooked: Math.max(1, passengerCount),
        bookingClass: state.cabinClass ?? 'Economy',
        specialRequests: '',
        passengerNames,
        passengerDetailsJson,
        packageMetadataJson,
        refundMetadataJson,
        paymentMetadataJson,
        adultCount: state.fareBreakdown?.adultCount ?? 1,
        childCount: state.fareBreakdown?.childCount ?? 0,
        infantCount: state.fareBreakdown?.infantCount ?? 0,
        isRoundTrip: state.tripType === 'round-trip',
        packageId: state.selectedPackageId,
        refundId: state.selectedRefundId,
      };

      const booking = isAuthenticated
        ? await bookingService.createBooking(payload)
        : await bookingService.createGuestBooking(payload);

      navigate('/flight-confirmation', {
        state: {
          ...state,
          booking,
        },
      });
    } catch (errorValue) {
      showError(getErrorMessage(errorValue));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async () => {
    if (isSubmitting) {
      return;
    }
    if (useStripeCardCheckout) {
      return;
    }
    await completeBooking();
  };

  const paymentOptions: Array<{ id: PaymentMethod; label: string; sub: string }> = [
    { id: 'card', label: 'Pay By Card', sub: 'Direct debit / credit' },
    { id: 'bank', label: 'Pay with Super', sub: 'Bank app, Pay later, Card' },
    { id: 'apple_pay', label: 'Apple Pay', sub: 'One-tap wallet payment' },
    { id: 'google_pay', label: 'Google Pay', sub: 'One-tap wallet payment' },
    { id: 'klarna', label: 'Klarna', sub: 'Buy now, pay later' },
    { id: 'link', label: 'Link by Stripe', sub: 'One-click saved card checkout' },
  ];

  const paymentContent = (
    <section className="space-y-4 bg-[#F6F7FB] p-1 sm:p-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6E0F4] bg-white text-[#1E3A8A] hover:bg-[#F3F6FD]"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-black text-[#1E3A8A]">Payment</h1>
      </div>

      <div className="rounded-md border border-[#E8DAB0] bg-[#F8EDCC] px-3 py-2 text-xs font-semibold text-[#7A5B14]">
        <p className="inline-flex items-center gap-2">
          <AlertCircle size={13} />
          {flightUiConfig.payment.reservationWarningPrefix}
          <span className="rounded bg-[#F4C9CB] px-1 py-0.5 text-[#B42E36]">{formatCountdown(remainingReservationSeconds)}</span>
          {flightUiConfig.payment.reservationWarningSuffix}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#E1E5EF] bg-white">
            <div className="border-b border-[#ECEFF6] px-2.5 py-2">
              <h2 className="text-lg font-black text-[#27479D]">Flight Summary</h2>
            </div>

            <div className="space-y-2.5 px-2.5 py-2.5">
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91A0BE]">Outbound {formatShortDateUpper(selectedFlight.departureTime)}</p>
                  <p className="text-lg font-black text-[#27479D]">{selectedFlight.departure.slice(-3)}</p>
                  <p className="text-xs text-[#92A0BC]">{selectedFlight.departure.split('(')[0].trim()} · {formatTime(selectedFlight.departureTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#4E6BB2]">{state.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</p>
                  <p className="text-[11px] font-semibold text-[#D28A16]">{selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop`}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91A0BE]">Arrives</p>
                  <p className="text-lg font-black text-[#27479D]">{selectedFlight.destination.slice(-3)}</p>
                  <p className="text-xs text-[#92A0BC]">{selectedFlight.destination.split('(')[0].trim()} · {formatTime(selectedFlight.arrivalTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91A0BE]">Inbound {formatShortDateUpper(state.returnDate ?? selectedFlight.arrivalTime)}</p>
                  <p className="text-lg font-black text-[#27479D]">{selectedFlight.destination.slice(-3)}</p>
                  <p className="text-xs text-[#92A0BC]">{selectedFlight.destination.split('(')[0].trim()} · {formatTime(selectedFlight.arrivalTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#4E6BB2]">{state.tripType === 'round-trip' ? 'Inbound' : 'Return'}</p>
                  <p className="text-[11px] font-semibold text-[#D28A16]">{selectedFlight.stops === 0 ? 'Direct' : `${Math.max(1, selectedFlight.stops)} stops`}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91A0BE]">Arrives</p>
                  <p className="text-lg font-black text-[#27479D]">{selectedFlight.departure.slice(-3)}</p>
                  <p className="text-xs text-[#92A0BC]">{selectedFlight.departure.split('(')[0].trim()} · {formatTime(selectedFlight.departureTime)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5EF] bg-white">
            <div className="border-b border-[#ECEFF6] px-4 py-3">
              <h2 className="text-lg font-black text-[#27479D]">Traveler Information</h2>
            </div>

            <div className="space-y-3 px-4 py-4">
              {passengersForPayment.map((passenger, index) => {
                const badgeClass = index === 0 ? 'bg-[#FFF2D8] text-[#D78909]' : 'bg-[#EEF2FF] text-[#4B5EA8]';
                const badgeLabel = index === 0 ? 'Lead Passenger' : toTitleCase(passenger.passengerType);
                const avatarClass = index % 2 === 0 ? 'bg-[#294792]' : 'bg-[#E3B42D]';

                return (
                  <div key={`${passenger.travelerId ?? 'manual'}-${index}`} className="flex flex-col gap-3 rounded-xl border border-[#E8ECF4] bg-[#FCFDFF] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white ${avatarClass}`}>
                        {getInitials(passenger.givenName, passenger.lastName)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#1E3A8A]">{passenger.givenName} {passenger.lastName}</p>
                        <p className="text-xs text-[#8B9AB8]">DOB: {passenger.dob ? formatShortDateUpper(passenger.dob) : '-- --- ----'}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${badgeClass}`}>{badgeLabel}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5EF] bg-white">
            <div className="border-b border-[#ECEFF6] px-4 py-3">
              <h2 className="inline-flex items-center gap-2 text-lg font-black text-[#27479D]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2D4DA6] text-[11px] text-white">4</span>
                Payment Details
              </h2>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Select payment method</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {paymentOptions.map(({ id, label, sub }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left ${paymentMethod === id ? 'border-[#2D4DA6] bg-[#F7F9FF]' : 'border-[#E1E5EF] bg-white'}`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#2D4DA6]">{label}</p>
                        <p className="text-xs text-[#8B99B9]">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Card holder</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCardHolderType('lead')}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${cardHolderType === 'lead' ? 'border-[#2D4DA6] bg-[#F7F9FF] text-[#2D4DA6]' : 'border-[#E1E5EF] bg-white text-[#6678A6]'}`}
                  >
                    Lead passenger is cardholder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardHolderType('other');
                      setCardName('');
                      setCardNumber('');
                      setExpiry('');
                      setCvv('');
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${cardHolderType === 'other' ? 'border-[#2D4DA6] bg-[#F7F9FF] text-[#2D4DA6]' : 'border-[#E1E5EF] bg-white text-[#6678A6]'}`}
                  >
                    Cardholder is not traveller
                  </button>
                </div>
              </div>

              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setBillingType('same')}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${billingType === 'same' ? 'border-[#2D4DA6] bg-[#F7F9FF] text-[#2D4DA6]' : 'border-[#E1E5EF] bg-white text-[#6678A6]'}`}
                  >
                    Billing = Shipping address
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('different')}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold ${billingType === 'different' ? 'border-[#2D4DA6] bg-[#F7F9FF] text-[#2D4DA6]' : 'border-[#E1E5EF] bg-white text-[#6678A6]'}`}
                  >
                    Different billing address
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7CAA]">
                    {['Visa', 'MC', 'Disc', 'Diners', 'Maestro', 'JCB', 'Amex'].map((brand) => (
                      <span key={brand} className="rounded-md border border-[#E2E6EF] bg-[#F9FAFD] px-2 py-1">
                        {brand}
                      </span>
                    ))}
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Cardholder Name</span>
                    <input
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="As it appears on card"
                      className="w-full rounded-md border border-[#E2E6EF] bg-white px-3 py-2 text-sm text-[#2C407A] outline-none focus:border-[#2D4DA6]"
                    />
                  </label>

                  {useStripeCardCheckout ? (
                    stripeInitLoading ? (
                      <div className="flex items-center gap-2 py-6 text-sm font-semibold text-[#5D72A5]">
                        <Loader2 size={20} className="shrink-0 animate-spin" strokeWidth={2} />
                        Preparing secure checkout…
                      </div>
                    ) : stripeInitError ? (
                      <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{stripeInitError}</p>
                    ) : clientSecret ? (
                      <>
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Card Number</span>
                          <div className="rounded-md border border-[#E2E6EF] bg-white px-3 py-[11px] focus-within:border-[#2D4DA6] focus-within:ring-1 focus-within:ring-[#2D4DA6]/30">
                            <CardNumberElement
                              options={{ ...CARD_ELEMENT_OPTIONS, placeholder: '4242 4242 4242 4242' }}
                            />
                          </div>
                        </label>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Expiry Date</span>
                            <div className="rounded-md border border-[#E2E6EF] bg-white px-3 py-[11px] focus-within:border-[#2D4DA6] focus-within:ring-1 focus-within:ring-[#2D4DA6]/30">
                              <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Security Code (CVV)</span>
                            <div className="rounded-md border border-[#E2E6EF] bg-white px-3 py-[11px] focus-within:border-[#2D4DA6] focus-within:ring-1 focus-within:ring-[#2D4DA6]/30">
                              <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                          </label>
                        </div>
                      </>
                    ) : null
                  ) : (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Card Number</span>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            value={cardNumber}
                            onChange={(event) => setCardNumber(formatCardNumberForInput(event.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full rounded-md border border-[#E2E6EF] bg-white px-3 py-2 pr-10 text-sm tracking-widest text-[#2C407A] outline-none focus:border-[#2D4DA6]"
                          />
                          <CreditCard size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B99B9]" />
                        </div>
                      </label>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <label>
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Expiry Date</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={expiry}
                            onChange={(event) => setExpiry(formatExpiryMmYyInput(event.target.value))}
                            placeholder="MM / YY"
                            className="w-full rounded-md border border-[#E2E6EF] bg-white px-3 py-2 text-sm text-[#2C407A] outline-none focus:border-[#2D4DA6]"
                          />
                        </label>
                        <label>
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B99B9]">Security Code (CVV)</span>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              value={cvv}
                              onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="3-4 digits"
                              className="w-full rounded-md border border-[#E2E6EF] bg-white px-3 py-2 pr-10 text-sm text-[#2C407A] outline-none focus:border-[#2D4DA6]"
                            />
                            <Circle size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B99B9]" />
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="rounded-md border border-[#F0DEBE] bg-[#FFF8EB] px-3 py-2 text-xs text-[#C07B17]">
                    <p className="inline-flex items-center gap-2 font-semibold">
                      <Shield size={13} />
                      {flightUiConfig.payment.secureEncryptionText}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-b-2xl bg-[#EFF3FB] px-4 py-3 text-center text-sm font-semibold text-[#5D72A5]">
              Need help? Call us: <span className="font-black text-[#E08A00]">{flightUiConfig.supportPhone}</span>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-[#D8DFEF] bg-white shadow-[0_10px_24px_rgba(30,58,138,0.08)]">
            <div className="bg-[#26459B] px-4 py-3">
              <h3 className="text-lg font-black text-white">Price Breakdown</h3>
            </div>

            <div className="space-y-3 px-4 py-4 text-sm">
              <div className="flex flex-col gap-1 border-b border-dashed border-[#E6EBF4] pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#344B88]">
                    Tickets ({Math.max(1, state.fareBreakdown?.adultCount ?? passengerCount)}{' '}
                    {Math.max(1, state.fareBreakdown?.adultCount ?? passengerCount) > 1 ? 'Adults' : 'Adult'})
                  </p>
                  <p className="text-xs text-[#8A9AB8]">{formatCurrency(ticketsAmount)} base fare</p>
                </div>
                <p className="font-black text-[#223B88]">{formatCurrency(ticketsAmount)}</p>
              </div>

              <div className="flex items-center justify-between border-b border-dashed border-[#E6EBF4] pb-2">
                <p className="font-semibold text-[#344B88]">Check-in Baggage</p>
                <p className="font-black text-[#223B88]">{flightUiConfig.payment.baggageIncludedLabel}</p>
              </div>

              <div className="flex items-center justify-between border-b border-dashed border-[#E6EBF4] pb-2">
                <p className="font-semibold text-[#344B88]">Cabin Baggage</p>
                <p className="font-black text-[#223B88]">{flightUiConfig.payment.baggageIncludedLabel}</p>
              </div>

              <div className="flex items-center justify-between border-b border-dashed border-[#E6EBF4] pb-2">
                <div>
                  <p className="font-semibold text-[#344B88]">Service Pack{state.selectedPackageName ? ` (${state.selectedPackageName})` : ''}</p>
                  <p className="text-xs text-[#8A9AB8]">Added package from previous step</p>
                </div>
                <p className="font-black text-[#223B88]">{formatCurrency(packageChargeTotal)}</p>
              </div>

              <div className="flex items-center justify-between border-b border-dashed border-[#E6EBF4] pb-2">
                <div>
                  <p className="font-semibold text-[#344B88]">{state.selectedRefundTitle || 'Refund Shield'}</p>
                  <p className="text-xs text-[#8A9AB8]">Add-on protection</p>
                </div>
                <p className="font-black text-[#223B88]">{formatCurrency(refundShieldAmount)}</p>
              </div>

              <div className="flex items-center justify-between border-b border-dashed border-[#E6EBF4] pb-2">
                <p className="font-semibold text-[#2F9D73]">{flightUiConfig.payment.promotionalDiscountLabel}</p>
                <p className="font-black text-[#2F9D73]">{flightUiConfig.payment.promotionalDiscountAmount}</p>
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base font-black text-[#1F397E]">Total Due</p>
                <p className="text-3xl font-black text-[#1E3A8A]">{formatCurrency(finalTotal)}</p>
              </div>

              <label className="mt-2 flex items-start gap-2 text-xs text-[#7E8EAF]">
                <input type="checkbox" className="mt-0.5" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                {flightUiConfig.payment.termsAcceptanceText}
              </label>

              {useStripeCardCheckout ? (
                stripeInitLoading || !clientSecret ? (
                  <button
                    type="button"
                    className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#9FAFD8] px-4 py-3 text-sm font-black text-white"
                    disabled
                  >
                    <Loader2 size={16} className="animate-spin" strokeWidth={2} />
                    Preparing secure checkout…
                  </button>
                ) : stripeInitError ? (
                  <p className="mt-2 text-center text-sm font-semibold text-red-600">Resolve the issue above to pay by card.</p>
                ) : (
                  <FlightStripePayButton
                    clientSecret={clientSecret}
                    cardName={cardName}
                    acceptedTerms={acceptedTerms}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    payLabel={isSubmitting ? 'Processing...' : `Pay ${formatCurrency(finalTotal)} ${flightUiConfig.payment.payCtaSuffix}`}
                    onPaid={(paymentIntentId, status) => completeBooking(paymentIntentId, status)}
                    onError={showError}
                  />
                )
              ) : (
                <button
                  type="button"
                  className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${acceptedTerms && !isSubmitting ? 'bg-[#26459B] hover:bg-[#1f3a86]' : 'cursor-not-allowed bg-[#9FAFD8]'}`}
                  onClick={handleCreateBooking}
                  disabled={!acceptedTerms || isSubmitting}
                >
                  <Lock size={14} />
                  {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(finalTotal)} ${flightUiConfig.payment.payCtaSuffix}`}
                </button>
              )}

              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A4AECB]">{flightUiConfig.payment.stripeFooterText}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E5EF] bg-white px-4 py-3 text-xs text-[#6C7DA9]">
            <p className="inline-flex items-center gap-2 font-semibold">
              <Check size={13} className="text-[#26459B]" />
              Secure & encrypted payment
            </p>
            <p className="mt-2 inline-flex items-center gap-2 font-semibold">
              <Check size={13} className="text-[#26459B]" />
              {flightUiConfig.supportLabel}: {flightUiConfig.supportPhone}
            </p>
            <p className="mt-2">Taxes and fees included: {formatCurrency(taxesAndFees)}</p>
          </section>
        </div>
      </div>
    </section>
  );

  const wrapStripeElements =
    useStripeCardCheckout && Boolean(clientSecret && publishableKey && stripePromise);

  const paymentShell =
    wrapStripeElements && stripePromise ? (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        {paymentContent}
      </Elements>
    ) : (
      paymentContent
    );

  if (isAuthenticated) {
    return <DashboardLayout>{paymentShell}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6">{paymentShell}</div>
    </div>
  );
};

type FlightStripePayButtonProps = {
  clientSecret: string;
  cardName: string;
  acceptedTerms: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  payLabel: string;
  onPaid: (paymentIntentId: string, status: string) => Promise<void>;
  onError: (message: string) => void;
};

function FlightStripePayButton({
  clientSecret,
  cardName,
  acceptedTerms,
  isSubmitting,
  setIsSubmitting,
  payLabel,
  onPaid,
  onError,
}: FlightStripePayButtonProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!acceptedTerms) {
      return;
    }
    if (!stripe || !elements) {
      onError('Payment form is still loading. Please wait a moment.');
      return;
    }
    if (!cardName.trim()) {
      onError('Please enter the name as it appears on your card.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      onError('Card fields are not ready. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        billing_details: {
          name: cardName.trim(),
        },
      },
    });

    if (paymentError) {
      onError(paymentError.message ?? 'Payment could not be completed.');
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await onPaid(paymentIntent.id, paymentIntent.status);
      return;
    }

    onError('Payment was not confirmed. Please try again or use another card.');
    setIsSubmitting(false);
  };

  return (
    <button
      type="button"
      className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${acceptedTerms && !isSubmitting && stripe ? 'bg-[#26459B] hover:bg-[#1f3a86]' : 'cursor-not-allowed bg-[#9FAFD8]'}`}
      onClick={() => void handlePay()}
      disabled={!acceptedTerms || isSubmitting || !stripe}
    >
      <Lock size={14} />
      {payLabel}
    </button>
  );
}

export default FlightPayment;
