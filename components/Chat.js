import React from 'react'
import { Avatar } from '@material-ui/core/'
import getRecipientEmail from '../utils/getRecipientEmail'
import { auth, db } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { useRouter } from 'next/router'

function Chat({ id, users }) {
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
      className="flex align-center cursor-pointer p-[15px] break-words"
    >
      {recipient ? (
        <Avatar src={recipient?.photoURL} />
      ) : (
        <Avatar>{recipientEmail[0]}</Avatar>
      )}
      <p>{recipientEmail}</p>
    </div>
  )
}

export default Chat
