// -----------------------------------------------------------------------------
// Module Imports
// Import Capacitor LocalNotifications and platform check utility
// -----------------------------------------------------------------------------
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// -----------------------------------------------------------------------------
// Service: alarmService
// Manages device notifications and alarms for scheduled medication times
// -----------------------------------------------------------------------------
export const alarmService = {
  // ---------------------------------------------------------------------------
  // Method: requestAlarmPermissions
  // Requests system notification permissions on Android/iOS
  // ---------------------------------------------------------------------------
  requestAlarmPermissions: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          const requested = await LocalNotifications.requestPermissions();
          return requested.display === 'granted';
        }
        return true;
      } else {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') return true;
          const perm = await Notification.requestPermission();
          return perm === 'granted';
        }
      }
    } catch (err) {
      console.warn('[alarmService] Permission check failed:', err);
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  // Method: scheduleMedicineAlarm
  // Schedules a daily repeating alarm notification at the medicine's intake time
  // ---------------------------------------------------------------------------
  scheduleMedicineAlarm: async (medicine) => {
    if (!medicine || !medicine.scheduled_time) return false;

    const [hourStr, minStr] = medicine.scheduled_time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    if (isNaN(hour) || isNaN(minute)) return false;

    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Number(medicine.id),
              title: `Medicine Reminder: ${medicine.medicine_name}`,
              body: medicine.condition_name
                ? `Time for your daily ${medicine.medicine_name} dose (${medicine.condition_name})`
                : `Time to take your scheduled dose of ${medicine.medicine_name}.`,
              schedule: {
                on: {
                  hour: hour,
                  minute: minute,
                },
                repeats: true,
                allowWhileIdle: true,
              },
              sound: 'beep.wav',
              actionTypeId: 'MED_REMINDER',
              extra: {
                medicineId: medicine.id,
                time: medicine.scheduled_time,
              },
            },
          ],
        });
        console.log(`[alarmService] Native alarm registered for ${medicine.medicine_name} at ${medicine.scheduled_time}`);
        return true;
      } else {
        console.log(`[alarmService Web] Registered reminder for ${medicine.medicine_name} at ${medicine.scheduled_time}`);
        return true;
      }
    } catch (err) {
      console.error('[alarmService] Scheduling error:', err);
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Method: cancelMedicineAlarm
  // Cancels active alarms for a specific medicine ID
  // ---------------------------------------------------------------------------
  cancelMedicineAlarm: async (medicineId) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({
          notifications: [{ id: Number(medicineId) }],
        });
        console.log(`[alarmService] Canceled alarm for medicine ID: ${medicineId}`);
      }
    } catch (err) {
      console.warn('[alarmService] Cancel error:', err);
    }
  },

  // ---------------------------------------------------------------------------
  // Method: syncAllAlarms
  // Synchronizes alarms for all active medications in the daily schedule
  // ---------------------------------------------------------------------------
  syncAllAlarms: async (medicinesList = []) => {
    if (!Capacitor.isNativePlatform() || !Array.isArray(medicinesList)) return;

    try {
      // Fetch currently scheduled pending alarms
      const pending = await LocalNotifications.getPending();
      const pendingIds = new Set(pending.notifications.map((n) => n.id));

      // Schedule any missing alarms for active medicines
      for (const med of medicinesList) {
        if (!pendingIds.has(Number(med.id))) {
          await alarmService.scheduleMedicineAlarm(med);
        }
      }
      console.log(`[alarmService] Synced alarms for ${medicinesList.length} medications`);
    } catch (err) {
      console.error('[alarmService] Sync all alarms failed:', err);
    }
  },
};

export default alarmService;
