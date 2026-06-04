import React from "react";
import {
  CheckCircle2,
  Plane,
  ExternalLink,
  Bell,
  Info,
  Loader2,
  Clock,
  CheckCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkInService } from "../services/checkInService";
import { bookingService } from "../../bookings/services/bookingService";
import type { Booking } from "../../bookings/types/bookingTypes";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Hours until departure (positive = future) */
const hoursUntil = (iso: string) =>
  (new Date(iso).getTime() - Date.now()) / 3_600_000;

// ─── Status badge ────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ booking: Booking }> = ({ booking }) => {
  if (booking.isCheckedIn)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
        <CheckCheck className="w-3.5 h-3.5" />
        Checked In
      </span>
    );

  const hrs = hoursUntil(booking.departureTime);

  if (hrs > 48)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
        <Lock className="w-3.5 h-3.5" />
        Opens in {Math.round(hrs - 48)}h
      </span>
    );

  if (hrs >= 1)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <Clock className="w-3.5 h-3.5" />
        Check-in Open
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
      Closed
    </span>
  );
};

// ─── Action button ────────────────────────────────────────────────────────────

const ActionButton: React.FC<{
  booking: Booking;
  onCheckIn: (b: Booking) => void;
}> = ({ booking, onCheckIn }) => {
  if (booking.isCheckedIn)
    return (
      <span className="text-xs font-semibold text-blue-600">
        ✓ Seat {booking.seatNumber ?? "TBC"}
      </span>
    );

  const hrs = hoursUntil(booking.departureTime);
  const eligible = hrs <= 48 && hrs >= 1 && booking.status === "Confirmed";

  return (
    <button
      disabled={!eligible}
      onClick={() => eligible && onCheckIn(booking)}
      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
        eligible
          ? "bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-sm hover:shadow-md"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      {eligible ? "Check-In Now" : "Not Yet"}
    </button>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const WebCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const [pnr, setPnr] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const airlines = [
    { name: "British Airways", url: "ba.com/checkin" },
    { name: "Emirates", url: "emirates.com/checkin" },
    { name: "Lufthansa", url: "lufthansa.com/checkin" },
    { name: "Air France", url: "airfrance.com/checkin" },
    { name: "easyJet", url: "easyjet.com/checkin" },
    { name: "Ryanair", url: "ryanair.com/checkin" },
  ];

  React.useEffect(() => {
    // Fetch all bookings from the main bookings service
    bookingService
      .getCustomerBookings()
      .then(allBookings => {
        // Filter for upcoming confirmed trips
        const upcoming = allBookings.filter(b => 
          b.status === "Confirmed" && hoursUntil(b.departureTime) >= -1 // Show up to 1h after departure
        );
        setBookings(upcoming);
      })
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  }, []);

  const startCheckIn = async () => {
    const normalizedPnr = pnr.trim().toUpperCase();
    const normalizedLastName = lastName.trim();
    if (!normalizedPnr || !normalizedLastName) {
      setError("Please enter your booking reference and last name.");
      return;
    }
    setIsSearching(true);
    setError("");
    try {
      const booking = await checkInService.lookupBooking(normalizedPnr, normalizedLastName);
      navigate("/checkin/select-seats", { state: { checkInBooking: booking } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking not found.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckInNow = (booking: Booking) => {
    // Map Booking to CheckInBookingDto for component compatibility
    const checkInBooking = {
      id: booking.id,
      bookingReference: booking.bookingReference,
      passengerName: booking.customerName, // Map customerName to passengerName
      flightNumber: booking.flightNumber,
      departure: booking.departure,
      destination: booking.destination,
      departureTime: booking.departureTime,
      bookingClass: booking.bookingClass,
      isCheckedIn: booking.isCheckedIn || false,
      seatNumber: booking.seatNumber,
      status: booking.status,
    };
    navigate("/checkin/select-seats", { state: { checkInBooking } });
  };

  const handleViewBooking = (bookingId: number) =>
    navigate("/my-bookings", { state: { highlightBookingId: bookingId } });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Web Check-in</h1>
        <p className="text-gray-500 mt-1">
          Check-in online and save time at the airport.
        </p>
      </div>

      {/* PNR lookup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#1e3a8a] p-2 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            Check-in with Booking Reference
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              PNR / Booking Reference
            </label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => { setPnr(e.target.value.toUpperCase()); setError(""); }}
              placeholder="e.g. CA12345678"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setError(""); }}
              placeholder="e.g. Johnson"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={startCheckIn}
              disabled={isSearching}
              className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSearching ? "Searching…" : "Start Check-in"}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        )}
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">My Bookings</h2>
          <span className="text-xs text-gray-400">
            Check-in opens 48 h before departure · closes 1 h before
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your bookings…
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <Plane className="w-8 h-8 opacity-40" />
            <p className="text-sm">No upcoming confirmed bookings found.</p>
            <p className="text-xs text-gray-300">
              Book a flight and it will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Flight</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Class</th>
                    <th className="px-6 py-3">Check-in Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Flight */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#eff6ff] p-1.5 rounded-lg">
                            <Plane className="w-4 h-4 text-[#1e3a8a]" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{b.flightNumber}</p>
                            <p className="text-[11px] text-gray-400">{b.bookingReference}</p>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                          <span className="truncate max-w-[100px]">{b.departure.replace(/\s*\([A-Z]{3}\)/, "")}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">{b.destination.replace(/\s*\([A-Z]{3}\)/, "")}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-700">{formatDate(b.departureTime)}</p>
                        <p className="text-xs text-gray-400">{formatTime(b.departureTime)}</p>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-600">
                          {b.bookingClass ?? "Economy"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge booking={b} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton booking={b} onCheckIn={handleCheckInNow} />
                          <button
                            onClick={() => handleViewBooking(b.id)}
                            className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-50">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#eff6ff] p-1.5 rounded-lg">
                        <Plane className="w-4 h-4 text-[#1e3a8a]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{b.flightNumber}</p>
                        <p className="text-[10px] text-gray-400">{b.bookingReference}</p>
                      </div>
                    </div>
                    <StatusBadge booking={b} />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <span>{b.departure.replace(/\s*\([A-Z]{3}\)/, "")}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                    <span>{b.destination.replace(/\s*\([A-Z]{3}\)/, "")}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatDate(b.departureTime)} · {formatTime(b.departureTime)} · {b.bookingClass ?? "Economy"}
                  </div>

                  <div className="flex gap-2">
                    <ActionButton booking={b} onCheckIn={handleCheckInNow} />
                    <button
                      onClick={() => handleViewBooking(b.id)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Airline portals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xs font-bold text-gray-800 mb-5 uppercase tracking-wider">
          Airline Web Check-in Portals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {airlines.map((airline, i) => (
            <div
              key={i}
              className="group border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-[#1e3a8a] hover:shadow-sm transition-all cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-[#1e3a8a] transition-colors">
                  {airline.name}
                </h3>
                <p className="text-[11px] text-gray-400">{airline.url}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#1e3a8a] transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className="bg-[#eff6ff] p-3 rounded-lg">
            <Bell className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-1 text-sm">Check-in Reminders</h2>
            <p className="text-xs text-gray-500">
              We'll notify you via email when your check-in window opens.
            </p>
          </div>
        </div>

        <div className="bg-[#eff6ff] rounded-xl shadow-sm border border-blue-100 p-5">
          <h2 className="font-bold text-[#1e3a8a] mb-3 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" /> Important Information
          </h2>
          <ul className="space-y-1.5">
            {[
              "Check-in opens 48 hours before departure",
              "Check-in closes 1 hour before departure",
              "Select or change your seat during check-in",
              "Download your boarding pass after completing check-in",
              "Visit bag drop if you have checked baggage",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#1e3a8a]/80">
                <span className="mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebCheckIn;
