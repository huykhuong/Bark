import moment from 'moment'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'
import { getGifImage } from '../utils/getGifImage'

const Message = ({ user, message, chat_theme }) => {
  const [userLoggedIn] = useAuthState(auth)

  const generalMessageStyle =
    'w-fit p-[15px] rounded-[8px] mt-[10px] ml-[10px] min-w-[70px] min-h-[78px] pb-[26px] relative'

  const senderStyle = `${chat_theme} absolute bottom-0 bg-opacity-0 text-right`
  const receiverStyle = 'text-left bg-blue-200'
  const imageStyle = 'bg-transparent'
  const receiverStickerStyle = 'text-left'

  return (
    <div>
      {message.type === 'text' ? (
        <p
          className={`${generalMessageStyle} ${
            userLoggedIn.email === user ? senderStyle : receiverStyle
          } `}
        >
          {message.message}
          <span className="text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </p>
      ) : message.type === 'sticker' ? (
        <div
          className={`${generalMessageStyle} ${
            userLoggedIn.email === user ? imageStyle : receiverStickerStyle
          }`}
        >
          <img
            src={getGifImage(message.message)}
            className="max-h-[150px] object-contain"
          />
          <span className="text-gray p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </div>
      ) : message.type === 'emoji' ? (
        <p className={`${generalMessageStyle} text-[50px]`}>
          {message.message}
          <span className="text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </p>
      ) : (
        <div
          className={`${generalMessageStyle} p-0 ${
            userLoggedIn.email === user ? imageStyle : `${imageStyle} text-left`
          }`}
        >
          <img className="max-h-[400px] object-contain" src={message.message} />
          <span className="text-gray p-[10px] text-[9px] absolute bottom-0 text-right right-0">
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default Message
