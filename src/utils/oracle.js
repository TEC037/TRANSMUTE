import { LocalNotifications } from '@capacitor/local-notifications';
import { haptics } from './haptics';

/**
 * El Oráculo - Motor de Precognición y Recordatorios Alquímicos
 * Gestiona la manifestación de alertas locales para mantener la disciplina.
 */
export const oracle = {
  async requestPermissions() {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.error("El Oráculo no pudo obtener permisos:", e);
      return false;
    }
  },

  async scheduleHabitReminders(habits) {
    
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const today = new Date().toDateString();
    const pendingHabits = habits.filter(h => !h.completedDays || !h.completedDays[today]);

    
    if (pendingHabits.length === 0) return;

    
    
    const baseHours = [10, 14, 17, 20, 22];
    const notificationsToSchedule = [];

    pendingHabits.forEach((habit, index) => {
        
        if (index >= baseHours.length) return; 
        
        let targetHour = baseHours[index];
        const pushDate = new Date();
        pushDate.setHours(targetHour, 0, 0, 0);

        
        if (pushDate.getTime() > Date.now()) {
            notificationsToSchedule.push({
                title: 'El Oráculo',
                body: `La inercia consume tu Athanor. Es hora de cargar el rayo para: ${habit.name}. Frena la decadencia.`,
                id: 1000 + index,
                schedule: { at: pushDate },
                sound: null,
                attachments: null,
                actionTypeId: '',
                extra: { habitId: habit.id }
            });
        }
    });

    
    const finalDate = new Date();
    finalDate.setHours(23, 0, 0, 0);
    if (finalDate.getTime() > Date.now() && pendingHabits.length > 0) {
       notificationsToSchedule.push({
          title: 'El Cónclave de las Sombras',
          body: `El sol ha caído y ${pendingHabits.length} transmutaciones siguen inconclusas. ¿Dormirás en el plomo o forjarás el oro?`,
          id: 9999,
          schedule: { at: finalDate }
       });
    }

    if (notificationsToSchedule.length > 0) {
       await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  },

  async scheduleCustom(title, body, date, id = Math.floor(Math.random() * 10000)) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'El Oráculo',
            body: `${title}: ${body}`,
            id,
            schedule: { at: date },
            extra: null
          }
        ]
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  async cancelAll() {
    await LocalNotifications.removeAllDeliveredNotifications();
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  }
};
