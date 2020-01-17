import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Form, Input, Select, Button, message } from 'antd'
import { WrappedFormUtils } from '@/types/antd/Form'
import Admin, { IAdminUserItem, IResponseWithoutData } from 'lin/models/admin'
import User from 'lin/models/user'
import useAwait from 'hooks/base/useAwait'

import './user-info.scss'

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
  // const [groups, setGroups] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isPwdPage = pageType === 'password'
  const { id } = data

  let fieldNames: string[], submitFunc: (fields: any) => Promise<boolean>
  if (pageType === 'add') {
    fieldNames = Object.keys(form.getFieldsValue())
    submitFunc = submitAdd
  } else if (pageType === 'info') {
    fieldNames = ['username', 'email', 'group_id']
    submitFunc = submitInfo
  } else if (pageType === 'password') {
    fieldNames = ['password', 'confirm_password']
    submitFunc = submitPassword
  }

  // 获取所有分组
  let [groups] = useAwait(Admin.getAllGroups)
  groups = groups || []

  useEffect(() => {
    // Add 页的选择分组默认为分组的第一项
    isAddPage &&
      form.setFieldsValue({
        group_id: groups[0] ? groups[0].id : null,
      })
  }, [groups]) // eslint-disable-line

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
      setSubmitting(false)
      return false
    }

    const success = res ? res.error_code === 0 : false
    if (success) {
      message.success(`${res.msg}`)
      onReset()
    } else {
      message.error(`${res.msg}`)
    }
    setSubmitting(false)
    return success
  }

  async function submitInfo(fields: any): Promise<boolean> {
    const { email, group_id } = fields
    if (email === data.email && group_id === data.group_id) {
      return true
    }

    let res: IResponseWithoutData
    try {
      res = await Admin.updateOneUser(email, group_id, id)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res.error_code === 0
    if (success) {
      message.success(`${res.msg}`)
    } else {
      message.error(`${res.msg}`)
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
      res = await Admin.changePassword(password, confirm_password, id)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res.error_code === 0
    if (success) {
      message.success(`${res.msg}`)
    } else {
      message.error(`${res.msg}`)
    }
    setSubmitting(false)
    return success
  }

  const { getFieldDecorator } = form
  const layout = isAddPage ? layout_add : layout_modal

  return (
    <div className='user-info-container'>
      <Form className='custom-antd' {...layout} colon={false}>
        {!isPwdPage && (
          <>
            <Item label='用户名' required>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: '用户名不能为空' }],
                initialValue: isInfoPage ? data.username : null,
              })(<Input disabled={!isAddPage} />)}
            </Item>
            <Item label='邮箱'>
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
              })(<Input />)}
            </Item>
          </>
        )}
        {!isInfoPage && (
          <>
            <Item label='密码' required>
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
            <Item label='确认密码' required>
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
          </>
        )}
        {!isPwdPage && (
          <Item label='选择分组'>
            {getFieldDecorator('group_id', {
              initialValue: isInfoPage
                ? data.group_id
                : groups[0]
                ? groups[0].id
                : null,
            })(
              <Select
                className='custom-antd'
                style={{ width: 220 }}
                dropdownStyle={{ zIndex: 1100 }} // 避免下拉模块在 Modal 界面中被遮盖
              >
                {groups.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Item>
        )}
        {isAddPage && (
          <Item className='submit' label=' '>
            <Button
              type='primary'
              loading={submitting}
              onClick={() => onSubmit()}
            >
              确 定
            </Button>
            <Button onClick={onReset}>重 置</Button>
          </Item>
        )}
      </Form>
    </div>
  )
}

export default forwardRef(UserInfo)
