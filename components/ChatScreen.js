import React, { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, storage } from '../firebase'
import { useRouter } from 'next/router'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import MenuIcon from '@material-ui/icons/Menu'
import ImageIcon from '@material-ui/icons/Image'
import { useCollection } from 'react-firebase-hooks/firestore'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'
import LabelIcon from '@material-ui/icons/Label'
import Message from './Message'
import { documentId, FieldPath, serverTimestamp } from 'firebase/firestore'
import getRecipientEmail from '../utils/getRecipientEmail'
import { Avatar } from '@material-ui/core'
import TimeAgo from 'timeago-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  renderNickname,
} from '../utils/chatLogics'
import dynamic from 'next/dynamic'
import { v4 } from 'uuid'
import toast from 'react-hot-toast'
import ChatProfileModal from './ChatProfileModal'
import { renderThemeBackground } from '../utils/renderThemeBackground'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const ChatScreen = ({ messages, chat, setOpenSideBar, openSideBar }) => {
  const [firstTimeImage, setFirstTimeImage] = useState(true)
  const [firstTimeSticker, setFirstTimeSticker] = useState(true)

  const [user] = useAuthState(auth)

  const imageUploadRef = useRef()
  const endOfMessageRef = useRef()

  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imageURL, setImageURL] = useState('')
  const [openStickersArea, setOpenStickersArea] = useState(false)
  const [sticker, setSticker] = useState('')
  const [openProfileModal, setOpenProfileModal] = useState(false)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const router = useRouter()
  const [messagesSnapshot] = useCollection(
    db
      .collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .orderBy('timestamp', 'asc')
  )

  //Chat snapshot to oversee the change in theme color
  const chatRef = db
    .collection('chats')
    .where(documentId(), '==', router.query.id)
  const [chatsSnapshot] = useCollection(chatRef)

  const nicknamesArray = chat.nicknames
  const bark_audio = new Audio('/bark_SFX.wav')

  const triggerBarkSound = () => {
    bark_audio.play()
  }

  // uploadImage function
  const uploadImage = () => {
    if (image === null) return
    if (!image.name === undefined) return
    const refreshToast = toast.loading('Uploading...')
    const imageRef = ref(storage, `images/${image.name + v4()}`)
    uploadBytes(imageRef, image)
      .then((uploadResult) => {})
      .then(
        () => getDownloadURL(imageRef).then((result) => setImageURL(result)),
        toast.success('Photo uploaded!', {
          id: refreshToast,
        })
      )
  }

  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [router.asPath])

  // //useEffect to upload the image
  // useEffect(() => {
  //   uploadImage()
  // }, [image])

  // //useEffect to upload the image
  // useEffect(() => {
  //   if (firstTimeImage) {
  //     setFirstTimeImage(false)
  //     return
  //   }
  //   sendMessage(event, 'image')
  // }, [imageURL])

  // //useEffect to upload the sticker
  // useEffect(() => {
  //   if (firstTimeSticker) {
  //     setFirstTimeSticker(false)
  //     return
  //   }
  //   sendMessage(event, 'sticker')
  // }, [sticker])

  //send message function
  const sendMessage = (e, type) => {
    e.preventDefault()

    db.collection('users').doc(user.uid).set(
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    )

    db.collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .add({
        timestamp: serverTimestamp(),
        message:
          type === 'text' ? input : type === 'sticker' ? sticker : imageURL,
        user: user.email,
        photoURL: user.photoURL,
        type: type,
      })
    triggerBarkSound()
    setInput('')
    scrollToBottom()
  }

  // recipient snapshot
  const [recipientSnapshot] = useCollection(
    db
      .collection('users')
      .where('email', '==', getRecipientEmail(chat.users, user))
  )

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message, index) => (
        <div className={`flex items-end`} key={message.id}>
          {(isSameSender(messagesSnapshot.docs, message, index, user.email) ||
            isLastMessage(messagesSnapshot.docs, index, user.email)) && (
            <Avatar src={message.data().photoURL}></Avatar>
          )}
          <div
            style={{
              marginLeft: isSameSenderMargin(
                messagesSnapshot.docs,
                message,
                index,
                user.email
              ),
              marginTop: isSameUser(
                messagesSnapshot.docs,
                message,
                index,
                user.email
              )
                ? 0
                : 60,
            }}
            className={`${user.email === message.data().user && 'ml-auto'}`}
          >
            {!isSameUser(messagesSnapshot.docs, message, index, user.email) &&
              message.data().user !== user.email &&
              chat.type === 'group' && (
                <p className="ml-[12px] text-sm text-gray-600">
                  {renderNickname(nicknamesArray, message.data().user)}
                </p>
              )}
            <Message
              key={message.id}
              user={message.data().user}
              chat_theme={chatsSnapshot?.docs?.[0]?.data().theme}
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

  // Emoji Pick Function
  const emojiPick = (e, emojiObject) => {
    setInput((prevValue) => prevValue + emojiObject.emoji)
  }

  const recipient = recipientSnapshot?.docs?.[0]?.data()
  const recipientEmail = getRecipientEmail(chat.users, user)

  return (
    <div
      style={{
        backgroundImage: `url(/${renderThemeBackground(
          chatsSnapshot?.docs?.[0]?.data().theme
        )})`,
      }}
      className="relative overflow-hidden scrollbar-hide h-screen bg-no-repeat bg-center bg-cover"
    >
      <div
        className={`${
          openProfileModal ? 'inline' : 'hidden'
        } fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30`}
      >
        <ChatProfileModal
          openProfileModal={openProfileModal}
          setOpenProfileModal={setOpenProfileModal}
          nickname={renderNickname(nicknamesArray, user.email)}
          userEmail={user.email}
          chat={chat}
        />
      </div>

      <div
        className={`${
          chatsSnapshot ? chatsSnapshot?.docs?.[0]?.data().theme : 'bg-gray-100'
        } fixed w-full z-10 0 top-0 flex px-[20px] h-[80px] items-center lg:p-[11px] lg:justify-start`}
      >
        <div className="lg:hidden">
          <MenuIcon
            className="cursor-pointer"
            onClick={() => {
              setOpenSideBar(!openSideBar)
            }}
          />
        </div>

        <div className="flex mx-auto lg:flex-1 lg:mx-0">
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
        </div>

        <div
          className=""
          onClick={() => setOpenProfileModal((prevValue) => !prevValue)}
        >
          <MoreVertIcon />
        </div>
      </div>

      <div className="p-[30px] overflow-scroll scrollbar-hide h-screen">
        {showMessages()}
        {/* End of message */}
        <div className="mb-[130px]" ref={endOfMessageRef}></div>
      </div>

      {/* Send message box */}
      {showEmojiPicker && (
        <Picker
          pickerStyle={{ width: '40%', position: 'fixed', bottom: 80 }}
          onEmojiClick={emojiPick}
        />
      )}

      <div
        className={`flex h-[100px] bg-gray-100 w-full overflow-x-auto fixed bottom-[64px] ${
          openStickersArea ? 'inline-flex' : 'hidden'
        }`}
      >
        {[...Array(9)].map((e, i) => (
          <img
            src={`/mimi${i + 1}.gif`}
            className="max-w-[150px] cursor-pointer"
            key={i}
            onClick={() => setSticker(`mimi${i + 1}`)}
          />
        ))}
      </div>

      <div
        className={`fixed bottom-0 ${
          chatsSnapshot ? chatsSnapshot?.docs?.[0]?.data().theme : 'bg-white'
        } `}
      >
        <form className=" w-screen flex items-center p-[10px] z-100 lg:w-[calc(100vw-388.625px)]">
          <InsertEmoticonIcon
            className="cursor-pointer mr-3"
            onClick={() => setShowEmojiPicker((value) => !value)}
          />
          <ImageIcon
            className="cursor-pointer mr-3"
            onClick={() => imageUploadRef.current.click()}
          />
          <input
            hidden
            ref={imageUploadRef}
            accept="image/*"
            type="file"
            onChange={(event) => {
              setImage(event.target.files[0])
            }}
          />
          <LabelIcon
            className="h-6 w-6 cursor-pointer"
            onClick={() => setOpenStickersArea((prevValue) => !prevValue)}
          />
          <input
            className="flex-1 items-center p-[10px] sticky bg-white z-100 mx-[15px]"
            value={input}
            placeholder="Bark here"
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            hidden
            disabled={!input}
            type="submit"
            onClick={(e) => sendMessage(event, 'text')}
          >
            Send message
          </button>
          <MicIcon />
        </form>
      </div>
    </div>
  )
}

export default ChatScreen
