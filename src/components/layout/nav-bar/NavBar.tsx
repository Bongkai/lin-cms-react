import React, { memo } from 'react'
import Breadcrumb from '../breadcrumb/Breadcrumb'
import ClearTab from '../clear-tab/ClearTab'
import Screenfull from '../screenfull/Screenfull'
import Notify from '@/components/layout/notify/Notify'
import User from '../user/User'

import './nav-bar.scss'

export default memo(function NavBar() {
  console.log('$NavBar')
  return (
    <div className='nav-bar-container'>
      <div className='nav-content'>
        <Breadcrumb />
        <div className='right-info'>
          <Notify />
          <ClearTab />
          <Screenfull />
          <User />
        </div>
      </div>
    </div>
  )
})
