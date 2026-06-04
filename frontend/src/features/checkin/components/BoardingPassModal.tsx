import React from 'react';
import { X, Plane, Download } from 'lucide-react';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  passengerName?: string;
  seatNumber?: string;
  fromCode?: string;
  toCode?: string;
  flightNumber?: string;
  dateLabel?: string;
  boardingTime?: string;
  pnr?: string;
  cabinClass?: string;
}

const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ 
  isOpen, 
  onClose, 
  onDownload,
  passengerName = "JOHN SMITH", 
  seatNumber = "TBC",
  fromCode = "LHR",
  toCode = "DXB",
  flightNumber = "CA101",
  dateLabel = "—",
  boardingTime = "—",
  pnr = "—",
  cabinClass = "Economy",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#1e3a8a] p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Boarding Pass</p>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black tracking-tight">{passengerName}</h2>
            <Plane className="w-6 h-6 rotate-45" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold opacity-60 mb-1 uppercase">From</p>
              <p className="text-2xl font-black">{fromCode}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold opacity-60 mb-1 uppercase">Flight</p>
              <p className="text-sm font-bold">{flightNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold opacity-60 mb-1 uppercase">To</p>
              <p className="text-2xl font-black">{toCode}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-y-6 mb-8">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm font-black text-gray-800">{dateLabel}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Boarding Time</p>
              <p className="text-sm font-black text-gray-800">{boardingTime}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Seat</p>
              <p className="text-xl font-black text-[#1e3a8a]">{seatNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gate</p>
              <p className="text-xl font-black text-[#f5c518]">TBA</p>
            </div>
          </div>

          <div className="space-y-3 py-6 border-t border-gray-100 mb-8">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">PNR:</span>
              <span className="text-[10px] font-bold text-gray-800">{pnr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sequence:</span>
              <span className="text-[10px] font-bold text-gray-800">001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Class:</span>
              <span className="text-[10px] font-bold text-gray-800 uppercase">{cabinClass}</span>
            </div>
          </div>

          {/* Barcode Area */}
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 mb-8">
            <div className="w-full h-12 flex items-center justify-center gap-0.5 overflow-hidden opacity-80">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gray-800" 
                  style={{ 
                    width: `${(i % 3) + 1}px`, 
                    height: '100%',
                    opacity: i % 2 === 0 ? 1 : 0.6
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] font-mono text-gray-400">{pnr}001</p>
          </div>

          <button
            onClick={onDownload}
            className="w-full bg-[#1e3a8a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1e40af] transition-colors shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardingPassModal;
