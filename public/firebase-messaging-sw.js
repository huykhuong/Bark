importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBYLEbBput1TtFaDw3w8gukA_ipLnqaNxY',
  authDomain: 'whatsapp-1759a.firebaseapp.com',
  projectId: 'whatsapp-1759a',
  storageBucket: 'whatsapp-1759a.appspot.com',
  messagingSenderId: '1026354187533',
  appId: '1:1026354187533:web:1cce861dd5320bb0b23444',
})

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  )
  const notification = JSON.parse(payload.data.notification)
  const notificationTitle = notification.title
  const notificationOptions = {
    body: notification.body,
    icon: '/favicon.ico',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
