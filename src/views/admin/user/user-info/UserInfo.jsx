import React from 'react'
import { Form, Input, Select, Button, message } from 'antd'
import Admin from 'lin/models/admin'
import User from 'lin/models/user'

import './user-info.scss'

const { Item } = Form

const formItemLayout_add = {
  labelCol: { xs: { span: 24 }, sm: { span: 3 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 21 } }
}
const formItemLayout_modal = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 19 } }
}


export default class UserInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: [],
    }
    this.isAddPage = this.props.pageType === 'add'
    this.isInfoPage = this.props.pageType === 'info'
    this.isPwdPage = this.props.pageType === 'password'

    this.id = this.props.data ? this.props.data.id : undefined

    this.onSubmit = this.onSubmit.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }

  async componentDidMount() {
    this.getAllGroups()
  }

  async getAllGroups() {
    try {
      const groups = await Admin.getAllGroups()
      // Add 页的选择分组默认为分组的第一项
      this.setState({ groups }, () => {
        this.isAddPage && this.props.form.setFieldsValue({
          group_id: this.state.groups[0].id
        })
      })
    } catch (e) {
      console.log(e)
    }
  }

  resetForm() {
    this.props.form.resetFields()
  }

  /**
   * 适用不同场景的提交方法
   * @param {*} submitType 添加用户/修改信息/修改密码
   * @param {*} finalFunc 处理提交后执行的函数，传入 true 时为提交成功或无修改，传入 false 为提交失败
   */
  async onSubmit(submitType, finalFunc) {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        const errMsg = this.isAddPage ? '请将信息填写完整' : '请填写正确的信息'
        message.error(errMsg)
        finalFunc && finalFunc(false)
        return
      }

      // 校验成功后提交
      let success
      if (submitType === '添加用户') {
        success = await this.submitAdd(values)
      } else if (submitType === '修改信息') {
        success = await this.submitInfo(values)
      } else if (submitType === '修改密码') {
        success = await this.submitPassword(values)
      }
      finalFunc && finalFunc(success)
    })
  }

  async submitAdd(fields) {
    let res
    try {
      res = await User.register(fields)
    } catch (e) {
      console.log(e)
      return
    }

    if (res.error_code === 0) {
      message.success(`${res.msg}`)
      this.resetForm()
    } else {
      this.setState({ loading: false })
      message.error(`${res.msg}`)
    }
  }

  async submitInfo(fields) {
    const { email, group_id } = fields
    const { data = {} } = this.props
    if (email === data.email && group_id === data.group_id) {
      return true
    }

    let res
    try {
      res = await Admin.updateOneUser(email, group_id, this.id)
    } catch (e) {
      console.log(e)
      return false
    }

    const success = (res.error_code === 0)
    if (success) {
      message.success(`${res.msg}`)
    } else {
      message.error(`${res.msg}`)
    }
    return success
  }

  async submitPassword(fields) {
    const { password, confirm_password } = fields
    if (password === '' && confirm_password === '') {
      return true
    }

    let res
    try {
      res = await Admin.changePassword(password, confirm_password, this.id)
    } catch (e) {
      console.log(e)
      return false
    }

    const success = (res.error_code === 0)
    if (success) {
      message.success(`${res.msg}`)
    } else {
      message.error(`${res.msg}`)
    }
    return success
  }

  render() {
    const { form, form: { getFieldDecorator }, data } = this.props
    const { groups } = this.state
    const { isAddPage, isInfoPage, isPwdPage } = this
    const layout = isAddPage ? formItemLayout_add : formItemLayout_modal
    
    return (
      <div className='user-info-container'>
        <Form className='custom-antd' {...layout} colon={false}>
          {!isPwdPage && (<>
            <Item label='用户名' required>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: '用户名不能为空' }],
                initialValue: isInfoPage ? data.username : null
              })(
                <Input disabled={!isAddPage} />
              )}
            </Item>
            <Item label='邮箱'>
              {getFieldDecorator('email', {
                validate: [{
                  trigger: 'onBlur',
                  rules: [
                    { 
                      pattern: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$',
                      message: '请输入正确的邮箱地址或者不填'
                    }
                  ],
                }],
                initialValue: isInfoPage ? data.email : null
              })(
                <Input />
              )}
            </Item>
          </>)}
          {!isInfoPage && (<>
            <Item label='密码' required>
              {getFieldDecorator('password', {
                validate: [{
                  trigger: 'onBlur',
                  rules: [
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度不能少于6位数' }
                  ]
                }]
              })(
                <Input type='password' />
              )}
            </Item>
            <Item label='确认密码' required>
              {getFieldDecorator('confirm_password', {
                validate: [{
                  trigger: 'onBlur',
                  rules: [
                    { required: true, message: '请再次输入密码' },
                    { 
                      validator: (rule, value, callback) => {
                        if (value !== form.getFieldValue('password')) {
                          callback('两次输入密码不一致!')
                        }
                        // 原组件库的一个 Fixed 代码
                        callback()
                      }
                    }
                  ]
                }]
              })(
                <Input type='password' />
              )}
            </Item>
          </>)}
          {!isPwdPage && (
            <Item label='选择分组'>
              {getFieldDecorator('group_id', {
                initialValue: isInfoPage ? data.group_id : (groups[0] ? groups[0].id : null)
              })(
                <Select className='custom-antd' style={{width:220}}
                  dropdownStyle={{ zIndex: 1100 }}  // 避免下拉模块在 Modal 界面中被遮盖
                >
                  {groups.map(item => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Item>
          )}
          {isAddPage && (
            <Item className='submit' label=' '>
              <Button type='primary' onClick={()=>this.onSubmit('添加用户')}>确 定</Button>
              <Button onClick={this.resetForm}>重 置</Button>
            </Item>
          )}
        </Form>
      </div>
    )
  }
}
