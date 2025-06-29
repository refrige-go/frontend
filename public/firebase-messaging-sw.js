importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCOUfkcLLVN9bCP_rw2ik7cKDPqz2EzGsc",
  authDomain: "refrige-go-7963b.firebaseapp.com",
  projectId: "refrige-go-7963b",
  storageBucket: "refrige-go-7963b.firebasestorage.app",
  messagingSenderId: "1046492914823",
  appId: "1:1046492914823:web:17b896f675f88e719ec422",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const { title, ...options } = payload.notification;
  self.registration.showNotification(title, options);
}); 