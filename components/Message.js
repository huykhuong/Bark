import moment from 'moment'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'

const Message = ({ user, message, chat_type }) => {
  const [userLoggedIn] = useAuthState(auth)

  const generalMessageStyle =
    'w-fit p-[15px] rounded-[8px] m-[10px] min-w-[60px] pb-[26px] relative'

  const senderStyle = 'ml-auto bg-[#dcf8c6]'
  const receiverStyle = 'text-left bg-blue-200'

  return (
    <div>
      {chat_type === 'DM' ? (
        <p
          className={`${generalMessageStyle} ${
            userLoggedIn.email === user ? senderStyle : receiverStyle
          }`}
        >
          {message.message}
          <span className="text-gray p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).format('LT') : '...'}
          </span>
        </p>
      ) : (
        <p
          className={`${generalMessageStyle} ${
            userLoggedIn.email === user ? senderStyle : receiverStyle
          }`}
        >
          {message.message}
          <span className="text-gray p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).format('LT') : '...'}
          </span>
        </p>
      )}
    </div>
  )
}

export default Message
