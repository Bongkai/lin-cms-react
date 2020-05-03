import React from 'react'
import LinHeader from '@/components/base/lin-header/LinHeader'
import UserInfo from './UserInfo'

import './style/user-add.scss'

export default function UserAdd() {
  return (
    <div className='user-add-container'>
      <LinHeader title='新建用户' />
      <div className='content'>
        <UserInfo pageType='add' />
      </div>
    </div>
  )
}
