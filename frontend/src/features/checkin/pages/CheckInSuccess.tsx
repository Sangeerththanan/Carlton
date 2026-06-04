import React from 'react';
import { 
  CheckCircle, 
  ArrowLeft, 
  Download, 
  Eye, 
  RotateCcw 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import BoardingPassModal from '../components/BoardingPassModal';
import { downloadBoardingPassPdf } from '../utils/boardingPassPdf';
import type { CheckInBookingDto } from '../services/checkInService';

const CheckInSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const result = (location.state as { checkInResult?: CheckInBookingDto } | null)?.checkInResult;

  // Fallback if navigated directly without state
  if (!result) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto py-8">
        <p className="text-gray-500">No check-in data found.</p>
        <button onClick={() => navigate('/checkin')} className="mt-4 text-[#1e3a8a] underline">
          Go back to Check-in
        </button>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Derive boarding time as 45 min before departure
  const departureDate = new Date(result.departureTime);
  const boardingDate = new Date(departureDate.getTime() - 45 * 60 * 1000);
  const boardingTimeLabel = boardingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Extract IATA codes from the airport strings (format: "London Heathrow (LHR)")
  const extractCode = (airport: string) => {
    const match = airport.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : airport.slice(0, 3).toUpperCase();
  };

  const fromCode = extractCode(result.departure);
  const toCode = extractCode(result.destination);
  const fromCity = result.departure.replace(/\s*\([A-Z]{3}\)/, '').trim();
  const toCity = result.destination.replace(/\s*\([A-Z]{3}\)/, '').trim();

  const boardingPassData = {
    passengerName: result.passengerName,
    seatNumber: result.seatNumber ?? 'TBC',
    route: `${fromCity} to ${toCity}`,
    airline: result.flightNumber.substring(0, 2).toUpperCase(),
    flightNumber: result.flightNumber,
    departure: `${formatDate(result.departureTime)} - ${formatTime(result.departureTime)}`,
    gate: 'TBA',
    boardingTime: boardingTimeLabel,
    fromCode,
    toCode,
    pnr: result.bookingReference,
    sequence: '001',
    cabinClass: result.bookingClass ?? 'Economy',
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-8 animate-in zoom-in duration-500">
      {/* Back Button */}
      <div className="w-full mb-8">
        <button 
          onClick={() => navigate('/checkin')}
          className="p-2 bg-[#1e3a8a] text-white rounded-full hover:bg-[#1e40af] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Success Icon */}
      <div className="bg-[#dcfce7] p-6 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-[#22c55e]" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Check-in Successful!</h1>
      <p className="text-gray-500 text-center mb-10">
        You're all set for your flight. Your boarding pass is ready to download.
      </p>

      {/* Boarding Info Card */}
      <div className="w-full bg-[#1e3a8a] rounded-[2rem] p-8 text-white shadow-xl mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">{fromCity} → {toCity}</h2>
            <p className="text-white/70 text-sm mt-1">{result.flightNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Departure</p>
            <p className="font-bold">{formatDate(result.departureTime)} · {formatTime(result.departureTime)}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Gate</p>
            <p className="font-bold">TBA</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Seat</p>
            <p className="font-bold">{result.seatNumber ?? 'TBC'}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Boarding</p>
            <p className="font-bold">{boardingTimeLabel} (45 min before)</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Passenger</p>
            <p className="font-bold">{result.passengerName}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-1">Class</p>
            <p className="font-bold">{result.bookingClass ?? 'Economy'}</p>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="w-full bg-[#fff7ed] border border-[#ffedd5] rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-gray-800 mb-4">Important Information</h3>
        <ul className="space-y-2">
          {[
            'Arrive at the airport at least 2 hours before departure',
            'Proceed to bag drop if you have checked baggage',
            'Keep your boarding pass ready for security and boarding',
            'Gate closes 20 minutes before departure'
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-gray-400 mt-1.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3">
        <button
          onClick={() => downloadBoardingPassPdf(boardingPassData)}
          className="w-full bg-[#dbeafe] text-[#1e3a8a] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bfdbfe] transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Boarding Pass (PDF)
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#f1f5f9] text-[#1e3a8a] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e2e8f0] transition-colors"
        >
          <Eye className="w-5 h-5" />
          View Boarding Pass
        </button>
        <button 
          onClick={() => navigate('/checkin')}
          className="w-full bg-[#f1f5f9] text-[#1e3a8a] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e2e8f0] transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Check-in Another Booking
        </button>
      </div>

      <BoardingPassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDownload={() => downloadBoardingPassPdf(boardingPassData)}
        passengerName={result.passengerName.toUpperCase()}
        seatNumber={result.seatNumber ?? 'TBC'}
        fromCode={fromCode}
        toCode={toCode}
        flightNumber={result.flightNumber}
        dateLabel={formatDate(result.departureTime)}
        boardingTime={boardingTimeLabel}
        pnr={result.bookingReference}
        cabinClass={result.bookingClass ?? 'Economy'}
      />
    </div>
  );
};

export default CheckInSuccess;
