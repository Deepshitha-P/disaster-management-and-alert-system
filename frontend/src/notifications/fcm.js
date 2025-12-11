// frontend/src/notifications/fcm.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

// Request user permission for push notifications
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log("FCM Token:", token);
        // 👉 Send this token to your backend to save for this user
      } else {
        console.warn("No registration token available.");
      }
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (err) {
    console.error("Error getting permission or token:", err);
  }
};

// Listen for messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
