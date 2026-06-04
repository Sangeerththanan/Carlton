import React from 'react';
import { Clock3, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import type { Flight } from '../types/flightTypes';

interface FlightCardProps {
  flight: Flight;
  onEdit?: (flight: Flight) => void;
  onDelete?: (id: number) => void;
  onBook?: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onEdit, onDelete, onBook }) => {
  const airline = flight.airline?.trim() || 'Unknown Airline';
  const stops = flight.stops ?? 0;
  const hasCheckInBaggage = flight.hasCheckInBaggage ?? false;
  const hasHandLuggage = flight.hasHandLuggage ?? true;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = () => {
    const departure = new Date(flight.departureTime).getTime();
    const arrival = new Date(flight.arrivalTime).getTime();
    const durationMinutes = Math.max(0, Math.floor((arrival - departure) / 60000));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Customer card style (no admin actions)
  if (!onEdit && !onDelete) {
    return (
      <article className="rounded-2xl border border-[#D3DCF0] bg-white shadow-[0_8px_28px_rgba(30,58,138,0.08)] overflow-hidden">
        <div className="bg-[#1E3A8A] px-4 py-2 text-[11px] font-semibold text-white tracking-wide">
          {airline.toUpperCase()}
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-slate-500">Price per adult</p>
              <p className="text-2xl font-extrabold text-[#172554] sm:text-3xl">£{flight.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500">{flight.flightNumber} • {flight.seatsAvailable} seats left</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#E9EFFC] px-3 py-1.5 text-xs font-medium text-[#1E3A8A]">
              <Clock3 size={14} />
              {getDuration()}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-center">
            <div>
              <p className="text-xl font-extrabold text-[#172554] sm:text-2xl">{formatTime(flight.departureTime)}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-[#1E3A8A]">{flight.departure}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <PlaneTakeoff size={14} />
                Departs
              </div>
            </div>

            <div className="text-center text-xs text-slate-500">
              <p className="font-semibold text-[#1E3A8A]">{stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}</p>
              <p>{getDuration()}</p>
            </div>

            <div className="sm:text-right">
              <p className="text-xl font-extrabold text-[#172554] sm:text-2xl">{formatTime(flight.arrivalTime)}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-[#1E3A8A]">{flight.destination}</p>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 sm:justify-end">
                <PlaneLanding size={14} />
                Arrives
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              <span>{hasCheckInBaggage ? 'Check-in bag' : 'No check-in bag'}</span>
              <span className="mx-2">•</span>
              <span>{hasHandLuggage ? 'Hand luggage' : 'No hand luggage'}</span>
            </div>
            <button className="text-xs font-semibold text-[#1E3A8A] hover:underline">Show details</button>
            <button
              onClick={() => onBook?.(flight)}
              className="w-full rounded-xl bg-[#F59E0B] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#d68909] sm:w-auto"
            >
              BOOK
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 sm:text-xl">{flight.flightNumber}</h3>
          <div className="text-sm text-gray-600">
            {flight.departure} → {flight.destination}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {airline} • {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-xl font-bold text-green-600 sm:text-2xl">${flight.price}</div>
          <div className="text-sm text-gray-500">{flight.seatsAvailable} seats</div>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm text-gray-500">Departure</div>
          <div className="font-medium">{formatDate(flight.departureTime)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Arrival</div>
          <div className="font-medium">{formatDate(flight.arrivalTime)}</div>
        </div>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onEdit && (
            <button
              onClick={() => onEdit(flight)}
              className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(flight.id)}
              className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightCard;
