import React, { useRef, useState } from 'react'
import { db } from '../firebase'

const ChatProfileModal = ({
  openProfileModal,
  setOpenProfileModal,
  nickname,
  userEmail,
  chat,
}) => {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  // const nicknameRef = db
  //   .collection('chats')
  //   .where('nicknames', 'array-contains', {
  //     nickname: nickname === userEmail ? '' : nickname,
  //     user: userEmail,
  //   })

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

    inputRef.current.value = ''
  }

  return (
    <div hidden={!openProfileModal} className="relative w-screen h-screen">
      {/* overlay */}
      <div
        onClick={() => setOpenProfileModal(false)}
        className="absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70"
      ></div>

      {/* modal box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[50vh] p-5 bg-white rounded-md text-center">
        <h2>
          Your fucking nickname in this group is{' '}
          <span className="font-bold">{nickname}</span>
        </h2>

        <form
          className="flex items-center justify-center"
          onSubmit={editNickname}
        >
          <input
            ref={inputRef}
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
      </div>
    </div>
  )
}

export default ChatProfileModal
