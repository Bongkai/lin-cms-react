import React, { useState, useEffect } from 'react'
import { Icon, message } from 'antd'
import screenfull, { Screenfull as IScreenfull } from 'screenfull'

import './screenfull.scss'

export default function Screenfull() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function change() {
      setIsFullscreen((screenfull as IScreenfull).isFullscreen)
    }
    screenfull.isEnabled && screenfull.on('change', change)
    return () => {
      screenfull.isEnabled && screenfull.off('change', change)
    }
  }, [])

  function handleFullScreen() {
    if (!screenfull.isEnabled) {
      message.warning('you browser can not work')
      return false
    }
    screenfull.toggle()
  }

  return (
    <div className='screenfull-container' title='全屏/正常'>
      <Icon
        type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
        className='screenfull-icon'
        onClick={handleFullScreen}
      />
    </div>
  )
}
