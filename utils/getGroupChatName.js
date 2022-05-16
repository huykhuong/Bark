const getGroupChatName = (userLoggedIn) => {
  return users?.filter((user) => user !== userLoggedIn?.email)[0]
}

export default getGroupChatName
