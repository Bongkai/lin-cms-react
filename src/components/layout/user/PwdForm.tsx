import React, { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, message } from 'antd'
import User from '@/lin/models/user'
import { loginOut } from '@/store/actions/app.actions'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IResponseWithoutData } from '@/types/model'

const formLayout = { labelCol: { span: 3 }, wrapperCol: { span: 18 } }
const buttonLayout = { wrapperCol: { offset: 3 } }

export default function PwdForm() {
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  // 提交表单
  function onSubmit() {
    form
      .validateFields()
      .then(async values => {
        // 校验成功后提交
        await _submitPassword(values)
      })
      .catch(errorInfo => {
        message.error('请填写正确的信息')
      })
  }

  async function _submitPassword(fields: any) {
    let res: IResponseWithoutData
    try {
      res = await User.updatePassword(fields)
    } catch (e) {
      console.log(e)
      return
    }

    if (res.code < MAX_SUCCESS_CODE) {
      message.success(`${res.message}`)
      _outLogin()
    } else {
      message.error(`${res.message}`)
    }
  }

  function _outLogin() {
    setTimeout(() => {
      dispatch(loginOut())
    }, 500)
  }

  // 重置表单
  function reset() {
    form.resetFields()
  }

  // 表单验证规则
  const rules = useMemo(
    () => ({
      old_password: [{ required: true, message: '原始密码不能为空' }],
      new_password: [
        { required: true, message: '请输入密码' },
        { min: 6, message: '密码长度不能少于6位数' },
      ],
      confirm_password: [
        { required: true, message: '请再次输入密码' },
        {
          validator: (rule: any, value: string) => {
            if (value === form.getFieldValue('new_password')) {
              return Promise.resolve()
            }
            return Promise.reject('两次输入密码不一致!')
          },
        },
      ],
    }),
    [form],
  )

  return (
    <Form form={form} colon={false} {...formLayout}>
      <Form.Item
        name='old_password'
        label='原始密码'
        validateTrigger='onBlur'
        rules={rules.old_password}
        required
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name='new_password'
        label='新密码'
        validateTrigger='onBlur'
        rules={rules.new_password}
        required
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name='confirm_password'
        label='确认密码'
        validateTrigger='onBlur'
        rules={rules.confirm_password}
        dependencies={['new_password']}
        required
      >
        <Input.Password />
      </Form.Item>

      <Form.Item {...buttonLayout}>
        <Button type='primary' onClick={onSubmit} style={{ marginRight: 10 }}>
          确 定
        </Button>
        <Button onClick={reset}>重 置</Button>
      </Form.Item>
    </Form>
  )
}
