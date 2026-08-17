import React, { useState, useEffect } from 'react';
import { Clock, X, Check } from 'lucide-react';

export const parse24HourTo12Hour = (time24) => {
  if (!time24) return { hour: '08', minute: '00', period: 'AM' };
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hour = String(h).padStart(2, '0');
  const minute = String(m).padStart(2, '0');
  return { hour, minute, period };
};

export const convert12HourTo24Hour = (hour, minute, period) => {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(minute).padStart(2, '0');
  return `${hStr}:${mStr}`;
};

export const format24HourTo12HourDisplay = (time24) => {
  const { hour, minute, period } = parse24HourTo12Hour(time24);
  return `${hour}:${minute} ${period}`;
};

const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const TimePickerModal = ({ isOpen, onClose, onSave, initialTime = '08:00' }) => {
  const parsed = parse24HourTo12Hour(initialTime);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(parsed.period);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const p = parse24HourTo12Hour(initialTime);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);
      setErrorMsg('');
    }
  }, [isOpen, initialTime]);

  if (!isOpen) return null;

  const handleDone = () => {
    const time24 = convert12HourTo24Hour(selectedHour, selectedMinute, selectedPeriod);
    const success = onSave(time24);
    if (success !== false) {
      onClose();
    } else {
      setErrorMsg('This reminder time is already added.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-picker-title"
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h3 id="time-picker-title" className="text-base font-extrabold text-slate-900 dark:text-white">
              Select Reminder Time
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            aria-label="Close time picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Time Display Preview Card */}
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-center">
          <span className="text-3xl font-black text-sky-600 dark:text-sky-400 tracking-wider">
            {selectedHour} : {selectedMinute} {selectedPeriod}
          </span>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-500 font-semibold text-center">{errorMsg}</p>
        )}

        {/* 3 Explicit Controls: Hour, Minute, AM/PM */}
        <div className="grid grid-cols-3 gap-3">
          {/* Column 1: Hour */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Hour
            </label>
            <select
              value={selectedHour}
              onChange={(e) => {
                setSelectedHour(e.target.value);
                setErrorMsg('');
              }}
              className="w-full text-center px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {hoursList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Column 2: Minute */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Minute
            </label>
            <select
              value={selectedMinute}
              onChange={(e) => {
                setSelectedMinute(e.target.value);
                setErrorMsg('');
              }}
              className="w-full text-center px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {minutesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Column 3: AM / PM Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              AM / PM
            </label>
            <div className="grid grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPeriod('AM');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-xl font-black text-xs transition border ${
                  selectedPeriod === 'AM'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPeriod('PM');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-xl font-black text-xs transition border ${
                  selectedPeriod === 'PM'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;
