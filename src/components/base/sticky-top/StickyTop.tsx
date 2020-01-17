import React, { ReactElement, CSSProperties } from 'react'

import './sticky-top.scss'

interface IStickyTop {
  height?: string | number
  children?: ReactElement | ReactElement[]
}

export default function StickyTop({ children, height = 'auto' }: IStickyTop) {
  const styles: CSSProperties = {
    height,
  }

  return (
    <div className='sticky-top-container' style={styles}>
      {children}
    </div>
  )
}
