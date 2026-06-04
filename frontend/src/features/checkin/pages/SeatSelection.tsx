import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CheckInBookingDto } from "../services/checkInService";
import { checkInService } from "../services/checkInService";

type SeatClass = "first" | "business" | "economy";
type SeatFilter = "All" | "First" | "Business" | "Economy";

const SeatSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { checkInBooking?: CheckInBookingDto } | null)
    ?.checkInBooking;

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SeatFilter>("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // If no booking state, go back to check-in
  if (!booking) {
    navigate("/checkin");
    return null;
  }

  const rows = Array.from({ length: 20 }, (_, i) => i + 1);
  const cols = ["A", "B", "C", "D", "E", "F"];

  const getSeatClass = (row: number): SeatClass => {
    if (row <= 3) return "first";
    if (row <= 8) return "business";
    return "economy";
  };

  /** Window = A or F, Middle = B or E, Aisle = C or D */
  const getSeatPosition = (col: string): string => {
    if (col === "A" || col === "F") return "Window";
    if (col === "B" || col === "E") return "Middle";
    return "Aisle";
  };

  const isSeatTaken = (row: number, col: string) =>
    (row * col.charCodeAt(0)) % 7 === 0;

  const filterVisible = (row: number): boolean => {
    const cls = getSeatClass(row);
    if (activeFilter === "All") return true;
    if (activeFilter === "First") return cls === "first";
    if (activeFilter === "Business") return cls === "business";
    if (activeFilter === "Economy") return cls === "economy";
    return true;
  };

  const seatClassColors = {
    first: {
      available: "bg-[#e9d5ff] text-[#7e22ce] border border-[#d8b4fe] hover:scale-110",
      selected: "bg-[#1e3a8a] text-white border border-[#1e3a8a] scale-110 ring-2 ring-offset-2 ring-[#1e3a8a]",
      taken: "bg-gray-200 text-gray-400 cursor-not-allowed",
    },
    business: {
      available: "bg-[#fef3c7] text-[#b45309] border border-[#fde68a] hover:scale-110",
      selected: "bg-[#1e3a8a] text-white border border-[#1e3a8a] scale-110 ring-2 ring-offset-2 ring-[#1e3a8a]",
      taken: "bg-gray-200 text-gray-400 cursor-not-allowed",
    },
    economy: {
      available: "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] hover:scale-110",
      selected: "bg-[#1e3a8a] text-white border border-[#1e3a8a] scale-110 ring-2 ring-offset-2 ring-[#1e3a8a]",
      taken: "bg-gray-200 text-gray-400 cursor-not-allowed",
    },
  };

  const getSeatStyle = (row: number, col: string) => {
    const cls = getSeatClass(row);
    const taken = isSeatTaken(row, col);
    const selected = selectedSeat === `${row}${col}`;
    if (taken) return seatClassColors[cls].taken;
    if (selected) return seatClassColors[cls].selected;
    return seatClassColors[cls].available;
  };

  const confirmSelection = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await checkInService.submitCheckIn(booking.id, selectedSeat ?? undefined);
      navigate("/checkin/success", { state: { checkInResult: result } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedWithoutSeat = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await checkInService.submitCheckIn(booking.id, undefined);
      navigate("/checkin/success", { state: { checkInResult: result } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departureDisplay = new Date(booking.departureTime).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/checkin")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#1e3a8a]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a]">
            Select Your Seat
          </h1>
          <p className="text-gray-500 mt-1">
            {booking.flightNumber} · {booking.departure} → {booking.destination} · {departureDisplay}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Seat Map */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-lg font-bold text-gray-800">Select Your Seat</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(["All", "First", "Business", "Economy"] as SeatFilter[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeFilter === tab
                      ? "bg-white text-[#1e3a8a] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mb-12 pb-6 border-b border-gray-50">
            {[
              { label: "First Class", color: "bg-[#e9d5ff] border-[#d8b4fe]" },
              { label: "Business / Premium", color: "bg-[#fef3c7] border-[#fde68a]" },
              { label: "Economy (Available)", color: "bg-[#dcfce7] border-[#bbf7d0]" },
              { label: "Taken", color: "bg-gray-200 border-gray-300" },
              { label: "Your Selection", color: "bg-[#1e3a8a] border-[#1e3a8a]" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <div className={`w-4 h-4 rounded border ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Airplane grid */}
          <div className="relative mx-auto max-w-md bg-gray-50/50 rounded-[40px] p-8 border-x-4 border-gray-200">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-200 px-4 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Front
            </div>

            <div className="flex justify-between px-8 mb-4">
              {cols.map((c) => (
                <div key={c} className="w-8 text-center text-xs font-bold text-gray-400">
                  {c}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {rows.map((row) => {
                if (!filterVisible(row)) return null;
                return (
                  <div key={row} className="relative">
                    {row === 1 && (
                      <div className="text-[10px] font-bold text-gray-400 text-center mb-2 uppercase tracking-tighter">
                        ✦ FIRST CLASS ✦
                      </div>
                    )}
                    {row === 4 && activeFilter !== "First" && (
                      <div className="text-[10px] font-bold text-gray-400 text-center my-4 uppercase tracking-tighter">
                        ✦ BUSINESS / PREMIUM ✦
                      </div>
                    )}
                    {row === 9 && activeFilter !== "Business" && activeFilter !== "First" && (
                      <div className="text-[10px] font-bold text-gray-400 text-center my-4 uppercase tracking-tighter">
                        ✦ ECONOMY ✦
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      {cols.slice(0, 3).map((col) => {
                        const id = `${row}${col}`;
                        const taken = isSeatTaken(row, col);
                        return (
                          <button
                            key={id}
                            disabled={taken}
                            onClick={() => setSelectedSeat(id)}
                            className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${getSeatStyle(row, col)}`}
                          >
                            {id}
                          </button>
                        );
                      })}
                      <div className="w-12 text-center text-[10px] font-bold text-gray-300">
                        {row}
                      </div>
                      {cols.slice(3, 6).map((col) => {
                        const id = `${row}${col}`;
                        const taken = isSeatTaken(row, col);
                        return (
                          <button
                            key={id}
                            disabled={taken}
                            onClick={() => setSelectedSeat(id)}
                            className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${getSeatStyle(row, col)}`}
                          >
                            {id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Selected Seat Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#1e3a8a] px-4 py-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Selected Seat
              </h3>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-gray-50 rounded-xl mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-200">
                <span className="text-2xl font-bold text-[#1e3a8a]">
                  {selectedSeat || "—"}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Seat number</span>
                  <span className="text-xs font-bold text-gray-700">{selectedSeat || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Class</span>
                  <span className="text-xs font-bold text-gray-700 capitalize">
                    {selectedSeat ? getSeatClass(parseInt(selectedSeat)) : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Position</span>
                  <span className="text-xs font-bold text-gray-700">
                    {selectedSeat ? getSeatPosition(selectedSeat.slice(-1)) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[#1e3a8a] rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-4">
              Booking
            </h3>
            <div className="flex justify-between mb-2">
              <span className="text-xs opacity-80">Flight</span>
              <span className="text-xs font-bold">{booking.flightNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-xs opacity-80">Reference</span>
              <span className="text-xs font-bold">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-sm font-bold">Class</span>
              <span className="text-sm font-bold text-[#f5c518]">{booking.bookingClass ?? "Economy"}</span>
            </div>
          </div>

          {submitError && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
          )}

          <button
            disabled={!selectedSeat || isSubmitting}
            onClick={confirmSelection}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-md ${
              selectedSeat && !isSubmitting
                ? "bg-[#1e3a8a] text-white hover:bg-[#1e40af] scale-[1.02]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Checking in..." : selectedSeat ? "Confirm & Check In" : "Select a seat to confirm"}
          </button>

          <button
            disabled={isSubmitting}
            onClick={proceedWithoutSeat}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors mx-auto mt-2 disabled:opacity-50"
          >
            Proceed without selecting a seat
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
