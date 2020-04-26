import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Input, message } from 'antd'
import { put } from '@/lin/plugins/axios'
import UserModal from '@/lin/models/user'
import { setUserAndState } from '@/store/actions/app.actions'
import PwdForm from '@/components/layout/user/PwdForm'
import Avatar from '@/components/layout/user/Avatar'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IStoreState, IUserType } from '@/types/store'
import { IResponseWithoutData } from '@/types/model'

import './center.scss'

export default function Center() {
  let { nickname } = useSelector<IStoreState, IUserType>(
    state => state.app.user,
  )
  nickname = nickname || '佚名'
  const dispatch = useDispatch()

  function onNicknameBlur(ev: any) {
    const value: string = ev.target.value
    if (value && value !== nickname) {
      submitNickname(value)
    }
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

  return (
    <div className='center-container'>
      <div className='title'>个人中心</div>
      <div className='wrap'>
        <div className='user'>
          <div className='title'>用户信息</div>
          <div className='content'>
            <div className='name-wrapper'>
              <div className='label'>昵称</div>
              <div className='name'>
                <Input
                  placeholder='请输入内容'
                  defaultValue={nickname}
                  onBlur={onNicknameBlur}
                />
              </div>
            </div>
            <Avatar />
          </div>
        </div>
        <div className='password'>
          <div className='title'>修改密码</div>
          <PwdForm />
        </div>
      </div>
    </div>
  )
}
