import React, { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { useRouter } from 'next/router'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import { useCollection } from 'react-firebase-hooks/firestore'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'
import Message from './Message'
import { serverTimestamp } from 'firebase/firestore'
import getRecipientEmail from '../utils/getRecipientEmail'
import { Avatar } from '@material-ui/core'
import TimeAgo from 'timeago-react'
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
} from '../utils/chatLogics'

const ChatScreen = ({ messages, chat }) => {
  const [user] = useAuthState(auth)
  const endOfMessageRef = useRef()
  const [input, setInput] = useState('')
  const router = useRouter()
  const [messagesSnapshot] = useCollection(
    db
      .collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .orderBy('timestamp', 'asc')
  )
  const bark_audio = new Audio('/bark_SFX.wav')

  const triggerBarkSound = () => {
    bark_audio.play()
  }

  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [router.asPath])

  //send message function
  const sendMessage = (e) => {
    e.preventDefault()

    db.collection('users').doc(user.uid).set(
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    )

    db.collection('chats').doc(router.query.id).collection('messages').add({
      timestamp: serverTimestamp(),
      message: input,
      user: user.email,
      photoURL: user.photoURL,
    })
    triggerBarkSound()
    setInput('')
    scrollToBottom()
  }

  const [recipientSnapshot] = useCollection(
    db
      .collection('users')
      .where('email', '==', getRecipientEmail(chat.users, user))
  )

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message, index) => (
        <div className={`flex items-end`} key={message.id}>
          {(isSameSender(JSON.parse(messages), message, index, user.email) ||
            isLastMessage(JSON.parse(messages), index, user.email)) && (
            <Avatar src={message.data().photoURL}></Avatar>
          )}
          <div
            style={{
              marginLeft: isSameSenderMargin(
                JSON.parse(messages),
                message,
                index,
                user.email
              ),
            }}
          >
            <Message
              user={message.data().user}
              message={{
                ...message.data(),
                timestamp: message.data().timestamp?.toDate().getTime(),
              }}
            />
          </div>
        </div>
      ))
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} message={message} user={message.user} />
      ))
    }
  }

  const recipient = recipientSnapshot?.docs?.[0]?.data()
  const recipientEmail = getRecipientEmail(chat.users, user)

  return (
    <div className="">
      <div className="sticky z-10 bg-gray-100 top-0 flex p-[11px] h-[80px] items-center border-b border-solid border-white">
        {recipient && chat.users.length <= 2 ? (
          <Avatar src={recipient?.photoURL} />
        ) : !recipient && chat.users.length <= 2 ? (
          <Avatar>{recipientEmail[0]}</Avatar>
        ) : (
          <img className="rounded-full w-10 h-10" src={chat.group_img_url} />
          // <Avatar src={chat_img_url} />
        )}
        <div className="ml-[15px] flex-1">
          <h3 className="font-bold text-lg">
            {chat.chat_name ? chat.chat_name : recipientEmail}
          </h3>
          {recipientSnapshot ? (
            <p>
              Last active: {''}{' '}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                'Unavailable'
              )}
            </p>
          ) : (
            <p>Loading last active</p>
          )}
        </div>
        <div className="">
          <MoreVertIcon />
          <AttachFileIcon />
        </div>
      </div>

      <div className="p-[30px] ">
        {showMessages()}
        {/* End of message */}
        <div className="mb-[50px]" ref={endOfMessageRef}></div>
      </div>

      <form className="flex items-center p-[10px] sticky bottom-0 bg-white z-100">
        <InsertEmoticonIcon />
        <input
          className="flex-1 items-center p-[10px] sticky bg-white z-100 mx-[15px]"
          value={input}
          placeholder="Bark here"
          onChange={(e) => setInput(e.target.value)}
        />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send message
        </button>
        <MicIcon />
      </form>
    </div>
  )
}

export default ChatScreen
