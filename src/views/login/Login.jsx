import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Spin, message } from 'antd'
import User from '@/lin/models/user'
import { setUserAndState, setUserAuths } from '@/store/actions/app.actions'

import './login.scss'

import teamNameImg from '@/assets/img/login/team-name.png'


const connectWrapper = connect(
  state => state,
  { setUserAndState, setUserAuths }
)
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: 'super',
      password: '123456',
      loading: false
    }
    this.onSubmitClick = this.onSubmitClick.bind(this)
  }

  onInputChange(ev, key) {
    this.setState({
      [key]: ev.target.value
    })
  }

  onSubmitClick(ev) {
    ev.preventDefault()
    this.setState({ loading: true }, () => {
      this.login()
    })
  }

  async login() {
    const { username, password } = this.state
    try {
      // 获取 access_token 和 refresh_token 并储存下来
      await User.getToken(username, password)
      await this.getInformation()
      this.setState({ loading: false }, () => {
        this.props.history.push('/about')
        message.success('登录成功')
      })
    } catch (e) {
      console.log(e)
      this.setState({ loading: false })
    }
  }

  async getInformation() {
    try {
      // 尝试获取当前用户信息
      const user = await User.getAuths()
      this.props.setUserAndState(user)
      this.props.setUserAuths(user.auths)
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    const { username, password, loading } = this.state
    return (
      <div className='login'>
        <div className='team-name'>
          <img src={teamNameImg} alt='' />
        </div>
        <div className='form-box'>
          <div className='title'>
            <h1 className='lin'>Lin CMS</h1>
          </div>
          <div className='login-form'>
            <div className='form-item nickname'>
              <span className='icon account-icon'></span>
              <input type='text' autoComplete='off' placeholder='请填写用户名'
                value={username}
                onChange={(ev)=>this.onInputChange(ev, 'username')}
              />
            </div>
            <div className='form-item password'>
              <span className='icon secret-icon'></span>
              <input type='password' autoComplete='off' placeholder='请填写用户登录密码'
                value={password}
                onChange={(ev)=>this.onInputChange(ev, 'password')}
              />
            </div>
            <button className='submit-btn'
              onClick={(ev)=>this.onSubmitClick(ev)}
            >登录</button>
          </div>
        </div>
        <Spin className='loading' size='large' spinning={loading} />
      </div>
    )
  }
}

export default withRouter(connectWrapper(Login))