import React from 'react'
import { Form } from 'antd'
import UserInfo from '../user-info/UserInfo'

import './user-add.scss'


const formWrapper = Form.create({
  name: 'user_add'
})
class UserAdd extends React.Component {
  render() {
    return (
      <div className='user-add-container'>
        <div className='header'>
          <div className='title'>新建用户</div>
        </div>
        <div className='content'>
          <UserInfo pageType='add' form={this.props.form} />
        </div>
      </div>
    )
  }
}

export default formWrapper(UserAdd)