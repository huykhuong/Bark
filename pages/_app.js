import '../styles/globals.css'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, firebaseCloudMessaging } from '../firebase'
import Login from './login'
import Loading from '../components/Loading'
import { useEffect, useState } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import localforage from 'localforage'
import cookie from 'js-cookie'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth)
  const [mounted, setMounted] = useState(false)

  if (mounted) {
    firebaseCloudMessaging.onMessage()
  }
  useEffect(() => {
    firebaseCloudMessaging.init()
    const setToken = async () => {
      const token = await firebaseCloudMessaging.tokenInlocalforage()
      if (token) {
        setMounted(true)
        // not working
      }
    }
    const result = setToken()
    console.log('result', result)
  }, [])

  useEffect(() => {
    if (user) {
      ;(async () => {
        db.collection('users').doc(user.uid).set(
          {
            email: user.email,
            lastSeen: serverTimestamp(),
            photoURL: user.photoURL,
            // FCM_id: await cookie.get('fcm_token'),
          },
          { merge: true }
        )
      })()
    }
  }, [user])

  if (loading) return <Loading />
  if (!user) return <Login />

  return (
    <>
      <Head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,minimum-scale=1height=device-height,viewport-fit=cover, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#ffffff"></meta>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c"></meta>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
