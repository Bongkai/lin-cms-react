import React from 'react'
import * as Icons from './Icons'

export default function DynamicIcon({ type, ...props }) {
  const TargetIcon = Icons[type]
  return type && TargetIcon && <TargetIcon {...props} />
}
