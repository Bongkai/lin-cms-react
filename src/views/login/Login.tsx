import React, { useState } from 'react'
import { useSelector, commitMutation } from '@/store'
import { useHistory } from 'react-router-dom'
import { message } from 'antd'
import LoadingWrapper from '@/components/base/loading-wrapper/LoadingWrapper'
import User from '@/lin/models/user'
import {
  setUserAndState,
  setUserPermissions,
} from '@/store/mutations/app.mutations'

import './login.scss'
import teamNameImg from '@/assets/img/login/team-name.png'

/**
 * Login 登陆页面
 */
export default function Login() {
  const [username, setUsername] = useState('root')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const defaultRoute = useSelector(state => state.app.defaultRoute)
  const history = useHistory()

  function onSubmitClick() {
    setLoading(true)
    login()
  }

  async function login() {
    try {
      // 获取 access_token 和 refresh_token 并储存下来
      await User.getToken(username, password)
      await getInformation()
      setLoading(false)
      history.push(defaultRoute)
      message.success('登录成功')
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  async function getInformation() {
    try {
      // 尝试获取当前用户信息
      const user = await User.getPermissions()

      commitMutation(setUserAndState(user))
      commitMutation(setUserPermissions(user.permissions))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <LoadingWrapper className='login-container' loading={loading}>
      <div className='team-name'>
        <img src={teamNameImg} alt='' />
      </div>
      <div className='form-box'>
        <div className='title'>
          <h1 className='lin'>Lin CMS</h1>
        </div>
        <div className='login-form'>
          <div className='form-item nickname'>
            <span className='icon account-icon' />
            <input
              type='text'
              autoComplete='off'
              placeholder='请填写用户名'
              value={username}
              onChange={ev => setUsername(ev.target.value)}
            />
          </div>
          <div className='form-item password'>
            <span className='icon secret-icon'></span>
            <input
              type='password'
              autoComplete='off'
              placeholder='请填写用户登录密码'
              value={password}
              onChange={ev => setPassword(ev.target.value)}
            />
          </div>
          <button className='submit-btn' onClick={onSubmitClick}>
            登录
          </button>
        </div>
      </div>
    </LoadingWrapper>
  )
}
