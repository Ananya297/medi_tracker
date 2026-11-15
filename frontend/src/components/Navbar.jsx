// -----------------------------------------------------------------------------
// Module Imports
// Import React, Lucide icons, and Auth hook
// -----------------------------------------------------------------------------
import React from 'react';
import { Pill, LogOut, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// -----------------------------------------------------------------------------
// Component: Navbar
// Top mobile app bar showing patient name, today's date, and daily progress pill
// -----------------------------------------------------------------------------
export default function Navbar({ takenCount = 0, totalCount = 0, onOpenProfile }) {
  const { user, logout } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const percent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Current Date */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Pill className="w-5 h-5 -rotate-45 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 leading-tight">MedTracker</h1>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded">
                App
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">{formattedDate}</p>
          </div>
        </div>

        {/* Patient Status & Progress Pill */}
        <div className="flex items-center space-x-2">
          {totalCount > 0 && (
            <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
              <span>{takenCount}/{totalCount}</span>
              <span className="text-[10px] text-emerald-600 font-medium">({percent}%)</span>
            </div>
          )}

          {user && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition"
              title="Patient Profile"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span className="max-w-[70px] truncate">{user.name || user.phone_number}</span>
            </button>
          )}

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
