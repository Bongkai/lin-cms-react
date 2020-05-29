import React from 'react'
import { useSelector } from '@/store'

import './breadcrumb.scss'

export default function Breadcrumb() {
  const stageInfo = useSelector(state => state.app.currentRoute.treePath)
  const titleArr = stageInfo.map(item => item.title).filter(item => !!item)

  return (
    <div className='nav-title'>
      {titleArr.map(item => (
        <div className='item' key={item}>
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}
