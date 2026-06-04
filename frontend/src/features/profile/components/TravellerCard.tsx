import React from 'react';
import { User, Globe, Calendar, Trash2 } from 'lucide-react';
import type { SavedTraveller } from '../types/profile';

interface TravellerCardProps {
  traveller: SavedTraveller;
  onDelete: (id: number) => void;
}

export const TravellerCard: React.FC<TravellerCardProps> = ({ traveller, onDelete }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-blue-50 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all group relative animate-in fade-in zoom-in-95 duration-300">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(traveller.id)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete Traveller"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex items-start gap-2">
        <div className="p-2 bg-blue-900/10 rounded-xl flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-500">
          <User size={16} />
        </div>
        
        <div className="space-y-1.5 flex-1">
          <div>
            <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
              {traveller.firstName} {traveller.lastName}
            </h4>
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 italic">
               {traveller.gender || 'Companion'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Globe size={10} className="text-blue-300" />
              <span>{traveller.nationality || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Calendar size={10} className="text-blue-300" />
              <span>
                {traveller.dateOfBirth 
                  ? new Date(traveller.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                  : 'N/A'}
              </span>
            </div>
          </div>

          {traveller.passportNumber && (
            <div className="pt-1 flex items-center gap-1.5">
                <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight">Passport: {traveller.passportNumber}</span>
                {traveller.passportExpiryDate && (
                     <span className="text-[9px] text-gray-400 italic">Expires: {new Date(traveller.passportExpiryDate).toLocaleDateString()}</span>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
