import React, { useState } from 'react';
import { Check, Clock, Trash2, Pill, Loader2 } from 'lucide-react';

export default function MedicineCard({ medicine, onToggle, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Format 24-hr "08:30" to readable 12-hr format (e.g., "8:30 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(medicine.id, !medicine.is_taken_today);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${medicine.medicine_name}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(medicine.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isTaken = medicine.is_taken_today;

  return (
    <div
      onClick={handleToggle}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border select-none ${
        isTaken
          ? 'bg-emerald-50/60 border-emerald-200 shadow-xs'
          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Interactive Checkbox */}
        <button
          type="button"
          disabled={isToggling}
          aria-label={isTaken ? 'Mark as not taken' : 'Mark as taken'}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
            isTaken
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
              : 'border-2 border-slate-300 text-transparent hover:border-teal-500 bg-slate-50/50'
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          ) : (
            <Check className={`w-6 h-6 stroke-[3] transition-transform ${isTaken ? 'animate-pop' : 'scale-50'}`} />
          )}
        </button>

        {/* Center: Medicine info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-base font-bold truncate transition-colors ${
                isTaken ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {medicine.medicine_name}
            </h3>
            {isTaken && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                Taken
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              {formatTime(medicine.scheduled_time)}
            </span>
            <span className="truncate text-slate-400 font-normal">
              {medicine.condition_name}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition opacity-80 group-hover:opacity-100"
            title="Delete medicine"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
