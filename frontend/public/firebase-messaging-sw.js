// frontend/public/firebase-messaging-sw.js

// Import Firebase scripts (compat versions for service worker)
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  messagingSenderId: 517289404583 // 👉 Replace with your sender ID from .env
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "RescueLink", {
    body: body || "New update received",
    icon: icon || "/icons/icon-192.png",
  });
});
