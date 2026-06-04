import React from "react";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../types/bookingTypes";
import { AlertCircle, Plane, Info } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";

interface ChangeFlightCardProps {
  booking: Booking;
  onCancel: () => void;
}

export const ChangeFlightCard: React.FC<ChangeFlightCardProps> = ({
  booking,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Status and time evaluations
  const isCancelled = booking.status.toLowerCase() === "cancelled";
  const isCompleted = booking.status.toLowerCase() === "completed";

  const departureDate = new Date(booking.departureTime);
  const now = new Date();
  const hoursUntilDeparture =
    (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  const isTooCloseToDeparture =
    hoursUntilDeparture < 24 && hoursUntilDeparture > 0;
  const isPastDeparture = hoursUntilDeparture <= 0;

  const canChange = !isCancelled && !isCompleted && !isPastDeparture;

  const handleProceed = () => {
    if (!canChange) return;

    showToast(
      "Please select a new flight. You will be credited for this booking.",
      "info",
    );
    navigate("/flight-search-customer"); // In a real app we'd pass state: { changeBookingRef: booking.bookingReference }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden w-full max-w-md mx-auto">
      <div className="bg-[#1C398E] px-4 py-3 text-white flex items-center justify-between">
        <h3 className="font-bold">Change Flight</h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">
          Ref: {booking.bookingReference}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Flight Summary */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Plane className="w-5 h-5 text-[#1C398E]" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Current Flight
            </p>
            <p className="text-sm font-semibold text-[#1C398E]">
              {booking.departure} → {booking.destination}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
            <p className="text-sm font-semibold text-[#1C398E]">
              {departureDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Limitations & Warnings based on status */}
        {!canChange ? (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Modifications Unavailable</p>
              <p className="text-xs mt-1">
                {isCancelled && "This booking has already been cancelled."}
                {isCompleted && "This flight has already been completed."}
                {isPastDeparture &&
                  !isCancelled &&
                  !isCompleted &&
                  "This flight's departure time has already passed."}
              </p>
            </div>
          </div>
        ) : isTooCloseToDeparture ? (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Standard Change Window Closed</p>
              <p className="text-xs mt-1">
                This flight departs in less than 24 hours. Changes are subject
                to higher fees and depend on last-minute availability. Wait
                times at the counter may apply.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <Info className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Eligible for Changes</p>
              <p className="text-xs mt-1">
                You can select a new flight. The value of this ticket will be
                credited toward your new selection.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleProceed}
          disabled={!canChange}
          className="px-4 py-2 text-xs font-bold text-white bg-[#1C398E] rounded hover:bg-[#2F4E97] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select New Flight
        </button>
      </div>
    </div>
  );
};
