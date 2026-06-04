import { Check, Download } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingState } from '../types/flightTypes';
import { getFlightUiMeta } from '../data/flightUiMeta';
import { formatCurrency, formatDuration, formatShortDate, formatTime, getDurationMinutes, getInitials } from '../utils';
import './FlightConfirmation.css';

const FlightConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as BookingState;

  const selectedFlight = useMemo(() => {
    if (!state.flight) return null;
    return { ...state.flight, ...getFlightUiMeta(state.flight) };
  }, [state.flight]);

  const passengerForms = state.passengerForms ?? [];
  const finalTotal = Number(state.total ?? state.fareBreakdown?.total ?? 0);
  const ticketAmount = Number(state.baseFareTotal ?? state.fareBreakdown?.baseFare ?? 0);
  const refundAmount = Number(state.refundChargeTotal ?? 0);
  const packageAmount = Number(state.packageChargeTotal ?? 0);
  const outboundDuration = selectedFlight ? formatDuration(getDurationMinutes(selectedFlight)) : '--h --m';
  const inboundDuration = selectedFlight ? formatDuration(getDurationMinutes(selectedFlight)) : '--h --m';

  const bookingReference = state.booking?.bookingReference ?? '';

  if (!selectedFlight) {
    return (
      <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[#4B66A1]">No confirmation data found.</p>
        <button
          onClick={() => navigate('/flight-search-customer')}
          className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Flights
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4 bg-[#F6F8FC] px-6 sm:px-10 lg:px-16 py-4">
      <section className="relative rounded-2xl border border-[#E3E8F5] bg-white px-6 py-8 pb-16 text-center">
        <div className="pulse-confirmation mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#DBF2E6] bg-[#F5BF5B] text-white">
          <Check size={52} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-[#24449B]">Your Booking is Confirmed!</h1>
        <p className="mt-2 text-sm text-[#6D7FAE]">Thank you for choosing www.carltonleisure.com</p>
        <p className="mt-2 text-sm text-[#6D7FAE]">A confirmation e-ticket has been sent to your registered email.</p>

        <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-full border border-[#3A59A7] bg-[#F2F6FF] px-4 py-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A8CB7]">Booking Reference</p>
            <p className="text-lg font-black text-[#24449B]">{bookingReference}</p>
          </div>
          <button className="rounded-md border border-[#B7C6E7] px-3 py-1.5 text-xs font-semibold text-[#2A469A]">Copy</button>
        </div>

        <button
          onClick={() => navigate('/bookings')}
          className="absolute bottom-4 right-6 rounded-md border border-[#8EA4DC] bg-[#1E3E92] px-3 py-2 text-[11px] font-bold text-white"
        >
          Return to My Bookings
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E3E8F5] bg-white">
        <div className="flex items-center justify-between bg-[#26459B] px-2.5 py-1.5">
          <p className="text-xs font-bold text-white">E-Ticket · {state.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</p>
          <span className="rounded-full bg-[#E3ECFF] px-2 py-0.5 text-[10px] font-bold text-[#24449B]">CONFIRMED</span>
        </div>

        <div className="space-y-3 px-4 py-4 sm:space-y-2 sm:px-4 sm:py-3">
          <div className="grid grid-cols-1 items-center gap-3 border-b border-dashed border-[#DFE6F6] pb-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-1.5 sm:pb-1.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C9ABB]">Outbound · {formatShortDate(selectedFlight.departureTime)}</p>
              <p className="text-lg font-black text-[#243E8D]">{selectedFlight.departure.slice(-3)}</p>
              <p className="text-xs text-[#8A99BA]">{selectedFlight.departure.split('(')[0].trim()}</p>
              <p className="text-xs text-[#8A99BA]">{formatTime(selectedFlight.departureTime)}</p>
            </div>
            <div className="text-center text-xs">
              <p className="font-bold text-[#3252A7]">{outboundDuration}</p>
              <p className="font-semibold text-[#D28A16]">{selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop`}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C9ABB]">Arrives</p>
              <p className="text-lg font-black text-[#243E8D]">{selectedFlight.destination.slice(-3)}</p>
              <p className="text-xs text-[#8A99BA]">{selectedFlight.destination.split('(')[0].trim()}</p>
              <p className="text-xs text-[#8A99BA]">{formatTime(selectedFlight.arrivalTime)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-1.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C9ABB]">Inbound · {formatShortDate(state.returnDate ?? selectedFlight.arrivalTime)}</p>
              <p className="text-lg font-black text-[#243E8D]">{selectedFlight.destination.slice(-3)}</p>
              <p className="text-xs text-[#8A99BA]">{selectedFlight.destination.split('(')[0].trim()}</p>
              <p className="text-xs text-[#8A99BA]">{formatTime(selectedFlight.arrivalTime)}</p>
            </div>
            <div className="text-center text-xs">
              <p className="font-bold text-[#3252A7]">{inboundDuration}</p>
              <p className="font-semibold text-[#D28A16]">{selectedFlight.stops === 0 ? 'Direct' : `${Math.max(1, selectedFlight.stops)} stops`}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8C9ABB]">Arrives</p>
              <p className="text-lg font-black text-[#243E8D]">{selectedFlight.departure.slice(-3)}</p>
              <p className="text-xs text-[#8A99BA]">{selectedFlight.departure.split('(')[0].trim()}</p>
              <p className="text-xs text-[#8A99BA]">{formatTime(selectedFlight.departureTime)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E3E8F5] bg-white px-4 py-3">
          <h2 className="text-lg font-black text-[#28479D]">Traveler Information</h2>
          <div className="mt-2 space-y-1.5">
            {passengerForms.map((passenger, index) => (
              <div key={`${passenger.travelerId ?? 'manual'}-${index}`} className="flex items-center justify-between rounded-lg border border-[#E9EEF8] bg-[#FCFDFF] px-2.5 py-1.5">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white ${index % 2 === 0 ? 'bg-[#294792]' : 'bg-[#E3B42D]'}`}>
                    {getInitials(passenger.givenName, passenger.lastName)}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#1E3A8A]">{passenger.givenName} {passenger.lastName}</p>
                    <p className="text-[11px] text-[#8A99BA]">DOB: {passenger.dob ? formatShortDate(passenger.dob) : '-- --- ----'}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${index === 0 ? 'bg-[#FFF2D8] text-[#D78909]' : 'bg-[#EEF2FF] text-[#4B5EA8]'}`}>
                  {index === 0 ? 'Lead Passenger' : passenger.passengerType}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E3E8F5] bg-white px-4 py-3">
          <h2 className="text-lg font-black text-[#28479D]">Baggage Allowance</h2>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-[#E9EEF8] px-2.5 py-1.5">
              <span className="text-[#425A93]">Check-in Baggage</span>
              <span className="font-bold text-[#D28A16]">{selectedFlight.hasCheckInBaggage ? 'Included' : 'Not included'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#E9EEF8] px-2.5 py-1.5">
              <span className="text-[#425A93]">Cabin Baggage</span>
              <span className="font-bold text-[#D28A16]">{selectedFlight.hasHandLuggage ? 'Included' : 'Not included'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#E9EEF8] px-2.5 py-1.5">
              <span className="text-[#425A93]">{state.selectedRefundTitle || 'Refund Shield'}</span>
              <span className="font-bold text-[#2F9D73]">Active</span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#26459B] bg-[#26459B] px-6 py-4 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black">Confirmation Email Sent</h3>
            <p className="text-xs text-[#D5E1FF]">Your e-ticket and itinerary have been sent to your registered email.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button className="rounded-md border border-[#8EA4DC] bg-[#2B4CA7] px-4 py-2 text-xs font-bold text-white">Resend Email</button>
            <button className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-bold text-[#26459B]">
              <Download size={14} />
              Download PDF
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E3E8F5] bg-white px-6 py-4">
        <h3 className="text-lg font-black text-[#28479D]">What Happens Next?</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Check Your Email', text: 'Your e-ticket and full itinerary will arrive shortly.' },
            { title: 'Online Check-in', text: 'Check in online 24-48h before departure.' },
            { title: 'Arrive Early', text: 'Arrive at the airport at least 3 hours before departure.' },
            { title: 'Need Help?', text: 'Call us anytime. Our support team is available 24/7.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[#EBEFF8] bg-[#FCFDFF] px-4 py-4 text-center">
              <p className="text-sm font-bold text-[#2A469A]">{item.title}</p>
              <p className="mt-2 text-xs text-[#7D8EB5]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E3E8F5] bg-white px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99BA]">Tickets</p>
              <p className="text-lg font-black text-[#26459B]">{formatCurrency(ticketAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99BA]">Refund Shield</p>
              <p className="text-lg font-black text-[#26459B]">{formatCurrency(refundAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99BA]">Service Pack</p>
              <p className="text-lg font-black text-[#26459B]">{formatCurrency(packageAmount)}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99BA]">Total Charged</p>
            <p className="text-3xl font-black text-[#26459B]">{formatCurrency(finalTotal)}</p>
          </div>
          <span className="rounded-full border border-[#F3C98A] bg-[#FFF7EB] px-4 py-1.5 text-xs font-bold text-[#D88B0D]">Payment Received</span>
        </div>
      </section>
    </section>
  );
};

export default FlightConfirmation;
