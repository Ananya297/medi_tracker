// -----------------------------------------------------------------------------
// Module Imports
// Import React, Lucide icons, and state
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { Stethoscope, Check, Clock, Trash2, CheckCircle, ChevronDown } from 'lucide-react';

// -----------------------------------------------------------------------------
// Component: DiseaseCategoryCard
// Card grouping all medications assigned to a condition with fast toggle checkboxes
// -----------------------------------------------------------------------------
export default function DiseaseCategoryCard({ group, onToggleMedicine, onDeleteMedicine }) {
  const [collapsed, setCollapsed] = useState(false);

  const total = group.medicines.length;
  const taken = group.medicines.filter((m) => m.is_taken_today).length;
  const isDone = total > 0 && taken === total;

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
            isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-50 text-teal-700'
          }`}>
            {isDone ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <Stethoscope className="w-4 h-4 text-teal-600" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {group.condition_name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {taken} of {total} taken
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {taken}/{total}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        </div>
      </button>

      {/* Medicines List */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-100">
          {group.medicines.map((med) => {
            const isTaken = med.is_taken_today;
            return (
              <div
                key={med.id}
                onClick={() => onToggleMedicine(med.id, !isTaken)}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                  isTaken
                    ? 'bg-emerald-50/60 border-emerald-200/90'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-teal-300 hover:bg-white'
                }`}
              >
                {/* Instant Checkbox */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isTaken
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'border-2 border-slate-300 text-transparent bg-white'
                  }`}
                >
                  <Check className={`w-5 h-5 stroke-[3] ${isTaken ? 'animate-pop' : 'opacity-0'}`} />
                </div>

                {/* Medicine Label & Schedule */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate transition-colors ${
                      isTaken ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {med.medicine_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{formatDisplayTime(med.scheduled_time)}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${med.medicine_name}?`)) {
                      onDeleteMedicine(med.id);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition"
                  title="Delete dose"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
