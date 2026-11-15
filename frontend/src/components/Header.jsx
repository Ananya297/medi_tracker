import React from 'react';
import { Pill, UserCircle, LogOut } from 'lucide-react';

export default function Header({ user, onOpenProfile, onLogout }) {
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand and Date */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              MedTracker
            </h1>
            <p className="text-xs font-medium text-slate-500">{todayStr}</p>
          </div>
        </div>

        {/* User Profile / Login status */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition"
                title="Profile details"
              >
                <UserCircle className="w-4 h-4 text-teal-600" />
                <span className="max-w-[80px] truncate">{user.name || user.phone_number}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition"
                title="Switch User / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold shadow-xs transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
