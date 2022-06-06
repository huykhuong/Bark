import React, { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import moment from 'moment'
import { auth, db, storage } from '../firebase'
import { useRouter } from 'next/router'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import MenuIcon from '@material-ui/icons/Menu'
import ImageIcon from '@material-ui/icons/Image'
import SendIcon from '@material-ui/icons/Send'
import { useCollection } from 'react-firebase-hooks/firestore'
import localforage from 'localforage'
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
import filterFCMId from '../utils/filterFCMId'
import { compareTime } from '../utils/compareDates'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const ChatScreen = ({ messages, chat, setOpenSideBar, openSideBar }) => {
  const [user] = useAuthState(auth)

  const imageUploadRef = useRef()
  const endOfMessageRef = useRef()

  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imageURL, setImageURL] = useState('')
  const [openStickersArea, setOpenStickersArea] = useState(false)
  const [sticker, setSticker] = useState('')
  const [emoji, setEmoji] = useState('')
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const FCMIds = [
    'c9VnvBsMcq0hrml_WLRd0a:APA91bHODMM1bYg_0u48E2zpbV1bV-OgzX2-e51ewtNsYkmkv6NM8b0zBdgOThP07DeL-tM4M9KUd2ecohtm4Z1SkWGok-OnysgQd1w4y6XCoOSR0mJGXc-9D6oU2svp_njAZOJjcxY-',
    'c0G5E4l5HunToNLdRy9KUH:APA91bEAgfEP_Xfu3w4dSeBaoZY4M4FyUOPob33ZUsts3EfzpqiV3eT-dIDkswYO7dNdBlG8jaJ-_MIU9vXN3xAE668JIwdHHb2fSxyif52D8MY0TJKYfA9frAw2pPd3Vr8TgOCMZlvR',
    'cebegEUq3nFUFZTLjUXvwA:APA91bGB24fCiL3nbcejov4B4XsGTgxBUUXRhRr31nk4hODVDGVIVWeZ75EDLNnZHxBYUAkfAaU6IL-sSpHLxuORZJMNLyDQ2yZRTwBmcxo2GJ9rHMrMWNRvTwoAMTWRib9O2CqR2wfX',
    'etjL9vC_NL4_jME6Cl67Eo:APA91bFv4l_897gAmYzz2YXM8Ia1eiu7GZO0WhmApN9r_xjWSAg-V0KcG1dECainCsDx8K49FgBa0OnkMerCNqj0mSGUSW7nrXB-0MvNo3VJSdRrdOBwxZQ4iOSiFXzyt4YfipM3yaPW',
    'eyDCciwSEF6c1TBT1uesxa:APA91bFUFtRn-NxXZACYTlf-E1OG7LZeQaMfgkS6iwaYvMHujQgp_z3dTCYhgrnGX7pPOw7Mm8aqnO5egO4ik3MFJ0tcEeLwyrlWP_6TTxRBLUGEO27H83n9MWdtvp0h2hZd85uO1FQS',
    'dcN8Ii0J6nLv5_gFJXWAhC:APA91bF4XWEHN-cyf-FdwfQYeGjkmutaf041xW3pBW5oof0o1CqMKhzzDi8Q_jroA5y1xOqZqEfFauCG4Q4jVWy_khoIDS68RkjiDTelk0dzdSj2zl6o6MNAhWyi97zS0PgX1FcKlYmf',
  ]

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
    endOfMessageRef.current.scrollIntoView({})
  }

  useEffect(() => {
    scrollToBottom()
  }, [router.asPath])

  //useEffect to upload the image
  useEffect(() => {
    if (image === null) return

    uploadImage()
  }, [image])

  //useEffect to upload the image
  useEffect(() => {
    if (imageURL === '') return

    sendMessage(event, 'image')
    setImage(null)
    setImageURL('')
  }, [imageURL])

  //useEffect to upload the sticker
  useEffect(() => {
    if (sticker === '') return

    sendMessage(event, 'sticker')
    setSticker('')
  }, [sticker])

  //useEffect to upload EMOJI
  useEffect(() => {
    if (emoji === '') return
    sendMessage(event, 'emoji')

    setEmoji('')
  }, [emoji])

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
          type === 'text'
            ? input
            : type === 'sticker'
            ? sticker
            : type === 'emoji'
            ? emoji
            : imageURL,
        user: user.email,
        photoURL: user.photoURL,
        type: type,
      })

    if (user) {
      ;(async () => {
        const rawResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            Authorization:
              'key=AAAA7vd6DQ0:APA91bEtr_y72o20kjVpbnOjCojPrFc_UQo-zGnBm4qlxchXpaXYf4ZQKbrKBUhsTxTIF15m1VfYZQGnlesr5fkkzxi4qUgs_firc3j03iYZBeTkpU8JiWBIRBlYldhOJiAQMYYWsyPm',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification: {
              title: 'Bark',
              body: `${renderNickname(nicknamesArray, user.email)}: ${input}`,
              icon: '/favicon.ico',
            },

            registration_ids: filterFCMId(
              FCMIds,
              await localforage.getItem('fcm_token')
            ),
            priority: 'high',
            click_action: `https://bark-eight.vercel.app/chat/${chat.id}`,
          }),
        })

        // const content = await rawResponse.json();
        // console.log(content);
      })()
    }

    triggerBarkSound()
    setInput('')
    setEmoji('')
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
      scrollToBottom()
      return messagesSnapshot.docs.map((message, index) => (
        <>
          {!(index === 0) &&
          compareTime(
            new Date(message.data().timestamp?.toDate()),
            new Date(
              messagesSnapshot?.docs?.[index - 1].data().timestamp?.toDate()
            )
          ) > 40 &&
          message.data().type !== 'event' ? (
            <p className="mt-[60px] text-gray-300 max-w-[92%] text-center mx-auto">
              {moment(message.data().timestamp?.toDate()) ===
                moment(new Date()) &&
                moment(message.data().timestamp?.toDate()).calendar()}
            </p>
          ) : (
            ''
          )}
          {message.data().type === 'event' ? (
            <div
              key={message.id}
              className="mt-[60px] text-gray-300 max-w-[92%] text-center mx-auto"
            >
              {message.data().message.includes('gradient') ? (
                <div>
                  {message.data().nickname} changed the group theme to
                  <div
                    className={`ml-2 inline-block align-bottom rounded-full h-7 w-7 ${
                      message.data().message
                    }`}
                  ></div>
                </div>
              ) : (
                message.data().message
              )}
            </div>
          ) : (
            <div className={`flex items-end`} key={message.id}>
              {(isSameSender(
                messagesSnapshot.docs,
                message,
                index,
                user.email
              ) ||
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
                {!isSameUser(
                  messagesSnapshot.docs,
                  message,
                  index,
                  user.email
                ) &&
                  message.data().user !== user.email &&
                  chat.type === 'group' && (
                    <p className="ml-[12px] text-sm text-gray-300">
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
          )}
        </>
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

  const emojiRef = useRef(null)

  return (
    <div
      style={{
        backgroundImage: `url(/${renderThemeBackground(
          chatsSnapshot?.docs?.[0]?.data().theme
        )})`,
        // backgroundSize: 'auto auto',
      }}
      className="relative overflow-hidden scrollbar-hide bg-no-repeat bg-center bg-cover"
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
          userPhotoURL={user.photoURL}
          emoji={chatsSnapshot?.docs?.[0]?.data().emoji}
          chat={chat}
          scrollToBottom={scrollToBottom}
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
        <div className="mt-[150px]" ref={endOfMessageRef}></div>
      </div>

      {/* Send message box */}
      {showEmojiPicker && (
        <Picker
          pickerStyle={{ width: '70%', position: 'fixed', bottom: 80 }}
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
        <form className="w-screen flex items-center p-[10px] z-100 lg:w-[calc(100vw-388.625px)]">
          {/* <InsertEmoticonIcon
            className="cursor-pointer mr-3"
            onClick={() => setShowEmojiPicker((value) => !value)}
          /> */}
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
            hidden={!input ? true : false}
            disabled={!input}
            type="submit"
            onClick={(e) => sendMessage(event, 'text')}
          >
            <SendIcon />
          </button>

          <input
            value={`${chatsSnapshot?.docs?.[0]?.data().emoji}`}
            hidden={input ? true : false}
            className="p-0 w-9 bg-transparent text-[24px]"
            ref={emojiRef}
            onClick={(e) => setEmoji(e.target.value)}
          ></input>

          {/* <MicIcon /> */}
        </form>
      </div>
    </div>
  )
}

export default ChatScreen
