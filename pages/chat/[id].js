import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import ChatScreen from '../../components/ChatScreen'
import { auth, db } from '../../firebase'
import getRecipientEmail from '../../utils/getRecipientEmail'
import Sidebar from '../../components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { arrayUnion } from 'firebase/firestore'

const ChatPage = ({ messages, chat, allUsers }) => {
  const [user] = useAuthState(auth)
  const [openSideBar, setOpenSideBar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    db.collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .where('user', '!=', user.email)
      .get()
      .then((snapShots) => {
        snapShots?.docs?.map((message, index) => {
          if (message?.data()?.seen.includes(user.email)) {
          } else {
            snapShots.docs[index].ref.set(
              {
                seen: arrayUnion(user.email),
              },
              { merge: true }
            )
          }
        })
      })
  }, [])

  return (
    <div className="flex">
      <Head>
        <title>
          Barking with{' '}
          {chat.type === 'group'
            ? chat.chat_name + ' group'
            : getRecipientEmail(chat.users, user)}
        </title>
      </Head>
      <Toaster />

      <div
        className={`${
          openSideBar
            ? 'visible bg-opacity-70 bg-black'
            : 'invisible bg-opacity-0 bg-black'
        }  w-full h-full fixed top-0 bottom-0 left-0 z-20 transition-all duration-[600ms] ease-[0.85, 0.01, 0.4, 1]`}
        onClick={() => setOpenSideBar(false)}
      ></div>

      <div
        className={`absolute left-0 top-0 bottom-0 z-30 bg-white ${
          openSideBar ? 'ml-0' : '-ml-[320px]'
        } transition-all duration-[600ms] ease-[0.85, 0.01, 0.4, 1] lg:relative lg:ml-0`}
      >
        <Sidebar openSideBar={openSideBar} />
      </div>

      <div className="max-h-screen flex-1">
        <ChatScreen
          chat={chat}
          messages={messages}
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
          allUsers={allUsers}
        />
      </div>
    </div>
  )
}

export default ChatPage

export async function getServerSideProps(context) {
  const ref = db.collection('chats').doc(context.query.id)
  const usersRef = db.collection('users')

  const messagesRes = await ref
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get()

  const usersRes = await usersRef.get()

  const messages = messagesRes.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .map((messages) => ({
      ...messages,
      timestamp: messages.timestamp.toDate().getTime(),
    }))

  const chatRes = await ref.get()
  const chat = {
    id: chatRes.id,
    ...chatRes.data(),
  }

  const allUsers = usersRes.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .map((users) => ({
      ...users,
      lastSeen: users.lastSeen.toDate().getTime(),
    }))

  return {
    props: {
      messages: JSON.stringify(messages),
      chat: chat,
      allUsers: JSON.stringify(allUsers),
    },
  }
}
