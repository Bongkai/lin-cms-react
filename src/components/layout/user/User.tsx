import React from 'react'
import { useAppSelector } from '@/store'
import { Dropdown } from 'antd'
import UserBox from './UserBox'

import './style/user.scss'
import defaultAvatar from '@/assets/img/user/user.png'

export default function User() {
  const { avatar } = useAppSelector().user

  return (
    <div className='user-container'>
      <Dropdown overlay={<UserBox />} placement='bottomRight'>
        <span className='dropdown-link'>
          <div className='nav-avatar'>
            <img src={avatar || defaultAvatar} alt='头像' />
          </div>
        </span>
      </Dropdown>
    </div>
  )
}
