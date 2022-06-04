import { doc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'
import { db } from '../firebase'
import dynamic from 'next/dynamic'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

const ChatProfileModal = ({
  openProfileModal,
  setOpenProfileModal,
  nickname,
  userEmail,
  emoji,
  chat,
}) => {
  const [input, setInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef(null)
  const router = useRouter()
  const docRef = doc(db, 'chats', router.query.id)

  const gradientThemes = [
    'bg-gradient-to-br from-green-300 via-blue-500 to-purple-600',
    'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400',
    'bg-gradient-to-br from-red-200 via-red-300 to-yellow-200',
    'bg-gradient-to-br from-indigo-200 via-red-200 to-yellow-100',
    'bg-gradient-to-tr from-sky-400 to-sky-200',
    'bg-gradient-to-tr from-blue-400 to-emerald-400',
    'bg-gradient-to-br from-orange-400 to-rose-400',
    'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500',
    'bg-gradient-to-bl from-fuchsia-600 to-pink-600',
  ]

  const solidTheme = ['bg-white', 'bg-gray-300', 'bg-blue-500', 'bg-red-500']

  // change theme function
  const changeTheme = (theme) => {
    updateDoc(docRef, {
      theme: theme,
    })
  }

  // Emoji Pick Function
  const emojiPick = (e, emojiObject) => {
    updateDoc(docRef, {
      emoji: emojiObject.emoji,
    })
    setShowEmojiPicker(false)
  }

  // update function
  const editNickname = (e) => {
    e.preventDefault()
    let temp = new Array()
    chat.nicknames.forEach((item, index) => {
      if (item.user === userEmail) {
        chat.nicknames[index].nickname = input
      }
      temp[index] = item
    })

    db.collection('chats').doc(chat.id).set(
      {
        chat_name: chat.chat_name,
        group_img_url: chat.group_img_url,
        nicknames: temp,
        type: chat.type,
        users: chat.users,
      },
      { merge: true }
    )

    setInput('')
  }

  return (
    <div
      // onClick={() => setShowEmojiPicker(false)}
      hidden={!openProfileModal}
      className="relative w-screen h-screen"
    >
      {/* overlay sections */}
      {/* overall overlay */}
      <div
        onClick={() => setOpenProfileModal(false)}
        className="absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70"
      ></div>
      {/* emoji picker overlay */}
      <div
        hidden={!showEmojiPicker ? true : false}
        onClick={() => setShowEmojiPicker(false)}
        className="fixed z-10 top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70"
      ></div>
      {/* emoji picker */}
      {showEmojiPicker && (
        <div className="w-[95%] fixed bottom-3 z-[11] left-1/2 -translate-x-1/2">
          <Picker pickerStyle={{ width: '100%' }} onEmojiClick={emojiPick} />
        </div>
      )}

      {/* modal box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[50vh] p-5 bg-white rounded-md text-center overflow-y-auto">
        <h2>
          Your fucking nickname in this group is{' '}
          <span className="font-bold">{nickname}</span>
        </h2>

        {/* Change nickname form */}
        <form
          className="flex items-center justify-center"
          onSubmit={editNickname}
        >
          <input
            ref={inputRef}
            placeholder="Change your nickname"
            className="mt-5 bg-gray-100 p-4"
            onChange={(e) => {
              setInput(e.target.value)
            }}
            value={input}
          />
          <button type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-6 ml-3 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </form>

        {/* Change color theme area */}
        <div className="mt-16 mx-auto w-[90%] h-auto">
          <h2 className="w-fit mb-6 font-medium">Gradient Theme</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {gradientThemes.map((theme, index) => (
              <div
                onClick={() => changeTheme(theme)}
                key={index}
                className={`${theme} h-12 w-12 rounded-full`}
              ></div>
            ))}
          </div>

          <h2 className="w-fit mt-10 mb-6 font-medium">Solid Theme</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {solidTheme.map((theme, index) => (
              <div
                onClick={() => changeTheme(theme)}
                key={index}
                className={`${theme} h-12 w-12 rounded-full border-2`}
              ></div>
            ))}
          </div>
        </div>

        {/* Change EMOJI area */}
        <div className="relative mt-10 mx-auto w-[90%] h-auto flex items-center space-x-10">
          <h2 className="w-fit font-medium">Emoji</h2>
          <p
            onClick={() => setShowEmojiPicker((value) => !value)}
            className="text-[30px]"
          >
            {emoji}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatProfileModal
