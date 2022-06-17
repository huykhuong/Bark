import { arrayUnion } from 'firebase/firestore'
import moment from 'moment'
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { getGifImage } from '../utils/getGifImage'

const Message = ({ user, message, chat_document, chat_theme }) => {
  const [userLoggedIn] = useAuthState(auth)
  const [messageExpanded, setMessageExpanded] = useState(false)
  const [messageReactionBoxExpanded, setMessageReactionBoxExpanded] =
    useState(false)

  const generalMessageStyle = `w-fit p-[15px] rounded-[8px] mt-[20px] ml-[10px] min-w-[70px] h-fit ${
    messageExpanded && 'pb-[40px]'
  } relative`

  const senderStyle = `${chat_theme} absolute bottom-0 bg-opacity-0 text-right`
  const receiverStyle = 'text-left bg-blue-200'
  const imageStyle = 'bg-transparent pb-5'
  const receiverStickerStyle = 'text-left'

  const updateEmojiReaction = async (emoji) => {
    const messageDoc = await db
      .collection('chats')
      .doc(chat_document)
      .collection('messages')
      .doc(message.id)
      .get()

    let temp = new Array()

    messageDoc.data().reactions.map((reactionObj, index) => {
      if (reactionObj.sender === userLoggedIn.email) {
        reactionObj.emoji = emoji
      }
      temp[index] = reactionObj

      if (index === messageDoc.data().reactions.length - 1) {
        db.collection('chats')
          .doc(chat_document)
          .collection('messages')
          .doc(message.id)
          .set(
            {
              reactions: temp,
            },
            { merge: true }
          )
        return
      }
    })

    db.collection('chats')
      .doc(chat_document)
      .collection('messages')
      .doc(message.id)
      .set(
        {
          reactions: arrayUnion({
            emoji: emoji,
            sender: userLoggedIn.email,
            senderPhotoURL: userLoggedIn.photoURL,
          }),
        },
        { merge: true }
      )
  }

  const EmojiReactionBar = () => {
    return (
      <div>
        {/* The overlay does not need the onClick function to close it because the parent element already have that function */}
        <div
          className={`${
            messageExpanded ? 'inline' : 'hidden'
          } fixed top-0 bottom-0 right-0 left-0 bg-black z-[1]`}
        ></div>
        <div
          className={`${
            messageExpanded ? 'inline-flex' : 'hidden'
          } flex items-center space-x-3 absolute -top-[35px] ${
            userLoggedIn.email === user ? '-right-3' : '-left-11'
          } z-[1] h-[50px] w-fit rounded-lg bg-white p-3`}
        >
          <span
            onClick={() => updateEmojiReaction('❤️')}
            className="text-[25px]"
          >
            ❤️
          </span>
          <span
            onClick={() => updateEmojiReaction('😠')}
            className="text-[25px]"
          >
            😠
          </span>
          <span
            onClick={() => updateEmojiReaction('😥')}
            className="text-[25px]"
          >
            😥
          </span>
          <span
            onClick={() => updateEmojiReaction('💩')}
            className="text-[25px]"
          >
            💩
          </span>
          <span
            onClick={() => updateEmojiReaction('🐕')}
            className="text-[25px]"
          >
            🐕
          </span>
          <span
            onClick={() => updateEmojiReaction('🖕🏻')}
            className="text-[25px]"
          >
            🖕🏻
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {message.type === 'text' ? (
        <p
          onClick={() => setMessageExpanded((prevValue) => !prevValue)}
          className={`${generalMessageStyle} ${
            userLoggedIn.email === user ? senderStyle : receiverStyle
          } relative`}
        >
          <EmojiReactionBar />
          {message.message}
          <span
            className={`${
              messageExpanded ? 'visible' : 'invisible'
            } text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0`}
          >
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </p>
      ) : message.type === 'sticker' ? (
        <div
          onClick={() => setMessageExpanded((prevValue) => !prevValue)}
          className={` ${generalMessageStyle} ${
            userLoggedIn.email === user ? imageStyle : receiverStickerStyle
          }`}
        >
          <EmojiReactionBar />
          <img
            src={getGifImage(message.message)}
            className="max-h-[150px] object-contain"
          />
          <span
            className={`${
              messageExpanded ? 'visible' : 'invisible'
            } text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0`}
          >
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </div>
      ) : message.type === 'emoji' ? (
        <p
          onClick={() => setMessageExpanded((prevValue) => !prevValue)}
          className={`${generalMessageStyle} text-[50px]`}
        >
          <EmojiReactionBar />
          {message.message}
          <span
            className={`${
              messageExpanded ? 'visible' : 'invisible'
            } text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0`}
          >
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </p>
      ) : (
        <div
          onClick={() => setMessageExpanded((prevValue) => !prevValue)}
          className={`${generalMessageStyle} p-0 ${
            userLoggedIn.email === user ? imageStyle : `${imageStyle} text-left`
          }`}
        >
          <EmojiReactionBar />
          <img className="max-h-[400px] object-contain" src={message.message} />
          <span
            className={`${
              messageExpanded ? 'visible' : 'invisible'
            } text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0`}
          >
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </div>
      )}
      {/* Reactions lists */}
      {message.reactions.length === 0 ? null : (
        <div
          onClick={() => {
            setMessageReactionBoxExpanded((prevValue) => !prevValue)
          }}
          className={`${
            messageReactionBoxExpanded ? 'h-[100px]' : 'h-6'
          } flex items-center p-1 min-w-0 bg-white rounded-lg absolute z-[10] -bottom-2 -right-2`}
        >
          {message.reactions.map((reaction) => reaction.emoji)}
        </div>
      )}
    </div>
  )
}

export default Message
