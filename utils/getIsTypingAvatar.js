export const getIsTypingAvatar = (allUsers, user) => {
  const photoUrl = ''
  JSON.parse(allUsers).map((u) => {
    if (u.email === user) {
      photoUrl = u.photoURL
    }
  })
  return photoUrl
}
