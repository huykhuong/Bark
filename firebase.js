import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

// whatsapp-1759a.firebaseapp.com

const firebaseConfig = {
  apiKey: 'AIzaSyBYLEbBput1TtFaDw3w8gukA_ipLnqaNxY',
  authDomain: 'bark.com',
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

export { db, auth, provider }
