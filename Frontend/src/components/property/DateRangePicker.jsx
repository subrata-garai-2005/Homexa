import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
  startOfDay,
  differenceInDays,
  isWithinInterval
} from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DateRangePicker = ({
  checkIn,
  checkOut,
  onChange,
  bookedRanges = [],
  pricePerNight,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const checkInDate = useMemo(() => checkIn ? startOfDay(new Date(checkIn)) : null, [checkIn]);
  const checkOutDate = useMemo(() => checkOut ? startOfDay(new Date(checkOut)) : null, [checkOut]);

  // Next month for 2-month side-by-side view on tablet/desktop
  const nextMonth = useMemo(() => addMonths(currentMonth, 1), [currentMonth]);

  // Check if a date is blocked by an existing booking
  const isDateBooked = (date) => {
    return bookedRanges.some(range => {
      const bStart = startOfDay(new Date(range.checkIn));
      const bEnd = startOfDay(new Date(range.checkOut));
      // Booked for stay from checkIn up to checkOut (exclusive of checkOut day for next guest checkIn)
      return (date >= bStart && date < bEnd);
    });
  };

  // Check if there is any booked date between candidate start and end
  const hasBookedDateBetween = (start, end) => {
    if (!start || !end || isBefore(end, start)) return false;
    let curr = startOfDay(start);
    while (isBefore(curr, end)) {
      if (isDateBooked(curr)) return true;
      curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
    }
    return false;
  };

  const handleDateClick = (date) => {
    if (isBefore(date, today) || isDateBooked(date)) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Starting new selection
      onChange({ checkIn: format(date, 'yyyy-MM-dd'), checkOut: '' });
    } else {
      // We already have checkInDate, picking checkOutDate
      if (isBefore(date, checkInDate) || isSameDay(date, checkInDate)) {
        // Reset to new check-in
        onChange({ checkIn: format(date, 'yyyy-MM-dd'), checkOut: '' });
      } else {
        // Check if intervening days contain blocked dates
        if (hasBookedDateBetween(checkInDate, date)) {
          // Can't span over booked dates, reset check-in to this clicked date
          onChange({ checkIn: format(date, 'yyyy-MM-dd'), checkOut: '' });
        } else {
          onChange({
            checkIn: format(checkInDate, 'yyyy-MM-dd'),
            checkOut: format(date, 'yyyy-MM-dd')
          });
        }
      }
    }
  };

  const handleClear = () => {
    onChange({ checkIn: '', checkOut: '' });
  };

  // Helper to render month grid
  const renderMonth = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay(); // 0 is Sunday

    return (
      <div className="flex-1 min-w-[260px]">
        <div className="text-center font-semibold text-sm mb-4 text-gray-900 dark:text-white">
          {format(monthDate, 'MMMM yyyy')}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_OF_WEEK.map(d => (
            <span key={d} className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {/* Empty spacer cells before start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {days.map(day => {
            const isPast = isBefore(day, today);
            const isBooked = isDateBooked(day);
            const isDisabled = isPast || isBooked;

            const isStart = checkInDate && isSameDay(day, checkInDate);
            const isEnd = checkOutDate && isSameDay(day, checkOutDate);

            // In range between checkIn and checkOut
            const isInRange = checkInDate && checkOutDate && isWithinInterval(day, { start: checkInDate, end: checkOutDate });

            // In hover range
            const isInHoverRange = checkInDate && !checkOutDate && hoverDate &&
              isAfter(hoverDate, checkInDate) &&
              (isWithinInterval(day, { start: checkInDate, end: hoverDate }) || isSameDay(day, hoverDate)) &&
              !hasBookedDateBetween(checkInDate, hoverDate);

            let bgClass = '';
            let textClass = 'text-gray-900 dark:text-gray-100';

            if (isDisabled) {
              textClass = 'text-gray-300 dark:text-gray-600 line-through cursor-not-allowed';
            } else if (isStart && isEnd) {
              bgClass = 'bg-primary-500 text-white rounded-full font-bold shadow-md';
              textClass = 'text-white';
            } else if (isStart) {
              bgClass = 'bg-primary-500 text-white rounded-l-full font-bold shadow-md';
              textClass = 'text-white';
            } else if (isEnd) {
              bgClass = 'bg-primary-500 text-white rounded-r-full font-bold shadow-md';
              textClass = 'text-white';
            } else if (isInRange) {
              bgClass = 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300';
            } else if (isInHoverRange) {
              bgClass = 'bg-primary-50/70 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400';
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => !isDisabled && setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={`h-9 flex flex-col items-center justify-center text-xs transition-colors relative font-medium ${bgClass} ${textClass} ${
                  !isDisabled && !isStart && !isEnd ? 'hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full' : ''
                }`}
              >
                <span>{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;

  return (
    <div className={`p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl ${className}`}>
      {/* Header with controls and info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <FiCalendar className="text-primary-500" />
            {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''} selected` : 'Select dates'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {checkIn && checkOut
              ? `${format(new Date(checkIn), 'MMM d, yyyy')} – ${format(new Date(checkOut), 'MMM d, yyyy')}`
              : checkIn
              ? `Check-in: ${format(new Date(checkIn), 'MMM d, yyyy')} • Select check-out`
              : 'Add your travel dates for exact pricing'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(startOfMonth(currentMonth), today)}
            aria-label="Previous month"
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Next month"
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendars container: 1 month on mobile, 2 months on desktop */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
        {renderMonth(currentMonth)}
        <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800" />
        <div className="hidden md:block flex-1">
          {renderMonth(nextMonth)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 line-through inline-block" /> Booked / Unavailable
          </span>
        </div>
        {pricePerNight && (
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{pricePerNight.toLocaleString('en-IN')}/night
          </span>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
