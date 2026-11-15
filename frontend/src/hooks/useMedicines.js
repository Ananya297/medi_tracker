// -----------------------------------------------------------------------------
// Module Imports
// Import TanStack React Query hooks and API service methods
// -----------------------------------------------------------------------------
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineApi } from '../api/medicineApi';
import { alarmService } from '../services/alarmService';

// -----------------------------------------------------------------------------
// Hook: useTodayMedicines
// Fetches daily disease-grouped medicine schedule for the active user
// -----------------------------------------------------------------------------
export function useTodayMedicines(userId) {
  return useQuery({
    queryKey: ['todayMedicines', userId],
    queryFn: () => medicineApi.fetchTodayMedicines(userId),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds fresh
  });
}

// -----------------------------------------------------------------------------
// Hook: useDiagnoses
// Fetches registered health conditions/diagnoses for dropdown selection
// -----------------------------------------------------------------------------
export function useDiagnoses(userId) {
  return useQuery({
    queryKey: ['diagnoses', userId],
    queryFn: () => medicineApi.fetchDiagnoses(userId),
    enabled: !!userId,
  });
}

// -----------------------------------------------------------------------------
// Hook: useToggleMedicine
// Optimistic mutation for instantaneous checkbox feedback
// -----------------------------------------------------------------------------
export function useToggleMedicine(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicineId, isTaken }) =>
      medicineApi.toggleMedicine(userId, medicineId, null, isTaken),

    // -------------------------------------------------------------------------
    // Optimistic Update: onMutate
    // Invert checkbox state immediately in client cache before server confirms
    // -------------------------------------------------------------------------
    onMutate: async ({ medicineId, isTaken }) => {
      await queryClient.cancelQueries({ queryKey: ['todayMedicines', userId] });

      const previousData = queryClient.getQueryData(['todayMedicines', userId]);

      if (previousData?.groups) {
        let updatedTakenCount = previousData.taken_count;
        const updatedGroups = previousData.groups.map((group) => ({
          ...group,
          medicines: group.medicines.map((med) => {
            if (med.id === medicineId) {
              if (isTaken && !med.is_taken_today) updatedTakenCount++;
              else if (!isTaken && med.is_taken_today) updatedTakenCount--;
              return { ...med, is_taken_today: isTaken };
            }
            return med;
          }),
        }));

        queryClient.setQueryData(['todayMedicines', userId], {
          ...previousData,
          taken_count: Math.max(0, updatedTakenCount),
          groups: updatedGroups,
        });
      }

      return { previousData };
    },

    // -------------------------------------------------------------------------
    // Rollback on Error
    // Restore previous state if network request fails
    // -------------------------------------------------------------------------
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['todayMedicines', userId], context.previousData);
      }
    },

    // -------------------------------------------------------------------------
    // Sync Cache: onSettled
    // Re-validate against database
    // -------------------------------------------------------------------------
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMedicines', userId] });
    },
  });
}

// -----------------------------------------------------------------------------
// Hook: useAddMedicine
// Adds new medicine, updates cache, and registers native alarm notification
// -----------------------------------------------------------------------------
export function useAddMedicine(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const created = await medicineApi.addMedicine(userId, payload);
      // Automatically register alarm reminder
      if (created?.id && payload.enableNotification !== false) {
        await alarmService.scheduleMedicineAlarm(created);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMedicines', userId] });
      queryClient.invalidateQueries({ queryKey: ['diagnoses', userId] });
    },
  });
}

// -----------------------------------------------------------------------------
// Hook: useDeleteMedicine
// Removes medicine, cancels associated alarm, and invalidates query cache
// -----------------------------------------------------------------------------
export function useDeleteMedicine(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medicineId) => {
      await medicineApi.deleteMedicine(userId, medicineId);
      await alarmService.cancelMedicineAlarm(medicineId);
      return medicineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMedicines', userId] });
      queryClient.invalidateQueries({ queryKey: ['diagnoses', userId] });
    },
  });
}
