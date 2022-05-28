import React from 'react'

const ChatProfileModal = ({
  openProfileModal,
  setOpenProfileModal,
  nickname,
}) => {
  return (
    <div hidden={!openProfileModal} className="relative w-screen h-screen">
      <div
        onClick={() => setOpenProfileModal(false)}
        className="absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70"
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[50vh] p-5 bg-white rounded-md text-center">
        <h2>
          You fucking nickname in this group is{' '}
          <span className="font-bold">{nickname}</span>
        </h2>
      </div>
    </div>
  )
}

export default ChatProfileModal
