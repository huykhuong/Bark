import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import localforage from 'localforage'
import cookie from 'js-cookie'
import { getStorage } from 'firebase/storage'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// whatsapp-1759a.firebaseapp.com

// https://bark-eight.vercel.app/

const firebaseConfig = {
  apiKey: 'AIzaSyBYLEbBput1TtFaDw3w8gukA_ipLnqaNxY',
  authDomain: 'whatsapp-1759a.firebaseapp.com',
  projectId: 'whatsapp-1759a',
  storageBucket: 'whatsapp-1759a.appspot.com',
  messagingSenderId: '1026354187533',
  appId: '1:1026354187533:web:1cce861dd5320bb0b23444',
}

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app()

const db = app.firestore()
const auth = app.auth()
const provider = new firebase.auth.GoogleAuthProvider()

const storage = getStorage(app)

const firebaseCloudMessaging = {
  tokenInlocalforage: async () => {
    const token = null
    // await localforage.getItem('fcm_token')
    // const token = await cookie.get('fcm_token')
    // alert('fcm_token tokenInlocalforage', token)
    return token
  },
  onMessage: async () => {
    const messaging = getMessaging()
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload)
      alert('Notificacion')
    })
  },

  init: async function () {
    try {
      if ((await this.tokenInlocalforage()) !== null) {
        console.log('it already exists')
        return false
      }
      console.log('it is creating it.')
      const messaging = getMessaging(app)
      await Notification.requestPermission()
      getToken(messaging, {
        vapidKey:
          'BFv92flyF5cx6an3eOX7mFXAaTUiMjQ4TyKapJo_oiO-ZWacfCryw58PKVbiVMjVLe964nLcqGjAjTxXA8zWpKQ',
      })
        .then((currentToken) => {
          console.log('current Token', currentToken)
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            // save the token in your database
            // localforage.setItem('fcm_token', currentToken)
            document.cookie = `fcm_token=${currentToken}; expires=Thu, 18 Dec 2025 12:00:00 UTC;`
            alert(currentToken)
            alert('working')
          } else {
            // Show permission request UI
            console.log(
              'NOTIFICACION, No registration token available. Request permission to generate one.'
            )
            // ...
          }
        })
        .catch((err) => {
          console.log('NOTIFICACIONAn error occurred while retrieving token . ')
          console.log(err)
        })
    } catch (error) {
      console.error(error)
    }
  },
}

export { db, auth, provider, storage, firebaseCloudMessaging }
