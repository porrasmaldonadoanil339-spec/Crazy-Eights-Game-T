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

const IDS = {
  DAILY_REWARD: "ocho_daily_reward",
  MISSIONS: "ocho_missions",
  EVENT: "ocho_event",
  REMINDER: "ocho_reminder",
  RE_ENGAGEMENT: "ocho_re_engagement",
  chest: (id: string) => `ocho_chest_${id}`,
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

async function cancelById(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}

function computeNextDailyRewardDate(lastClaimDateStr: string): Date | null {
  // Daily reward resets at midnight of the next calendar day after lastClaimDateStr.
  // Only schedule if the reward was claimed today; if it's already available, skip.
  const todayStr = new Date().toDateString();
  if (!lastClaimDateStr || lastClaimDateStr !== todayStr) {
    // Reward already available — no need to notify
    return null;
  }
  // Claimed today: fire at midnight (start of next calendar day) — same boundary used by canClaimDailyReward
  const nextReset = new Date();
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(0, 1, 0, 0); // 00:01 — just after the toDateString() day rollover
  return nextReset;
}

export async function scheduleAllNotifications(
  settings: NotificationSettings,
  lastDailyRewardDate: string = ""
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await cancelById(IDS.DAILY_REWARD);
    await cancelById(IDS.MISSIONS);
    await cancelById(IDS.EVENT);
    await cancelById(IDS.REMINDER);

    if (!settings.notificationsEnabled) {
      await cancelById(IDS.RE_ENGAGEMENT);
      return;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    if (settings.rewardNotifications) {
      const nextDate = computeNextDailyRewardDate(lastDailyRewardDate);
      if (nextDate) {
        await Notifications.scheduleNotificationAsync({
          identifier: IDS.DAILY_REWARD,
          content: {
            title: "OCHO LOCOS",
            body: "¡Tu recompensa diaria está lista para reclamar!",
            sound: true,
            data: { type: "daily_reward" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextDate,
          },
        });
      }
    }

    if (settings.missionNotifications) {
      await Notifications.scheduleNotificationAsync({
        identifier: IDS.MISSIONS,
        content: {
          title: "OCHO LOCOS",
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
        identifier: IDS.EVENT,
        content: {
          title: "OCHO LOCOS",
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
        identifier: IDS.REMINDER,
        content: {
          title: "OCHO LOCOS",
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

export async function scheduleChestReadyNotification(
  chestId: string,
  chestLabel: string,
  settings?: Pick<NotificationSettings, "notificationsEnabled" | "rewardNotifications">
): Promise<void> {
  if (Platform.OS === "web") return;
  if (settings && (!settings.notificationsEnabled || !settings.rewardNotifications)) return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    const id = IDS.chest(chestId);
    await cancelById(id);
    await Notifications.scheduleNotificationAsync({
      identifier: id,
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

export async function scheduleReEngagementNotification(
  delaySecs: number = 86400,
  settings?: Pick<NotificationSettings, "notificationsEnabled" | "reminderNotifications">
): Promise<void> {
  if (Platform.OS === "web") return;
  if (settings && (!settings.notificationsEnabled || !settings.reminderNotifications)) return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await cancelById(IDS.RE_ENGAGEMENT);
    await Notifications.scheduleNotificationAsync({
      identifier: IDS.RE_ENGAGEMENT,
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
