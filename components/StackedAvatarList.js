import React from 'react'
import { Avatar } from '@material-ui/core'

const DEFAULT_MAX_AVATARS = 5

function renderRemaining(props) {
  const {
    avatars = [],
    maxAvatars = DEFAULT_MAX_AVATARS,
    width,
    height,
    ...other
  } = props
  const remaining = avatars.length - maxAvatars

  if (remaining < 1) return null

  return <Avatar {...other} value={`+${remaining}`} color="gray" />
}

export default function StackedAvatar(props) {
  const { avatars = [], maxAvatars = DEFAULT_MAX_AVATARS, ...others } = props

  const style = {
    // border: '2px solid white',
    ...props.style,
    marginLeft: -(props.size / 2.5) + 'px',
    width: props.width,
    height: props.height,
  }

  return (
    <div style={{ display: 'flex', marginLeft: props.size / 2.5 }}>
      {avatars.slice(0, maxAvatars).map((avatar, idx) => (
        <div className={`${avatar === '' && 'hidden'}`}>
          <Avatar src={avatar} {...others} key={idx} style={style} />
        </div>
      ))}
      {renderRemaining({ ...props, style })}
    </div>
  )
}
