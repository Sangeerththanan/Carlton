import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  selectedRange?: { start: Date | null; end: Date | null };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => CURRENT_YEAR - i);

const s: Record<string, CSSProperties> = {
  calendar: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 12,
    maxWidth: 240,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: 12,
    color: '#333',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 4,
    minWidth: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selector: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '3px 6px',
    borderRadius: 6,
    background: '#f3f4f6',
    cursor: 'pointer',
    minWidth: 52,
    justifyContent: 'center',
  },
  selectorHover: {
    background: '#e5e7eb',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#333',
  },
  dropdownArrow: {
    background: 'none',
    border: 'none',
    fontSize: 8,
    color: '#666',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    overflowY: 'scroll',
    height: 140,
    minWidth: 90,
    zIndex: 100,
  },
  dropdownItem: {
    padding: '5px 10px',
    height: 28,
    fontSize: 11,
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  dropdownItemHover: {
    background: '#eff6ff',
  },
  dropdownItemActive: {
    background: '#1e40af',
    color: 'white',
    fontWeight: 600,
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 3,
    marginBottom: 4,
  },
  weekday: {
    textAlign: 'center',
    fontWeight: 600,
    color: '#555',
    fontSize: 10,
    padding: '3px 0',
  },
  days: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 3,
  },
  day: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    color: '#333',
  },
  dayOtherMonth: {
    color: '#bbb',
    cursor: 'default',
  },
  dayHover: {
    background: '#eff6ff',
  },
  dayToday: {
    border: '1.5px solid #1e40af',
    color: '#1e40af',
    fontWeight: 600,
  },
  daySelected: {
    background: '#1e40af',
    color: 'white',
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(30,64,175,0.35)',
    border: 'none',
  },
  dayRange: {
    background: '#dbe7ff',
    color: '#1e40af',
    borderRadius: 8,
  },
  daySelectedHover: {
    background: '#1d3fa5',
  },
};

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate, selectedRange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState<'month' | 'year' | null>(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<string | null>(null);

  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthDropdownOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getPreviousMonthDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    return Array.from({ length: firstDay }, (_, i) => daysInPrevMonth - firstDay + i + 1);
  };

  const getCurrentMonthDays = (date: Date) =>
    Array.from({ length: getDaysInMonth(date) }, (_, i) => i + 1);

  const getNextMonthDays = (date: Date) => {
    const total = getFirstDayOfMonth(date) + getDaysInMonth(date);
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    return Array.from({ length: remaining }, (_, i) => i + 1);
  };

  const handleDateClick = (day: number) => {
    onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    const target = selectedDate ?? new Date();
    return day === target.getDate() &&
      currentDate.getMonth() === target.getMonth() &&
      currentDate.getFullYear() === target.getFullYear();
  };

  const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) => {
    if (!a || !b) return false;
    return a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();
  };

  const dayStyle = (day: number, isOther = false): CSSProperties => {
    if (isOther) return { ...s.day, ...s.dayOtherMonth };
    const activeRange = selectedRange ?? (selectedDate ? { start: selectedDate, end: selectedDate } : null);
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const rangeStart = activeRange?.start ?? null;
    const rangeEnd = activeRange?.end ?? null;
    const isRange = !!rangeStart && !!rangeEnd;
    const isRangeMiddle = isRange && dayDate > rangeStart && dayDate < rangeEnd;
    const isRangeStart = isSameDay(dayDate, rangeStart);
    const isRangeEnd = isSameDay(dayDate, rangeEnd);
    const selected = !selectedRange ? isSelected(day) : isRangeStart || isRangeEnd;
    const today = isToday(day);
    const hovered = hoveredDay === day;
    return {
      ...s.day,
      ...(today && !selected && !selectedDate ? s.dayToday : {}),
      ...(isRangeMiddle ? s.dayRange : {}),
      ...(selected ? s.daySelected : {}),
      ...(hovered && !selected ? s.dayHover : {}),
      ...(hovered && selected ? s.daySelectedHover : {}),
    };
  };

  const dropdownItemStyle = (key: string, isActive: boolean): CSSProperties => ({
    ...s.dropdownItem,
    ...(isActive ? s.dropdownItemActive : {}),
    ...(!isActive && hoveredDropdownItem === key ? s.dropdownItemHover : {}),
  });

  return (
    <div style={s.calendar}>
      <div style={s.header}>
        <button
          style={s.navBtn}
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
        >
          &lt;
        </button>

        <div
          ref={monthRef}
          style={{ ...s.selector, ...(hoveredSelector === 'month' ? s.selectorHover : {}) }}
          onClick={() => { setMonthDropdownOpen(v => !v); setYearDropdownOpen(false); }}
          onMouseEnter={() => setHoveredSelector('month')}
          onMouseLeave={() => setHoveredSelector(null)}
        >
          <span style={s.selectorLabel}>{MONTHS[currentDate.getMonth()]}</span>
          <span style={s.dropdownArrow}>▼</span>
          {monthDropdownOpen && (
            <div style={s.dropdown}>
              {MONTHS.map((m, i) => (
                <div
                  key={m}
                  style={dropdownItemStyle(`m${i}`, i === currentDate.getMonth())}
                  onMouseEnter={() => setHoveredDropdownItem(`m${i}`)}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                  onMouseDown={(e) => { e.stopPropagation(); setCurrentDate(new Date(currentDate.getFullYear(), i)); setMonthDropdownOpen(false); }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          style={s.navBtn}
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
        >
          &gt;
        </button>

        <button
          style={s.navBtn}
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth()))}
        >
          &lt;
        </button>

        <div
          ref={yearRef}
          style={{ ...s.selector, ...(hoveredSelector === 'year' ? s.selectorHover : {}) }}
          onClick={() => { setYearDropdownOpen(v => !v); setMonthDropdownOpen(false); }}
          onMouseEnter={() => setHoveredSelector('year')}
          onMouseLeave={() => setHoveredSelector(null)}
        >
          <span style={s.selectorLabel}>{currentDate.getFullYear()}</span>
          <span style={s.dropdownArrow}>▼</span>
          {yearDropdownOpen && (
            <div style={s.dropdown}>
              {YEARS.map((y) => (
                <div
                  key={y}
                  style={dropdownItemStyle(`y${y}`, y === currentDate.getFullYear())}
                  onMouseEnter={() => setHoveredDropdownItem(`y${y}`)}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                  onMouseDown={(e) => { e.stopPropagation(); setCurrentDate(new Date(y, currentDate.getMonth())); setYearDropdownOpen(false); }}
                >
                  {y}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          style={s.navBtn}
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth()))}
        >
          &gt;
        </button>
      </div>

      <div style={s.weekdays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={s.weekday}>{d}</div>
        ))}
      </div>

      <div style={s.days}>
        {getPreviousMonthDays(currentDate).map((day) => (
          <div key={`prev-${day}`} style={dayStyle(day, true)}>{day}</div>
        ))}
        {getCurrentMonthDays(currentDate).map((day) => (
          <div
            key={day}
            style={dayStyle(day)}
            onClick={() => handleDateClick(day)}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {day}
          </div>
        ))}
        {getNextMonthDays(currentDate).map((day) => (
          <div key={`next-${day}`} style={dayStyle(day, true)}>{day}</div>
        ))}
      </div>
    </div>
  );
};
