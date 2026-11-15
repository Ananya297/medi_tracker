import React, { useState } from 'react';
import { X, Smartphone, User, Loader2, HeartPulse } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialUser }) {
  const [phoneNumber, setPhoneNumber] = useState(initialUser?.phone_number || '+91');
  const [name, setName] = useState(initialUser?.name || '');
  const [age, setAge] = useState(initialUser?.age ? String(initialUser.age) : '30');
  const [gender, setGender] = useState(initialUser?.gender || 'Male');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number with country code (e.g. +919876543210).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLoginSuccess({
        phone_number: phoneNumber.trim(),
        name: name.trim() || undefined,
        age: age ? Number(age) : 30,
        gender: gender || 'Other',
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || 'Login failed. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Profile</h2>
              <p className="text-xs text-slate-400">Sign in with phone number</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Phone Number *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-sm font-semibold tracking-wide"
              />
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
