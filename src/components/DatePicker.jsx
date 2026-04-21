import React, { useRef, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const PickerColumn = ({ items, selectedIndex, onSelect }) => {
  const columnRef = useRef(null);
  const isScrolling = useRef(false);
  const scrollTimer = useRef(null);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
  }, []);

  const handleScroll = useCallback(() => {
    const el = columnRef.current;
    if (!el) return;

    isScrolling.current = true;

    if (scrollTimer.current) clearTimeout(scrollTimer.current);

    scrollTimer.current = setTimeout(() => {
      const rawIndex = el.scrollTop / ITEM_HEIGHT;
      const snappedIndex = Math.round(rawIndex);
      const clamped = Math.max(0, Math.min(snappedIndex, items.length - 1));

      // Snap halus ke posisi
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      onSelect(clamped);
      isScrolling.current = false;
    }, 80);
  }, [items, onSelect]);

  const handleItemClick = (index) => {
    const el = columnRef.current;
    if (!el) return;
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    onSelect(index);
  };

  return (
    <div className="picker-column-wrap">
      {/* Gradient fade atas */}
      <div className="picker-fade picker-fade-top" />

      {/* Highlight tengah */}
      <div className="picker-highlight" />

      {/* Scrollable column */}
      <div
        ref={columnRef}
        className="picker-column"
        onScroll={handleScroll}
      >
        {/* Padding atas */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />

        {items.map((item, index) => (
          <div
            key={index}
            className="picker-item"
            style={{ height: ITEM_HEIGHT }}
            onClick={() => handleItemClick(index)}
          >
            {item}
          </div>
        ))}

        {/* Padding bawah */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>

      {/* Gradient fade bawah */}
      <div className="picker-fade picker-fade-bottom" />
    </div>
  );
};

const DatePicker = ({ value, onChange, onCancel, onDone }) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 56 }, (_, i) => String(1970 + i));

  const defaultDate = value || new Date(2000, 0, 1);
  const defaultDayIndex = defaultDate.getDate() - 1;
  const defaultMonthIndex = defaultDate.getMonth();
  const defaultYearIndex = years.indexOf(String(defaultDate.getFullYear()));

  const selectedDay = useRef(defaultDayIndex);
  const selectedMonth = useRef(defaultMonthIndex);
  const selectedYear = useRef(defaultYearIndex >= 0 ? defaultYearIndex : 30);

  const handleDone = () => {
    const day = selectedDay.current + 1;
    const month = selectedMonth.current;
    const year = parseInt(years[selectedYear.current]);
    onDone(new Date(year, month, day));
  };

  return (
    <div className="datepicker-overlay">
      <div className="datepicker-modal">

        {/* Header */}
        <div className="datepicker-header">
          <button className="datepicker-cancel" onClick={onCancel}>
            Cancel
          </button>
          <span className="datepicker-title">Tanggal Lahir</span>
          <button className="datepicker-done" onClick={handleDone}>
            Done
          </button>
        </div>

        {/* Picker body */}
        <div className="datepicker-body">
          <PickerColumn
            items={days}
            selectedIndex={selectedDay.current}
            onSelect={(i) => { selectedDay.current = i; }}
          />
          <PickerColumn
            items={months}
            selectedIndex={selectedMonth.current}
            onSelect={(i) => { selectedMonth.current = i; }}
          />
          <PickerColumn
            items={years}
            selectedIndex={selectedYear.current}
            onSelect={(i) => { selectedYear.current = i; }}
          />
        </div>

      </div>
    </div>
  );
};

export default DatePicker;