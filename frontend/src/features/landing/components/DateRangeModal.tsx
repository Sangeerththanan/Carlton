import React, { useState } from 'react';
import { Calendar } from '../../../components/Calendar';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (range: DateRange) => void;
  selectedRange?: DateRange;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedRange,
}) => {
  const [tempRange, setTempRange] = useState<DateRange>(
    selectedRange || { start: null, end: null }
  );

  const handleDateSelect = (date: Date) => {
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: date, end: null });
      return;
    }

    if (date < tempRange.start) {
      setTempRange({ start: date, end: tempRange.start });
      return;
    }

    setTempRange({ ...tempRange, end: date });
  };

  const handleConfirm = () => {
    const normalizedRange = tempRange.start && !tempRange.end
      ? { start: tempRange.start, end: tempRange.start }
      : tempRange;
    onSelect(normalizedRange);
    onClose();
  };

  const handleReset = () => {
    setTempRange({ start: null, end: null });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isSameDay = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-white p-4 shadow-xl sm:w-full sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1e3a8a]">Select Dates</h3>
          <button
            onClick={onClose}
            className="text-2xl font-light text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-4 flex justify-center">
          <Calendar
            onDateSelect={handleDateSelect}
            selectedRange={tempRange}
          />
        </div>

        {/* Selected Dates Display */}
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-600">Selected Dates</p>
          <div className="text-sm font-medium text-[#1e3a8a]">
            {tempRange.start ? (
              <>
                {formatDate(tempRange.start)}
                {tempRange.end && !isSameDay(tempRange.start, tempRange.end) && (
                  <> to {formatDate(tempRange.end)}</>
                )}
                {!tempRange.end && (
                  <span className="text-gray-400"> to Select end date</span>
                )}
              </>
            ) : (
              <span className="text-gray-400">No date selected</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-lg border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!tempRange.start}
            className="flex-1 rounded-lg bg-[#1e3a8a] py-2 px-4 text-sm font-medium text-white hover:bg-[#1d3fa5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </>
  );
};
