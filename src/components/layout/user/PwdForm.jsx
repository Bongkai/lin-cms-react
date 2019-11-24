import React from 'react'
import { Form, Input, message } from 'antd'
import User from 'lin/models/user'

const { Item } = Form

const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
}


export default class PwdForm extends React.Component {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }

  resetForm() {
    this.props.form.resetFields()
  }

  async onSubmit(callback) {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        message.error('请填写正确的信息')
        return
      }

      // 校验成功后提交
      let res = await this.submitPassword(values)
      callback && callback(res)
    })
  }

  async submitPassword(fields) {
    const { old_password, new_password, confirm_password } = fields
    if (new_password === '' && confirm_password === '') {
      return true
    }
    if (old_password === new_password) {
      message.error('新密码不能与原始密码一样')
      return
    }

    let res
    try {
      res = await User.updatePassword(fields)
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
    const { form, form: { getFieldDecorator } } = this.props
    
    return (
      <Form {...formItemLayout} colon={false}>
        <Item label='原始密码' required>
          {getFieldDecorator('old_password', {
            rules: [
              { required: true, message: '原始密码不能为空' }
            ]
          })(
            <Input type='password' />
          )}
        </Item>
        <Item label='新密码' required>
          {getFieldDecorator('new_password', {
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
                    if (value !== form.getFieldValue('new_password')) {
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
      </Form>
    )
  }
}
