import { Avatar } from '@material-ui/core'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import moment from 'moment'
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase'
import { renderNickname } from '../utils/chatLogics'
import { getGifImage } from '../utils/getGifImage'

const Message = ({
  user,
  message,
  chat_document,
  chat_theme,
  nicknamesArray,
}) => {
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

  //Remove reaction function
  const removeReaction = (emoji, sender) => {
    if (userLoggedIn.email !== sender) {
      return
    } else {
      db.collection('chats')
        .doc(chat_document)
        .collection('messages')
        .doc(message.id)
        .set(
          {
            reactions: arrayRemove({
              emoji: emoji,
              sender: userLoggedIn.email,
              senderPhotoURL: userLoggedIn.photoURL,
            }),
          },
          { merge: true }
        )
    }
  }

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
          } fixed top-0 bottom-0 right-0 left-0 bg-transparent z-[2]`}
        ></div>
        <div
          className={`${
            messageExpanded ? 'inline-flex' : 'hidden'
          } flex items-center space-x-3 absolute -top-[35px] ${
            userLoggedIn.email === user ? '-right-3' : '-left-11'
          } z-[3] h-[50px] w-fit rounded-lg bg-white p-3`}
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
      ) : message.type === 'voice' ? (
        <audio
          controls="controls"
          onClick={() => setMessageExpanded((prevValue) => !prevValue)}
          src={message.message}
          className="mt-10"
        >
          <EmojiReactionBar />
          <span
            className={`${
              messageExpanded ? 'visible' : 'invisible'
            } text-gray opacity-70 p-[10px] text-[9px] absolute bottom-0 text-right right-0`}
          >
            {message.timestamp ? moment(message.timestamp).calendar() : ''}
          </span>
        </audio>
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
          className={`flex items-center h-6 p-1 min-w-0 bg-white rounded-lg absolute z-[1] -bottom-2 ${
            userLoggedIn.email === user ? '-right-2' : 'left-2'
          } `}
        >
          {message.reactions.map((reaction) => reaction.emoji)}
        </div>
      )}

      {/* Reactions detail box  */}
      {messageReactionBoxExpanded ? (
        <>
          <div
            onClick={() => setMessageReactionBoxExpanded(false)}
            className="fixed h-screen w-screen left-0 top-0 bg-black bg-opacity-50 z-[90]"
          ></div>
          <div
            className={`fixed bottom-0 left-0 h-1/3 w-screen bg-white p-7 z-[100] rounded-t-2xl overflow-y-auto`}
          >
            {message.reactions.length === 0
              ? null
              : message.reactions.map((reaction, index) => (
                  // Start of reaction detail list tile
                  <div
                    key={index}
                    onClick={() =>
                      removeReaction(reaction.emoji, reaction.sender)
                    }
                    className="flex items-center mb-5"
                  >
                    <div className="flex-1 flex items-center gap-x-5">
                      <Avatar src={reaction.senderPhotoURL}></Avatar>
                      <div>
                        <p>{renderNickname(nicknamesArray, reaction.sender)}</p>
                        {userLoggedIn.email === reaction.sender && (
                          <p className="italic text-[13px]">
                            Tap to remove your reaction
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-[20px]">{reaction.emoji}</div>
                  </div>
                ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Message
