import React from 'react';
import { CheckCircle2, Flame, Award } from 'lucide-react';

export default function ProgressBar({ total = 0, taken = 0 }) {
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
  const isComplete = total > 0 && taken === total;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
        isComplete ? 'bg-emerald-300/30' : 'bg-teal-200/20'
      }`} />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 inline-flex items-center gap-1">
            {isComplete ? (
              <>
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                All Done!
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-teal-600" />
                Daily Progress
              </>
            )}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            {taken} of {total} doses taken
          </h2>
        </div>

        {/* Big percentage pill */}
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-black ${
            isComplete ? 'text-emerald-600' : 'text-slate-900'
          }`}>
            {percent}%
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {total - taken > 0 ? `${total - taken} remaining` : 'Completed'}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xs shadow-emerald-500/50'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Subtext info */}
      <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        {isComplete
          ? 'Fantastic work! You have completed all medications today.'
          : total === 0
          ? 'No medications added yet. Tap the button below to add one.'
          : 'Tap the checkmark after taking each medicine.'}
      </p>
    </div>
  );
}
