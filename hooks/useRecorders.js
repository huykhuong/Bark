import { useState, useEffect } from 'react'
import { v4 } from 'uuid'
import toast from 'react-hot-toast'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

const initialState = {
  recordingMinutes: 0,
  recordingSeconds: 0,
  initRecording: false,
  mediaStream: null,
  mediaRecorder: null,
  audio: null,
}

async function startRecording(setRecorderState) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    setRecorderState((prevState) => {
      return {
        ...prevState,
        initRecording: true,
        mediaStream: stream,
      }
    })
  } catch (err) {
    console.log(err)
  }
}

function saveRecording(recorder) {
  if (recorder.state !== 'inactive') recorder.stop()
}

export default function useRecorder(sendMessage) {
  const [recorderState, setRecorderState] = useState(initialState)
  const [voiceFile, setVoiceFile] = useState('')

  // upload voice mp3 file function
  const uploadVoiceFile = () => {
    if (recorderState.audio === null) return
    if (!recorderState.audio === undefined) return
    const refreshToast = toast.loading('Uploading...')
    const voiceRef = ref(storage, `voices/${recorderState.audio + v4()}`)
    uploadBytes(voiceRef, recorderState.audio)
      .then((uploadResult) => {})
      .then(
        () => getDownloadURL(voiceRef).then((result) => setVoiceFile(result)),
        toast.success('Voice Message uploaded!', {
          id: refreshToast,
        })
      )
  }

  useEffect(() => {
    if (voiceFile === '') return

    sendMessage(event, 'voice', voiceFile)
    setVoiceFile('')
  }, [voiceFile])

  useEffect(() => {
    const MAX_RECORDER_TIME = 5
    let recordingInterval = null

    if (recorderState.initRecording)
      recordingInterval = setInterval(() => {
        setRecorderState((prevState) => {
          if (
            prevState.recordingMinutes === MAX_RECORDER_TIME &&
            prevState.recordingSeconds === 0
          ) {
            clearInterval(recordingInterval)
            return prevState
          }

          if (
            prevState.recordingSeconds >= 0 &&
            prevState.recordingSeconds < 59
          )
            return {
              ...prevState,
              recordingSeconds: prevState.recordingSeconds + 1,
            }

          if (prevState.recordingSeconds === 59)
            return {
              ...prevState,
              recordingMinutes: prevState.recordingMinutes + 1,
              recordingSeconds: 0,
            }
        })
      }, 1000)
    else clearInterval(recordingInterval)

    return () => clearInterval(recordingInterval)
  })

  useEffect(() => {
    if (recorderState.mediaStream)
      setRecorderState((prevState) => {
        return {
          ...prevState,
          mediaRecorder: new MediaRecorder(prevState.mediaStream),
        }
      })
  }, [recorderState.mediaStream])

  useEffect(() => {
    const recorder = recorderState.mediaRecorder
    let chunks = []

    if (recorder && recorder.state === 'inactive') {
      recorder.start()

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/x-wav' })
        chunks = []

        setRecorderState((prevState) => {
          if (prevState.mediaRecorder)
            return {
              ...initialState,
              audio: blob,
            }
          else return initialState
        })
      }
    }

    return () => {
      if (recorder)
        recorder.stream.getAudioTracks().forEach((track) => track.stop())
    }
  }, [recorderState.mediaRecorder])

  useEffect(() => {
    if (recorderState.audio) {
      console.log(recorderState.audio)
      uploadVoiceFile()
    }
  }, [recorderState.audio])

  return {
    recorderState,
    startRecording: () => startRecording(setRecorderState),
    cancelRecording: () => setRecorderState(initialState),
    saveRecording: () => saveRecording(recorderState.mediaRecorder),
  }
}
