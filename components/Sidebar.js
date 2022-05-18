import { Avatar, IconButton, Button } from '@material-ui/core'
import ChatIcon from '@material-ui/icons/Chat'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import SearchIcon from '@material-ui/icons/Search'
import { useAuthState } from 'react-firebase-hooks/auth'
import * as EmailValidator from 'email-validator'
import { useCollection } from 'react-firebase-hooks/firestore'
import { auth, db } from '../firebase'
import Chat from './Chat'
import { useState } from 'react'
import getRecipientEmail from '../utils/getRecipientEmail'

const sidebar = () => {
  const [user] = useAuthState(auth)
  const [searchInput, setSearchInput] = useState('')
  const chatRef = db
    .collection('chats')
    .where('users', 'array-contains', user?.email)
  const [chatsSnapshot] = useCollection(chatRef)

  const styles = {
    brand: 'text-2xl p-[15px]',
    header:
      'flex sticky top-0 bg-white justify-between items-center z-1 p-[15px] h-[80px] border-b-[1px] border-b-whitesmoke',
    avatar: 'cursor-pointer hover:opacity-80',
    search: 'flex rounded-[2px] p-10 pl-[15px] items-center space-x-5 mb-10',
  }

  const createChat = () => {
    const input = prompt(
      'Please enter an email address for the user you wish to chat with'
    )
    if (!input) return null

    if (
      EmailValidator.validate(input) &&
      input !== user.email &&
      !chatAlreadyExists(input)
    ) {
      db.collection('chats').add({
        users: [user.email, input],
        type: 'DM',
      })
    }
  }

  const createGroupChat = () => {
    const input = prompt(
      'Please enter the email addresses you want to chat with, please separate each email with a comma'
    )
    const chat_name = prompt('Please enter a chat name')
    if (!input) return null
    if (!chat_name) return null

    if (!input.includes(user.email)) {
      const modifiedArray = input.split(' ').join('')
      const userArray = modifiedArray.split(',')
      userArray.push(user.email)
      db.collection('chats').add({
        users: userArray,
        chat_name: chat_name,
      })
    }
  }

  const chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0 &&
        chat.type === 'DM'
    )

  return (
    <div className="max-h-screen overflow-scroll scrollbar-hide">
      <div className="flex items-center align-middle mb-[50px] p-5">
        <img className="h-[50px] w-[50px]" src="/bark.svg" />
        <h1 className={styles.brand}>Bark</h1>
      </div>

      <div className={styles.header}>
        <Avatar
          src={user.photoURL}
          onClick={() => auth.signOut()}
          className={styles.avatar}
        />
        <div className={styles.iconsContainer}>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>

      <div className={styles.search}>
        <SearchIcon />
        <input
          className="outline-none border-none flex-1"
          placeholder="Search in chats"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex mb-10">
        <Button onClick={createChat} className="text-white basis-1/2">
          Start a new bark
        </Button>
        <Button onClick={createGroupChat} className="basis-1/2">
          Start a new bark group
        </Button>
      </div>

      {chatsSnapshot?.docs
        .filter((chat) => {
          if (searchInput === '') {
            return chat
          } else if (
            getRecipientEmail(chat.data().users, user)
              .toLowerCase()
              .includes(searchInput.toLowerCase())
          ) {
            return chat
          }
        })
        .map((chat) => {
          return (
            <Chat
              key={chat.id}
              id={chat.id}
              users={chat.data().users}
              chat_name={
                chat.data().type === 'group' ? chat.data().chat_name : ''
              }
              chat_img_url={
                chat.data().type === 'group' ? chat.data().group_img_url : ''
              }
            />
          )
        })}
    </div>
  )
}

export default sidebar
