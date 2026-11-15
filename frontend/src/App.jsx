// -----------------------------------------------------------------------------
// Module Imports
// Import React, Lucide icons, Context, Hooks, and Components
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import {
  useTodayMedicines,
  useDiagnoses,
  useToggleMedicine,
  useAddMedicine,
  useDeleteMedicine,
} from './hooks/useMedicines';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import DiseaseCategoryCard from './components/DiseaseCategoryCard';
import EmptyState from './components/EmptyState';
import AddMedicineModal from './components/AddMedicineModal';
import LoginScreen from './components/LoginScreen';
import LoginModal from './components/LoginModal';
import { alarmService } from './services/alarmService';

// -----------------------------------------------------------------------------
// Component: Dashboard
// Main dashboard for authenticated patient
// -----------------------------------------------------------------------------
function Dashboard({ user }) {
  const { login } = useAuth();

  // Modal display states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Queries and Mutations for Authenticated Patient
  // ---------------------------------------------------------------------------
  const {
    data: scheduleData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTodayMedicines(user.id);

  const { data: diagnosesData } = useDiagnoses(user.id);
  const toggleMutation = useToggleMedicine(user.id);
  const addMutation = useAddMedicine(user.id);
  const deleteMutation = useDeleteMedicine(user.id);

  // Sync scheduled native alarms when medicine list is retrieved
  useEffect(() => {
    if (scheduleData?.groups) {
      const allMeds = scheduleData.groups.flatMap((g) => g.medicines);
      alarmService.syncAllAlarms(allMeds);
    }
  }, [scheduleData]);

  const total = scheduleData?.total_count || 0;
  const taken = scheduleData?.taken_count || 0;
  const groups = scheduleData?.groups || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-28 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        takenCount={taken}
        totalCount={total}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-5 space-y-4">
        {/* Progress Card */}
        <ProgressBar total={total} taken={taken} />

        {/* Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daily Regimen
            </h2>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-white transition"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-xs font-semibold">Loading daily prescriptions...</p>
          </div>
        )}

        {/* Error Alert */}
        {isError && !isLoading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Failed to load schedule</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {error?.response?.data?.detail || error?.message || 'Check connection to backend server.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-bold text-rose-700 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && groups.length === 0 && (
          <EmptyState onAddClick={() => setIsAddOpen(true)} />
        )}

        {/* Disease Category Groups */}
        {!isLoading && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((group) => (
              <DiseaseCategoryCard
                key={group.diagnosis_id}
                group={group}
                onToggleMedicine={(medId, isTaken) =>
                  toggleMutation.mutate({ medicineId: medId, isTaken })
                }
                onDeleteMedicine={(medId) => deleteMutation.mutate(medId)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 inset-x-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="pointer-events-auto w-full py-4 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-700/30 flex items-center justify-center gap-2.5 transition active:scale-[0.98] border border-teal-500/30"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Add Prescription / Dose
        </button>
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={(payload) => addMutation.mutateAsync(payload)}
        existingDiagnoses={diagnosesData || []}
      />

      {/* Profile Edit Modal */}
      <LoginModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLoginSuccess={(updatedUser) => login(updatedUser)}
        initialUser={user}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: App
// Primary full-stack shell orchestrating authentication state
// -----------------------------------------------------------------------------
export default function App() {
  const { user, isAuthenticated } = useAuth();

  // If unauthenticated, render the full LoginScreen onboarding view
  if (!isAuthenticated || !user?.id) {
    return <LoginScreen />;
  }

  return <Dashboard user={user} />;
}
