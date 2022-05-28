import Head from 'next/head'
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import ChatScreen from '../../components/ChatScreen'
import { auth, db } from '../../firebase'
import getRecipientEmail from '../../utils/getRecipientEmail'
import Sidebar from '../../components/Sidebar'
import { Toaster } from 'react-hot-toast'

const ChatPage = ({ messages, chat }) => {
  const [user] = useAuthState(auth)
  const [openSideBar, setOpenSideBar] = useState(false)

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

      <div className="flex-1 overflow-scroll scrollbar-hide h-screen">
        <ChatScreen
          chat={chat}
          messages={messages}
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
        />
      </div>
    </div>
  )
}

export default ChatPage

export async function getServerSideProps(context) {
  const ref = db.collection('chats').doc(context.query.id)

  const messagesRes = await ref
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get()

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

  return {
    props: {
      messages: JSON.stringify(messages),
      chat: chat,
    },
  }
}
