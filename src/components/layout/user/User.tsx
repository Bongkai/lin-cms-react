import React from 'react'
import { useSelector } from 'react-redux'
import { Dropdown } from 'antd'
import UserBox from './UserBox'

import { IStoreState } from '@/types/store'

import './style/user.scss'
import defaultAvatar from '@/assets/img/user/user.png'

export default function User() {
  const avatar = useSelector<IStoreState, string | null>(
    state => state.app.user.avatar,
  )

  return (
    <div className='user-container'>
      <Dropdown
        overlay={<UserBox />}
        placement='bottomRight'
        overlayStyle={{ zIndex: 800 }} // 在点击进入需要开启 Modal 的功能模块时不遮挡 Modal
      >
        <span className='dropdown-link'>
          <div className='nav-avatar'>
            <img src={avatar || defaultAvatar} alt='头像' />
          </div>
        </span>
      </Dropdown>
    </div>
  )
}
