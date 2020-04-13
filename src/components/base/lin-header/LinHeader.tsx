import React, { ReactElement, CSSProperties } from 'react'

import './lin-header.scss'

interface ILinHeader {
  title?: string
  divider?: boolean
  style?: CSSProperties
  children?: ReactElement | ReactElement[]
}

export default function LinHeader({
  title,
  style,
  children,
  divider = true,
}: ILinHeader) {
  return (
    <div
      style={style}
      className={`lin-header ${divider ? 'header-with-divider' : ''}`}
    >
      <div>{title}</div>
      {children && <div>{children}</div>}
    </div>
  )
}
