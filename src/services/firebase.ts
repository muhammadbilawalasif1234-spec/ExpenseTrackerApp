// expo/src/services/firebase.ts
import { Platform } from "react-native";

// Firebase project config
export const firebaseConfig = {
  projectId: "expense-tracker-app-8c155",
  appId: "1:323304257293:android:7340b9e31d24adbdba6244",
  apiKey: "AIzaSyBIVhLKEZbP2HOARG9bkdiJOK_5rdFDpk0",
  storageBucket: "expense-tracker-app-8c155.firebasestorage.app",
  messagingSenderId: "323304257293",
};

export const db = null;

// Safe fallback if native module not installed
let cachedAnalytics: any = null;
const getNativeAnalytics = (): any => {
  if (Platform.OS === "web") return null;
  if (!cachedAnalytics) {
    try {
      // Dynamic require to avoid TS error if module missing
      const { getAnalytics } = require("@react-native-firebase/analytics");
      cachedAnalytics = getAnalytics();
    } catch (err) {
      console.warn("[Firebase Analytics] Native module not ready:", err);
    }
  }
  return cachedAnalytics;
};

const crashlytics = () => ({
  log: (_message: string) => undefined,
  setAttributes: (_attributes: Record<string, any>) => undefined,
  setUserId: (_userId: string) => undefined,
  recordError: async (_error: Error) => Promise.resolve(),
  crash: () => undefined,
});

export interface MobileTelemetryEvent {
  id: string;
  timestamp: string;
  type: "analytics" | "crash" | "screen_view" | "user";
  name: string;
  payload?: Record<string, any>;
  isFatal?: boolean;
}

const mobileTelemetryLogs: MobileTelemetryEvent[] = [];

export const initializeFirebaseServices = async () => {
  console.log("[Firebase] Initializing:", firebaseConfig.projectId);
  try {
    const instance = getNativeAnalytics();
    if (instance) {
      const {
        setAnalyticsCollectionEnabled,
      } = require("@react-native-firebase/analytics");
      await setAnalyticsCollectionEnabled(instance, true);
    }
  } catch (e) {
    console.warn("[Firebase] Failed to enable analytics:", e);
  }
  return Promise.resolve();
};

export const trackEvent = async (
  eventName: string,
  params?: Record<string, any>,
) => {
  try {
    const instance = getNativeAnalytics();
    if (instance) {
      const {
        logEvent,
        logAppOpen,
      } = require("@react-native-firebase/analytics");
      if (eventName === "app_open") {
        await logAppOpen(instance);
      } else {
        const sanitizedName = eventName.replace(/[^a-zA-Z0-9_]/g, "_");
        await logEvent(instance, sanitizedName, params);
      }
    }
    mobileTelemetryLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "analytics",
      name: eventName,
      payload: params,
    });
  } catch (e) {
    console.error("[Analytics Error]", e);
  }
};

export const trackScreenView = async (screen: string, screenClass: string) => {
  try {
    const instance = getNativeAnalytics();
    if (instance) {
      const { logScreenView } = require("@react-native-firebase/analytics");
      await logScreenView(instance, {
        screen_name: screen,
        screen_class: screenClass,
      });
    }
    mobileTelemetryLogs.unshift({
      id: `screen_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "screen_view",
      name: screen,
      payload: { screen_class: screenClass },
    });
  } catch (e) {
    console.error("[ScreenView Error]", e);
  }
};

export const recordMobileCrash = async (
  error: Error | string,
  isFatal = false,
  context?: Record<string, any>,
) => {
  const errorObj = typeof error === "string" ? new Error(error) : error;
  try {
    crashlytics().log(`Context: ${JSON.stringify(context ?? {})}`);
    await crashlytics().recordError(errorObj);
    mobileTelemetryLogs.unshift({
      id: `crash_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "crash",
      name: `${errorObj.name}: ${errorObj.message}`,
      payload: { stack: errorObj.stack, ...context },
      isFatal,
    });
  } catch (e) {
    console.error("[Crashlytics Error]", e);
  }
};

export const setFirebaseUser = async (
  userId: string,
  userAttributes?: Record<string, any>,
) => {
  try {
    const instance = getNativeAnalytics();
    if (instance) {
      const {
        setUserId,
        setUserProperties,
      } = require("@react-native-firebase/analytics");
      await setUserId(instance, userId);
      if (userAttributes) {
        const stringProps: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(userAttributes)) {
          stringProps[k] =
            v === null ? null : typeof v === "string" ? v : String(v);
        }
        await setUserProperties(instance, stringProps);
      }
    }
    mobileTelemetryLogs.unshift({
      id: `user_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: "user",
      name: `User: ${userId}`,
      payload: userAttributes,
    });
  } catch (e) {
    console.error("[SetUser Error]", e);
  }
};

export const getMobileTelemetryLogs = (): MobileTelemetryEvent[] => [
  ...mobileTelemetryLogs,
];

const analyticsService = {
  logEvent: async (eventName: string, params?: Record<string, any>) =>
    trackEvent(eventName, params),
  logScreenView: async (payload: {
    screen_name: string;
    screen_class: string;
  }) => trackScreenView(payload.screen_name, payload.screen_class),
  setUserId: async (userId: string) => setFirebaseUser(userId),
  setUserProperties: async (props: Record<string, any>) => {
    const instance = getNativeAnalytics();
    if (instance) {
      try {
        const {
          setUserProperties,
        } = require("@react-native-firebase/analytics");
        const stringProps: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(props)) {
          stringProps[k] =
            v === null ? null : typeof v === "string" ? v : String(v);
        }
        await setUserProperties(instance, stringProps);
      } catch {}
    }
  },
};

export { analyticsService as analytics, crashlytics };
export default db;
