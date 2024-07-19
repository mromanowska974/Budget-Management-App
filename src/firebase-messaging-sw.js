importScripts(
    'https://www.gstatic.com/firebasejs/9.8.0/firebase-app-compat.js',
);
importScripts(
    'https://www.gstatic.com/firebasejs/9.8.0/firebase-messaging-compat.js',
);

const app = firebase.initializeApp({
    apiKey: "AIzaSyCU8X2jfKfUBOWt44hanOzdeb8kqr1moXw",
    authDomain: "budgetmanagementapp-b6eed.firebaseapp.com",
    databaseURL: "https://budgetmanagementapp-b6eed-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "budgetmanagementapp-b6eed",
    storageBucket: "budgetmanagementapp-b6eed.appspot.com",
    messagingSenderId: "820282888423",
    appId: "1:820282888423:web:4fc9998fac3509a1c65242",
    measurementId: "G-673SS695BY"
});
  
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
      body: 'Background Message body.'
    };
  
    self.registration.showNotification(notificationTitle,
      notificationOptions);
});