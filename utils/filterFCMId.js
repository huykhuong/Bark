const filterFCMId = (registration_ids, senderFCMId) => {
  return registration_ids?.filter((id) => id !== senderFCMId)
}

export default filterFCMId
