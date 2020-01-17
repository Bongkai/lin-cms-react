import React, { useEffect, useRef, ReactElement } from 'react'
import OriginSwiper from 'swiper/js/swiper'

import 'swiper/css/swiper.min.css'
import './swiper.scss'

interface ISwiper {
  parameters: any
  children?: ReactElement | ReactElement[]
}

export default function Swiper({ parameters, children }: ISwiper) {
  const swiper = useRef<any>()

  useEffect(() => {
    new OriginSwiper(swiper.current, parameters)
  })

  return (
    <div className='swiper-container' ref={swiper}>
      <div className='swiper-wrapper'>{children}</div>
    </div>
  )
}
