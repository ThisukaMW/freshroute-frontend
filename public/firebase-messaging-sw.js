importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:          "AIzaSyCTpLCQo9KNAEFoaiE6bYumZa8oXHYF_8E",
  authDomain:        "freshroute-ed32c.firebaseapp.com",
  projectId:         "freshroute-ed32c",
  storageBucket:     "freshroute-ed32c.firebasestorage.app",
  messagingSenderId: "955489238525",
  appId:             "1:955489238525:web:75c10407d77f02051b6d94"
});

const messaging = firebase.messaging();

// Only show notification when app is in background/closed
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  // Only show if app is not focused
  self.clients.matchAll({ type: "window" }).then((clients) => {
    const isFocused = clients.some((c) => c.focused);
    if (!isFocused) {
      self.registration.showNotification(title ?? "FreshRoute", {
        body: body ?? "",
        icon: "/favicon.ico",
      });
    }
  });
});