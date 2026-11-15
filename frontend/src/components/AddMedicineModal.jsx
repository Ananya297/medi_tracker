// -----------------------------------------------------------------------------
// Module Imports
// Import React, Lucide icons, and alarm service
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { X, Plus, Clock, Pill, Bell, Loader2, Tag } from 'lucide-react';
import { alarmService } from '../services/alarmService';

const COMMON_CONDITIONS = [
  'General Health',
  'Diabetes',
  'Hypertension',
  'Thyroid',
  'Asthma',
  'Cholesterol',
  'Arthritis',
];

const PRESET_TIMES = [
  { label: 'Morning', value: '08:00' },
  { label: 'Noon', value: '13:00' },
  { label: 'Evening', value: '18:00' },
  { label: 'Night', value: '21:00' },
];

// -----------------------------------------------------------------------------
// Component: AddMedicineModal
// Bottom sheet modal allowing entry of medicine, 24h time, and condition tags
// -----------------------------------------------------------------------------
export default function AddMedicineModal({ isOpen, onClose, onAdd, existingDiagnoses = [] }) {
  const [medicineName, setMedicineName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [conditionTag, setConditionTag] = useState('General Health');
  const [customCondition, setCustomCondition] = useState('');
  const [enableAlarm, setEnableAlarm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Merge common preset tags with patient's existing diagnoses
  const allConditions = Array.from(
    new Set([
      ...COMMON_CONDITIONS,
      ...existingDiagnoses.map((d) => d.condition_name),
    ])
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!medicineName.trim()) {
      setErrorMsg('Please provide the medicine name.');
      return;
    }

    if (!scheduledTime.trim()) {
      setErrorMsg('Please choose scheduled intake time.');
      return;
    }

    const finalCondition = customCondition.trim() || conditionTag || 'General Health';

    setSubmitting(true);
    try {
      if (enableAlarm) {
        await alarmService.requestAlarmPermissions();
      }

      await onAdd({
        medicine_name: medicineName.trim(),
        scheduled_time: scheduledTime.trim(),
        condition_name: finalCondition,
        enableNotification: enableAlarm,
      });

      // Reset
      setMedicineName('');
      setScheduledTime('08:00');
      setConditionTag('General Health');
      setCustomCondition('');
      onClose();
    } catch (err) {
      console.error('[AddMedicineModal] Error adding medicine:', err);
      setErrorMsg(err?.response?.data?.detail || 'Failed to add medication. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add Prescription</h2>
              <p className="text-xs text-slate-400">Set dosage schedule and health condition</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin 500mg, Atorvastatin"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-medium"
            />
          </div>

          {/* 24h Time Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Scheduled Intake Time (24h) *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-sm font-bold"
                />
              </div>
            </div>

            {/* Preset Time Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TIMES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setScheduledTime(pt.value)}
                  className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition ${
                    scheduledTime === pt.value
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pt.label} ({pt.value})
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Disease Tag Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              Health Condition / Disease Tag
            </label>

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {allConditions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    setConditionTag(cond);
                    setCustomCondition('');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                    conditionTag === cond && !customCondition
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <input
              type="text"
              placeholder="Or type a new disease tag..."
              value={customCondition}
              onChange={(e) => {
                setCustomCondition(e.target.value);
                if (e.target.value) setConditionTag('');
              }}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-teal-500 text-slate-900 text-xs font-medium"
            />
          </div>

          {/* Alarm Notification Option */}
          <div className="flex items-center justify-between p-3.5 bg-teal-50/70 border border-teal-100 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">Capacitor Daily Alarm</p>
                <p className="text-[11px] text-slate-500">Fire notification sound at {scheduledTime}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableAlarm}
              onChange={(e) => setEnableAlarm(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded-md accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Medication
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
