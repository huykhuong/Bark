import Head from 'next/head'
import React from 'react'
import { auth, provider } from '../firebase'

const Login = () => {
  const signIn = () => {
    auth.signInWithPopup(provider).catch(alert)
  }
  return (
    <div className="grid place-items-center h-screen bg-whitesmoke">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col p-[100px] items-center bg-white shadow-lg">
        <img className="h-[200px] w-[200px] mb-[50px]" src="/bark.svg" />
        <button onClick={signIn} className="">
          Sign in with google
        </button>
      </div>
    </div>
  )
}

export default Login
