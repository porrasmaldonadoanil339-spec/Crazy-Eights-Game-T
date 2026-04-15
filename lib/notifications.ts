import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationSettings = {
  notificationsEnabled: boolean;
  missionNotifications: boolean;
  rewardNotifications: boolean;
  eventNotifications: boolean;
  reminderNotifications: boolean;
};

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function scheduleAllNotifications(settings: NotificationSettings): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await cancelAllNotifications();
    if (!settings.notificationsEnabled) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    if (settings.rewardNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🏆 OCHO LOCOS",
          body: "¡Tu recompensa diaria está lista para reclamar!",
          sound: true,
          data: { type: "daily_reward" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 10,
          minute: 0,
        },
      });
    }

    if (settings.missionNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎯 OCHO LOCOS",
          body: "¡Hay misiones nuevas disponibles! ¿Las aceptas?",
          sound: true,
          data: { type: "missions" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 14,
          minute: 0,
        },
      });
    }

    if (settings.eventNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⭐ OCHO LOCOS",
          body: "¡Hay eventos especiales activos! No te los pierdas.",
          sound: true,
          data: { type: "event" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 0,
        },
      });
    }

    if (settings.reminderNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🃏 OCHO LOCOS",
          body: "¡Te echamos de menos! Ven a jugar una partida.",
          sound: true,
          data: { type: "reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }
  } catch {}
}

export async function scheduleChestReadyNotification(chestId: string, chestLabel: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "OCHO LOCOS",
        body: `¡Tu ${chestLabel} está listo para abrir!`,
        sound: true,
        data: { type: "chest_ready", chestId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3 * 60 * 60,
        repeats: false,
      },
    });
  } catch {}
}

export async function scheduleReEngagementNotification(delaySecs: number = 86400): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "OCHO LOCOS",
        body: "¡Llevas un día sin jugar! Hay recompensas esperándote.",
        sound: true,
        data: { type: "re_engagement" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySecs,
        repeats: false,
      },
    });
  } catch {}
}

export function getNotificationIcon(): string {
  return "notifications";
}
