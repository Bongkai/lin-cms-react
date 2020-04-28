import React, { useState } from 'react'
import { useAppSelector, useDispatch } from '@/hooks/project/useRedux'
import { useHistory } from 'react-router-dom'
import { Input, message } from 'antd'
import { SolutionOutlined, LogoutOutlined } from '@ant-design/icons'
import { put } from '@/lin/plugins/axios'
import UserModal from '@/lin/models/user'
import Avatar from './Avatar'
import { loginOut, setUserAndState } from '@/store/actions/app.actions'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IUserType } from '@/types/store'
import { IResponseWithoutData } from '@/types/model'

import './style/user-box.scss'
import cornerImg from '@/assets/img/user/corner.png'

export default function UserBox() {
  const [nicknameEditing, setNicknameEditing] = useState(false)
  const nickname = useAppSelector().user.nickname || '佚名'
  const dispatch = useDispatch()
  const history = useHistory()

  function onNicknameClick() {
    changeNicknameEditing()
  }

  function onNicknameBlur(ev: any) {
    const value: string = ev.target.value
    if (value && value !== nickname) {
      submitNickname(value)
    }
    changeNicknameEditing()
  }

  function changeNicknameEditing() {
    setNicknameEditing(nicknameEditing => !nicknameEditing)
  }

  function submitNickname(nickname: string) {
    put('/cms/user', { nickname }, { showBackend: true })
      .then((res: IResponseWithoutData) => {
        if (res.code < MAX_SUCCESS_CODE) {
          message.success('更新昵称成功')
          // 触发重新获取用户信息
          return UserModal.getInformation()
        }
      })
      .then((res: IUserType | undefined) => {
        if (typeof res === 'undefined') return
        dispatch(setUserAndState(res))
      })
  }

  function goToCenter() {
    history.push('/center')
  }

  function outLogin() {
    dispatch(loginOut())
  }

  return (
    <div className='user-box-container'>
      <div className='user-info'>
        <Avatar />
        <div className='text'>
          <div
            r-if={!nicknameEditing}
            className='nickname'
            onClick={onNicknameClick}
          >
            {nickname}
          </div>
          <Input
            r-else
            className='nickname-edit'
            placeholder='请输入内容'
            autoFocus
            defaultValue={nickname}
            onBlur={onNicknameBlur}
            onPressEnter={onNicknameBlur}
          />
        </div>
        <img src={cornerImg} className='corner' alt='' />
      </div>
      <ul className='dropdown-box'>
        <li className='center' onClick={goToCenter}>
          <SolutionOutlined />
          <span>个人中心</span>
        </li>
        <li className='logout' onClick={outLogin}>
          <LogoutOutlined />
          <span>退出账户</span>
        </li>
      </ul>
    </div>
  )
}
