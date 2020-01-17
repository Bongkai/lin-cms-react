import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, Icon, message } from 'antd'
import { put } from 'lin/plugins/axios'
import User from 'lin/models/user'
import { loginOut, setUserAndState } from '@/store/actions/app.actions'
import { IStoreState } from '@/store'
import { IUserType } from '@/store/redux/app.redux'
import { IResponseWithoutData } from '@/lin/models/admin'

import './user-box.scss'

import cornerImg from '@/assets/img/user/corner.png'
import defaultAvatar from '@/assets/img/user/user.png'

interface IProps {
  changePassword: (ev: MouseEvent) => void
  onFileChange: (ev: ChangeEvent<HTMLInputElement>) => void
}

export default function UserBox({ changePassword, onFileChange }: IProps) {
  const [nicknameEditing, setNicknameEditing] = useState(false)
  // prettier-ignore
  let { avatar, nickname, username, groupName } = useSelector<IStoreState, IUserType>(
    state => state.app.user
  )
  nickname = nickname || '佚名'
  const dispatch = useDispatch()
  const avatarInput = useRef<HTMLInputElement | null>(null)

  function onNicknameClick() {
    changeNicknameEditing()
  }

  function onNicknameBlur(ev: any) {
    const value = ev.target.value
    if (value && value !== nickname) {
      submitNickname(value)
    }
    changeNicknameEditing()
  }

  function changeNicknameEditing() {
    setNicknameEditing(nicknameEditing => !nicknameEditing)
  }

  function submitNickname(nickname: string) {
    put(
      '/cms/user',
      {
        nickname,
      },
      {
        showBackend: true,
      },
    )
      .then((res: IResponseWithoutData) => {
        if (res.error_code === 0) {
          message.success('更新昵称成功')
          // 触发重新获取用户信息
          return User.getInformation()
        }
      })
      .then((res: IUserType | undefined) => {
        // eslint-disable-line
        if (typeof res === 'undefined') return
        dispatch(setUserAndState(res))
      })
  }

  function changeFile(ev: ChangeEvent<HTMLInputElement>) {
    onFileChange(ev)
    if (avatarInput.current) {
      avatarInput.current.value = ''
    }
  }

  function outLogin() {
    dispatch(loginOut())
  }

  return (
    <div className='user-box'>
      <div className='user-info'>
        <div className='avatar' title='点击修改头像'>
          <img src={avatar || defaultAvatar} alt='头像' />
          <label className='mask'>
            <Icon type='edit' style={{ fontSize: '18px' }} />
            <input
              ref={avatarInput}
              type='file'
              accept='image/*'
              onChange={changeFile}
            />
          </label>
        </div>
        <div className='text'>
          {!nicknameEditing ? (
            <div className='nickname' onClick={onNicknameClick}>
              {nickname}
            </div>
          ) : (
            <Input
              className='nickname-edit'
              placeholder='请输入内容'
              autoFocus
              defaultValue={nickname}
              onBlur={onNicknameBlur}
              onPressEnter={onNicknameBlur}
            />
          )}
        </div>
        <img src={cornerImg} className='corner' alt='' />
        <div className='info'>
          <div className='username'>{username || '未登录'}</div>
          <div className='mid'>|</div>
          <div className='desc'>{groupName || '超级管理员'}</div>
        </div>
      </div>
      <ul className='dropdown-box'>
        <li className='password' onClick={changePassword}>
          <Icon type='lock' />
          <span>修改登录密码</span>
        </li>
        <li className='account' onClick={outLogin}>
          <Icon type='logout' />
          <span>退出账户</span>
        </li>
      </ul>
    </div>
  )
}
