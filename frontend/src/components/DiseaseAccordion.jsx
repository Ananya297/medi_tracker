import React, { useState } from 'react';
import { ChevronDown, Stethoscope, CheckCircle } from 'lucide-react';
import MedicineCard from './MedicineCard';

export default function DiseaseAccordion({ group, onToggleMedicine, onDeleteMedicine }) {
  const [isOpen, setIsOpen] = useState(true);

  const total = group.medicines.length;
  const taken = group.medicines.filter((m) => m.is_taken_today).length;
  const isAllTaken = total > 0 && taken === total;

  return (
    <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header bar / Accordion trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isAllTaken
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-teal-50 text-teal-700 border border-teal-100'
          }`}>
            {isAllTaken ? (
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
              {taken} of {total} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isAllTaken
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {taken}/{total}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-100">
          {group.medicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onToggle={onToggleMedicine}
              onDelete={onDeleteMedicine}
            />
          ))}
        </div>
      )}
    </div>
  );
}
