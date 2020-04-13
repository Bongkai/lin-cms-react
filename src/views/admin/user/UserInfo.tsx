import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Form, Input, Button, message } from 'antd'
import LinCheckbox from '@/components/base/lin-checkbox/LinCheckbox'
import { WrappedFormUtils } from '@/types/antd/Form'
import Admin from '@/lin/models/admin'
import User from '@/lin/models/user'
import useAwait from '@/hooks/base/useAwait'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IAdminUserItem, IResponseWithoutData } from '@/types/model'

import './style/user-info.scss'

interface IProps {
  form: WrappedFormUtils
  pageType: string
  data?: IAdminUserItem
}

const { Item } = Form

const layout_add = {
  labelCol: { xs: { span: 24 }, sm: { span: 3 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 21 } },
}
const layout_modal = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 19 } },
}

function UserInfo(
  { form, pageType, data = {} as IAdminUserItem }: IProps,
  ref: any,
) {
  const [submitting, setSubmitting] = useState(false)
  const [isEdited] = useState(false)
  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isPwdPage = pageType === 'password'

  let fieldNames: string[], submitFunc: (fields: any) => Promise<boolean>
  if (pageType === 'add') {
    fieldNames = Object.keys(form.getFieldsValue())
    submitFunc = submitAdd
  } else if (pageType === 'info') {
    fieldNames = ['username', 'email', 'group_ids']
    submitFunc = submitInfo
  } else if (pageType === 'password') {
    fieldNames = ['password', 'confirm_password']
    submitFunc = submitPassword
  }

  // 获取所有分组
  const [groups] = useAwait(Admin.getAllGroups)

  // 对外暴露的方法
  useImperativeHandle(ref, () => ({
    onSubmit,
    onReset,
  }))

  /**
   * 适用不同场景的重置方法
   */
  function onReset() {
    if (fieldNames === null) {
      form.resetFields()
    } else {
      form.resetFields(fieldNames)
    }
  }

  /**
   * 适用不同场景的提交方法
   * @param {*} submitType 添加用户/修改信息/修改密码
   * @param {*} finalFunc 处理提交后执行的函数，传入 true 时为提交成功或无修改，传入 false 为提交失败
   */
  async function onSubmit(finalFunc?: (success: boolean) => void) {
    form.validateFields(
      fieldNames,
      async (errors: object | null, values: any) => {
        if (errors) {
          const errMsg = isAddPage ? '请将信息填写完整' : '请填写正确的信息'
          message.error(errMsg)
          finalFunc && finalFunc(false)
          return
        }
        setSubmitting(true)
        // 通知父组件提交后续操作的类型，返回 true 则关闭 Modal 并刷新数据
        const success = await submitFunc(values)
        finalFunc && finalFunc(success)
      },
    )
  }

  async function submitAdd(fields: any): Promise<boolean> {
    let res: IResponseWithoutData
    try {
      res = await User.register(fields)
    } catch (e) {
      console.log(e)
      if (e && e.data && e.data.code === 10073) {
        message.error(e.data.message)
      } else {
        message.error('新增用户失败')
      }
      setSubmitting(false)
      return false
    }

    const success = res ? res.code < MAX_SUCCESS_CODE : false
    if (success) {
      message.success(`${res.message}`)
      onReset()
    } else {
      message.error(`${res.message}`)
    }
    setSubmitting(false)
    return success
  }

  async function submitInfo(fields: any): Promise<boolean> {
    const { email, group_ids } = fields
    if (
      email === data.email &&
      group_ids.sort().toString() === data.group_ids.sort().toString()
    ) {
      return true
    }

    let res: IResponseWithoutData
    try {
      res = await Admin.updateOneUser(email, group_ids, data.id)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res.code < MAX_SUCCESS_CODE
    if (success) {
      message.success(`${res.message}`)
    } else {
      message.error(`${res.message}`)
    }
    setSubmitting(false)
    return success
  }

  async function submitPassword(fields: any): Promise<boolean> {
    const { password, confirm_password } = fields
    if (password === '' && confirm_password === '') {
      return true
    }

    let res: IResponseWithoutData
    try {
      res = await Admin.changePassword(password, confirm_password, data.id)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res.code < MAX_SUCCESS_CODE
    if (success) {
      message.success(`${res.message}`)
    } else {
      message.error(`${res.message}`)
    }
    setSubmitting(false)
    return success
  }

  const { getFieldDecorator } = form
  const layout = isAddPage ? layout_add : layout_modal

  return (
    <div className='user-info-container'>
      <Form className='custom-antd' {...layout} colon={false}>
        <Item label='用户名' required r-if={!isPwdPage}>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: '用户名不能为空' }],
            initialValue: isInfoPage ? data.username : null,
          })(<Input disabled={!isAddPage} />)}
        </Item>

        <Item label='邮箱' r-if={!isPwdPage}>
          {getFieldDecorator('email', {
            validate: [
              {
                trigger: 'onBlur',
                rules: [
                  {
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,
                    message: '请输入正确的邮箱地址或者不填',
                  },
                ],
              },
            ],
            initialValue: isInfoPage ? data.email : null,
          })(<Input disabled={isEdited} />)}
        </Item>

        <Item label='密码' required r-if={!isInfoPage}>
          {getFieldDecorator('password', {
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

        <Item label='确认密码' required r-if={!isInfoPage}>
          {getFieldDecorator('confirm_password', {
            validate: [
              {
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
                    },
                  },
                ],
              },
            ],
          })(<Input type='password' />)}
        </Item>

        <Item label='选择分组' r-if={!isPwdPage}>
          <LinCheckbox
            options={groups}
            valueKey='id'
            nameKey='name'
            checkAllClassName='checkbox-all'
            checkGroupClassName='checkbox-group'
            checkItemClassName='checkbox-item'
            form={form}
            decoratorId='group_ids'
            decoratorOptions={{
              initialValue: isInfoPage
                ? data.group_ids.map(item => item.id)
                : [],
            }}
          />
        </Item>

        <Item className='submit' label=' ' r-if={isAddPage}>
          <Button
            type='primary'
            loading={submitting}
            onClick={() => onSubmit()}
          >
            确 定
          </Button>
          <Button onClick={onReset}>重 置</Button>
        </Item>
      </Form>
    </div>
  )
}

export default forwardRef(UserInfo)
