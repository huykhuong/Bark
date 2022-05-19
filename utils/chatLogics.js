export const isSameSender = (messages, m, i, userLoggedIn) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].data().user !== m.data().user ||
      messages[i + 1].data().user === undefined) &&
    messages[i].data().user !== userLoggedIn
  )
}

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].data().user === m.data().user
}

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].data().user !== userId &&
    messages[messages.length - 1].data().user
  )
}

export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].data().user === m.data().user &&
    messages[i].data().user !== userId
  )
    return 40
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].data().user !== m.data().user &&
      messages[i].data().user !== userId) ||
    (i === messages.length - 1 && messages[i].data().user !== userId)
  )
    return 0
}

export const renderNickname = (nicknamesArray, sender_username) => {
  let nickname = ''
  nicknamesArray.forEach((object, index) => {
    if (object.user === sender_username && object.nickname !== '') {
      nickname = object.nickname
    } else if (object.user === sender_username && object.nickname === '')
      nickname = object.user
  })
  return nickname
}
