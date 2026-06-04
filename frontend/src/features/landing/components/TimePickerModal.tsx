import { useState, useEffect } from 'react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
  label?: string;
}

export function TimePickerModal({ isOpen, onClose, onSelect, selectedTime, label }: TimePickerModalProps) {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':').map(Number);
      setPeriod(h >= 12 ? 'PM' : 'AM');
      setHour(h % 12 === 0 ? 12 : h % 12);
      setMinute(m);
    }
  }, [selectedTime, isOpen]);

  if (!isOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleConfirm = () => {
    let h = hour % 12;
    if (period === 'PM') h += 12;
    const hStr = h.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    onSelect(`${hStr}:${mStr}`);
    onClose();
  };

  const formatDisplay = () => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[320px] rounded-[22px] bg-white shadow-[0_24px_50px_rgba(13,23,48,0.22)] overflow-hidden">

        {/* Header */}
        <div className="bg-[#1c3f95] px-6 py-5 text-center">
          {label && <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/60">{label}</p>}
          <p className="text-[38px] font-bold tracking-tight text-white leading-none">{formatDisplay()}</p>
        </div>

        <div className="p-5 space-y-5">

          {/* AM / PM toggle */}
          <div className="flex rounded-full border border-[#d7dbe4] overflow-hidden">
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 text-[13px] font-semibold transition-colors ${
                  period === p
                    ? 'bg-[#1c3f95] text-white'
                    : 'bg-[#F6F3F2] text-[#3d4255] hover:bg-[#eef0f5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Hour picker */}
          <div>
            <p className="pl-1 mb-2 text-[10px] font-semibold text-[#3d4255] uppercase tracking-wider">Hour</p>
            <div className="grid grid-cols-6 gap-1.5">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHour(h)}
                  className={`h-10 rounded-full text-[13px] font-semibold transition-colors ${
                    hour === h
                      ? 'bg-[#1c3f95] text-white shadow-[0_4px_12px_rgba(28,63,149,0.3)]'
                      : 'bg-[#F6F3F2] text-[#1e3a8a] hover:bg-[#e8ecf8]'
                  }`}
                >
                  {h.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Minute picker */}
          <div>
            <p className="pl-1 mb-2 text-[10px] font-semibold text-[#3d4255] uppercase tracking-wider">Minute</p>
            <div className="grid grid-cols-6 gap-1.5">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinute(m)}
                  className={`h-10 rounded-full text-[13px] font-semibold transition-colors ${
                    minute === m
                      ? 'bg-[#1c3f95] text-white shadow-[0_4px_12px_rgba(28,63,149,0.3)]'
                      : 'bg-[#F6F3F2] text-[#1e3a8a] hover:bg-[#e8ecf8]'
                  }`}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-[#d7dbe4] bg-[#F6F3F2] text-[13px] font-semibold text-[#3d4255] transition-colors hover:bg-[#eef0f5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 h-11 rounded-full bg-[#1c3f95] text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(28,63,149,0.28)] transition-colors hover:bg-[#15357f]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}