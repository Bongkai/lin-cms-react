import React from 'react'
import { connect } from 'react-redux'
import { Input, Icon, message } from 'antd'
import axios from 'lin/plugins/axios'
import User from 'lin/models/user'
import { loginOut, setUserAndState } from '@/store/actions/app.actions'

import './user-box.scss'

import cornerImg from '@/assets/img/user/corner.png'
import defaultAvatar from '@/assets/img/user/user.png'


const connectWrapper = connect(
  state => state,
  { loginOut, setUserAndState }
)
class UserBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nicknameEditing: false
    }
    this.onNicknameClick = this.onNicknameClick.bind(this)
    this.onNicknameBlur = this.onNicknameBlur.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.changePassword = this.changePassword.bind(this)
  }

  onNicknameClick() {
    this._changeNicknameEditing()
  }

  onNicknameBlur(ev) {
    const value = ev.target.value
    if (value && value !== this.props.app.user.nickname) {
      this.submitNickname(value)
    }
    this._changeNicknameEditing()
  }

  _changeNicknameEditing() {
    this.setState({
      nicknameEditing: !this.state.nicknameEditing
    })
  }

  submitNickname(nickname) {
    axios({
      method: 'put',
      url: '/cms/user',
      data: { nickname },
      params: {
        showBackend: true,
      },
    }).then((res) => {
      if (res.error_code === 0) {
        message.success('更新昵称成功')
        // 触发重新获取用户信息
        return User.getInformation()
      }
    }).then((res) => { // eslint-disable-line
      this.props.setUserAndState(res)
    })
  }

  onFileChange(ev) {
    this.props.onFileChange(ev)
    this.avatarInput.value = ''
  }

  changePassword() {
    this.props.changePassword()
  }

  outLogin() {
    this.props.loginOut()
  }

  render() {
    let { 
      avatar,
      nickname,
      username = '未登录',
      groupName = '超级管理员',
    } = this.props.app.user
    nickname = nickname || '佚名'
    const { nicknameEditing } = this.state

    return (
      <div className='user-box'>
        <div className='user-info'>
          <div className='avatar' title='点击修改头像'>
            <img src={avatar||defaultAvatar} alt='头像' />
            <label className='mask'>
              {/* <i className='iconfont icon-icon-test' style={{ fontSize: '20px' }} /> */}
              <Icon type='edit' style={{ fontSize: '18px' }} />
              <input ref={ref=>this.avatarInput=ref}
                type='file'
                accept='image/*'
                onChange={this.onFileChange}
              />
            </label>
          </div>
          <div className='text'>
            {
              !nicknameEditing
              ?
              <div className='nickname'
                onClick={this.onNicknameClick}
              >{nickname}</div>
              :
              <Input className='nickname-edit' placeholder='请输入内容' autoFocus
                defaultValue={nickname}
                onBlur={this.onNicknameBlur}
                onPressEnter={this.onNicknameBlur}
              />
            }
          </div>
          <img src={cornerImg} className='corner' alt='' />
          <div className='info'>
            <div className='username'>{username}</div>
            <div className='mid'>|</div>
            <div className='desc'>{groupName}</div>
          </div>
        </div>
        <ul className='dropdown-box'>
          <li className='password' onClick={this.changePassword}>
            {/* <i className='iconfont icon-weibaoxitongshangchuanlogo-'></i> */}
            <Icon type='lock' />
            <span>修改登录密码</span>
          </li>
          <li className='account' onClick={()=>this.outLogin()}>
            {/* <i className='iconfont icon-tuichu'></i> */}
            <Icon type='logout' />
            <span>退出账户</span>
          </li>
        </ul>
      </div>
    )
  }
}

export default connectWrapper(UserBox)