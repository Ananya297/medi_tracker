// -----------------------------------------------------------------------------
// Module Imports
// Import React, Lucide icons, Auth context, and medicineApi
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { Pill, Smartphone, User, Calendar, Loader2, ShieldCheck, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { medicineApi } from '../api/medicineApi';

// -----------------------------------------------------------------------------
// Component: LoginScreen
// Patient onboarding and login screen requesting phone, name, age, and gender
// -----------------------------------------------------------------------------
export default function LoginScreen() {
  const { login } = useAuth();

  const [phone, setPhone] = useState('+919876543210');
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number with country code (e.g. +919876543210).');
      return;
    }

    setLoading(true);
    try {
      const user = await medicineApi.loginUser({
        phone_number: phone.trim(),
        name: name.trim() || undefined,
        age: age ? Number(age) : 30,
        gender: gender || 'Other',
      });
      login(user);
    } catch (err) {
      console.error('[LoginScreen] Error:', err);
      setErrorMsg(
        err?.response?.data?.detail ||
        err?.message ||
        'Could not connect to MedTracker backend. Please verify that the server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-slate-200/80 overflow-hidden">
        {/* Hero Header */}
        <div className="bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Pill className="w-8 h-8 -rotate-45" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">MedTracker</h1>
          <p className="text-xs text-teal-100 font-medium mt-1 max-w-[260px] mx-auto">
            Your personal companion for timely medications and health tracking
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div className="flex items-center gap-1.5 mb-1 text-slate-800">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Patient Onboarding</h2>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Mobile Phone Number *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-semibold tracking-wide"
              />
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Patient Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Age
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="1"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Encrypted patient records on Neon Serverless Cloud</span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Enter Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
