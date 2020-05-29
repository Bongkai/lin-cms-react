import React from 'react'
import { useSelector } from '@/store'
import { Dropdown } from 'antd'
import UserBox from './UserBox'

import './style/user.scss'
import defaultAvatar from '@/assets/img/user/user.png'

export default function User() {
  const avatar = useSelector(state => state.app.user.avatar) || defaultAvatar

  return (
    <div className='user-container'>
      <Dropdown overlay={<UserBox />} placement='bottomRight'>
        <span className='dropdown-link'>
          <div className='nav-avatar'>
            <img src={avatar} alt='头像' />
          </div>
        </span>
      </Dropdown>
    </div>
  )
}
