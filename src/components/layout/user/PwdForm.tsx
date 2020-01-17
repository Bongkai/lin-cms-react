import React, { useImperativeHandle, forwardRef } from 'react'
import { Form, Input, message } from 'antd'
import User from 'lin/models/user'
import { WrappedFormUtils } from '@/types/antd/Form'
import { IResponseWithoutData } from '@/lin/models/admin'

interface IProps {
  form: WrappedFormUtils
}

const { Item } = Form

const layout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
}

function PwdForm({ form }: IProps, ref: any) {
  // 对外暴露的方法
  useImperativeHandle(ref, () => ({
    onSubmit,
  }))

  /**
   * 提交表单信息
   * @param {function} callback 提交后执行的回调函数
   */
  async function onSubmit(callback: (success: boolean) => void) {
    form.validateFields(async (errors: object | null, values: any) => {
      if (errors) {
        message.error('请填写正确的信息')
        return
      }
      // 校验成功后提交
      let res = await submitPassword(values)
      callback && callback(res)
    })
  }

  async function submitPassword(fields: any): Promise<boolean> {
    const { old_password, new_password, confirm_password } = fields
    if (new_password === '' && confirm_password === '') {
      return true
    }
    if (old_password === new_password) {
      message.error('新密码不能与原始密码一样')
      return false
    }

    let res: IResponseWithoutData
    try {
      res = await User.updatePassword(fields)
    } catch (e) {
      console.log(e)
      return false
    }

    const success = res.error_code === 0
    if (success) {
      message.success(`${res.msg}`)
    } else {
      message.error(`${res.msg}`)
    }
    return success
  }

  const { getFieldDecorator } = form

  return (
    <Form {...layout} colon={false}>
      <Item label='原始密码' required>
        {getFieldDecorator('old_password', {
          rules: [{ required: true, message: '原始密码不能为空' }],
        })(<Input type='password' />)}
      </Item>
      <Item label='新密码' required>
        {getFieldDecorator('new_password', {
          validate: [
            {
              trigger: 'onBlur',
              rules: [
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能少于6位数' },
              ],
            },
          ],
        })(<Input type='password' />)}
      </Item>
      <Item label='确认密码' required>
        {getFieldDecorator('confirm_password', {
          validate: [
            {
              trigger: 'onBlur',
              rules: [
                { required: true, message: '请再次输入密码' },
                {
                  validator: (rule: any, value: string, callback: Function) => {
                    if (value !== form.getFieldValue('new_password')) {
                      callback('两次输入密码不一致!')
                    }
                    // 原组件库的一个 Fixed 代码
                    callback()
                  },
                },
              ],
            },
          ],
        })(<Input type='password' />)}
      </Item>
    </Form>
  )
}

export default forwardRef(PwdForm)
