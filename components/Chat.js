import React from 'react'
import { Avatar } from '@material-ui/core/'
import getRecipientEmail from '../utils/getRecipientEmail'
import { auth, db } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { useRouter } from 'next/router'
import ImageIcon from '@material-ui/icons/Image'

function Chat({ id, users, chat_name, chat_img_url, last_message }) {
  const [user] = useAuthState(auth)
  const router = useRouter()

  const [recipientSnapshot] = useCollection(
    db.collection('users').where('email', '==', getRecipientEmail(users, user))
  )

  const enterChat = () => {
    router.push(`/chat/${id}`)
  }

  const recipient = recipientSnapshot?.docs?.[0]?.data()

  const recipientEmail = getRecipientEmail(users, user)

  return (
    <div
      onClick={enterChat}
      className="flex align-center items-center space-x-4 cursor-pointer p-[15px] break-words"
    >
      {recipient && users.length <= 2 ? (
        <Avatar src={recipient?.photoURL} />
      ) : !recipient && users.length <= 2 ? (
        <Avatar>{recipientEmail[0]}</Avatar>
      ) : (
        <img className="rounded-full w-10 h-10" src={chat_img_url} />
        // <Avatar src={chat_img_url} />
      )}
      <div className="flex flex-col">
        {chat_name !== '' ? <p>{chat_name}</p> : <p>{recipientEmail}</p>}
        <p className="font-bold">
          {last_message?.includes('firebasestorage') ? (
            <>
              Image <ImageIcon />
            </>
          ) : (
            last_message
          )}
        </p>
      </div>
    </div>
  )
}

export default Chat
