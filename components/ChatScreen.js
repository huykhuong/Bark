import React, { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, storage } from '../firebase'
import { useRouter } from 'next/router'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ImageIcon from '@material-ui/icons/Image'
import { useCollection } from 'react-firebase-hooks/firestore'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import MicIcon from '@material-ui/icons/Mic'
import Message from './Message'
import { serverTimestamp } from 'firebase/firestore'
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
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

let firstTime = true

const ChatScreen = ({ messages, chat }) => {
  const [user] = useAuthState(auth)

  const imageUploadRef = useRef()
  const endOfMessageRef = useRef()

  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imageURL, setImageURL] = useState('')

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const router = useRouter()
  const [messagesSnapshot] = useCollection(
    db
      .collection('chats')
      .doc(router.query.id)
      .collection('messages')
      .orderBy('timestamp', 'asc')
  )
  const nicknamesArray = chat.nicknames
  const bark_audio = new Audio('/bark_SFX.wav')

  const triggerBarkSound = () => {
    bark_audio.play()
  }

  // uploadImage function
  const uploadImage = () => {
    if (image === null) return
    if (image.name === undefined) return
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

  useEffect(() => {
    scrollToBottom()
  }, [router.asPath])

  //useEffect to upload the image
  useEffect(() => {
    uploadImage()
  }, [image])

  //useEffect to upload the image
  useEffect(() => {
    if (firstTime) {
      firstTime = false
      return
    }
    sendMessage(event, 'image')
  }, [imageURL])

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
        message: type === 'text' ? input : imageURL,
        user: user.email,
        photoURL: user.photoURL,
        type: type,
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

  // Emoji Pick Function
  const emojiPick = (e, emojiObject) => {
    setInput((prevValue) => prevValue + emojiObject.emoji)
  }

  const recipient = recipientSnapshot?.docs?.[0]?.data()
  const recipientEmail = getRecipientEmail(chat.users, user)

  return (
    <div className="scrollbar-hide">
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
        </div>
      </div>

      <div className="p-[30px] ">
        {showMessages()}
        {/* End of message */}
        <div className="mb-[50px]" ref={endOfMessageRef}></div>
      </div>

      {/* Send message box */}
      {showEmojiPicker && (
        <Picker
          pickerStyle={{ width: '40%', position: 'fixed', bottom: 80 }}
          onEmojiClick={emojiPick}
        />
      )}
      <form className="flex items-center w-[calc(100vw-388.625px)] p-[10px] fixed bottom-0 bg-white z-100">
        <InsertEmoticonIcon
          className="cursor-pointer mr-3"
          onClick={() => setShowEmojiPicker((value) => !value)}
        />
        <ImageIcon
          className="cursor-pointer"
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
  )
}

export default ChatScreen
