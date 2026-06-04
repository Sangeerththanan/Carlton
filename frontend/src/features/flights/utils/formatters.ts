const createDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Groups PAN digits: Amex → 4-6-5, others → groups of 4 (max 19 digits). */
export const formatCardNumberForInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  if (!digits) {
    return '';
  }

  if (/^3[47]/.test(digits)) {
    const first = digits.slice(0, 4);
    const second = digits.slice(4, 10);
    const third = digits.slice(10, 15);
    return [first, second, third].filter(Boolean).join(' ');
  }

  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

/** "MM / YY" as the user types (digits only under the hood). */
export const formatExpiryMmYyInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

export const formatCurrency = (value: number) => {
  return `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPrice = (value: number) => {
  return `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
};

export const formatDisplayDate = (dateValue: string) => {
  if (!dateValue) return '-';
  const parsed = createDate(dateValue);
  if (!parsed) return dateValue;
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDisplayDateShortYear = (dateValue: string) => {
  if (!dateValue) return '-';
  const parsed = createDate(dateValue);
  if (!parsed) return dateValue;
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });
};

export const formatShortDate = (dateValue: string) => {
  const parsed = createDate(dateValue);
  if (!parsed) return '-- --- ----';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatShortDateUpper = (dateValue: string) => {
  const parsed = createDate(dateValue);
  if (!parsed) return '-- --- --';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
};

export const formatTime = (dateValue: string) => {
  const parsed = createDate(dateValue);
  if (!parsed) return '--:--';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDisplayTime = (dateValue: string) => {
  const parsed = createDate(dateValue);
  if (!parsed) return '-';
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
