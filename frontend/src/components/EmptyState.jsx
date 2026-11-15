// -----------------------------------------------------------------------------
// Module Imports
// Import React and Lucide icons
// -----------------------------------------------------------------------------
import React from 'react';
import { Pill, Plus } from 'lucide-react';

// -----------------------------------------------------------------------------
// Component: EmptyState
// Displays welcoming call-to-action when the patient has no registered medications
// -----------------------------------------------------------------------------
export default function EmptyState({ onAddClick }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
      <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
        <Pill className="w-8 h-8 -rotate-45" />
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">No Prescriptions Yet</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
          Keep track of your daily doses, organize by condition, and get timely alarm reminders on your phone.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-600/25 transition active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        Add Your First Medicine
      </button>
    </div>
  );
}
