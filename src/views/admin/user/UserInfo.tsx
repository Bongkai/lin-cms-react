import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import { Form, Input, Button, message } from 'antd'
import LinCheckbox from '@/components/base/lin-checkbox/LinCheckbox'
import Admin from '@/lin/models/admin'
import User from '@/lin/models/user'
import useAwait from '@/hooks/base/useAwait'
import useFirstMountState from '@/hooks/base/useFirstMountState'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IAdminUserItem, IResponseWithoutData } from '@/types/model'

import './style/user-info.scss'

interface IProps {
  pageType: string
  data?: IAdminUserItem
}

const addLayout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } }
const modalLayout = { labelCol: { span: 4 }, wrapperCol: { span: 19 } }

const buttonLayout = { wrapperCol: { offset: 3 } }

function UserInfo({ pageType, data = {} as IAdminUserItem }: IProps, ref: any) {
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const isFirstMount = useFirstMountState()

  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isPwdPage = pageType === 'password'

  const formLayout = isAddPage ? addLayout : modalLayout

  let fieldNames: string[], submitFunc: (fields: any) => Promise<boolean>
  if (pageType === 'add') {
    fieldNames = isFirstMount ? [] : Object.keys(form.getFieldsValue())
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
    form
      .validateFields(fieldNames)
      .then(async values => {
        setSubmitting(true)
        // 通知父组件提交后续操作的类型，返回 true 则关闭 Modal 并刷新数据
        const success = await submitFunc(values)
        finalFunc && finalFunc(success)
      })
      .catch(errorInfo => {
        const errMsg = isAddPage ? '请将信息填写完整' : '请填写正确的信息'
        message.error(errMsg)
        finalFunc && finalFunc(false)
      })
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

  // 表单验证规则
  const rules = useMemo(
    () => ({
      username: [{ required: true, message: '用户名不能为空' }],
      email: [
        {
          pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,
          message: '请输入正确的邮箱地址或者不填',
        },
      ],
      password: [
        { required: true, message: '请输入密码' },
        { min: 6, message: '密码长度不能少于6位数' },
      ],
      confirm_password: [
        { required: true, message: '请再次输入密码' },
        {
          validator: (rule: any, value: string) => {
            if (value === form.getFieldValue('password')) {
              return Promise.resolve()
            }
            return Promise.reject('两次输入密码不一致!')
          },
        },
      ],
    }),
    [form],
  )

  // 表单默认数据
  const initialValues = useMemo(
    () => {
      const infoValues = isPwdPage
        ? {}
        : {
            username: isInfoPage ? data.username : null,
            email: isInfoPage ? data.email : null,
          }

      const groupValues = {
        group_ids: isInfoPage ? data.group_ids.map(item => item.id) : [],
      }
      return Object.assign(infoValues, groupValues)
    },
    [], // eslint-disable-line
  )

  return (
    <div className='user-info-container'>
      <Form
        form={form}
        initialValues={initialValues}
        colon={false}
        {...formLayout}
      >
        <Form.Item
          name='username'
          label='用户名'
          validateTrigger='onBlur'
          rules={rules.username}
          required
          r-if={!isPwdPage}
        >
          <Input disabled={isInfoPage} />
        </Form.Item>

        <Form.Item
          name='email'
          label='邮箱'
          validateTrigger='onBlur'
          rules={rules.email}
          r-if={!isPwdPage}
        >
          <Input disabled={isInfoPage} />
        </Form.Item>

        <Form.Item
          name='password'
          label='密码'
          validateTrigger='onBlur'
          rules={rules.password}
          required
          r-if={!isInfoPage}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name='confirm_password'
          label='确认密码'
          validateTrigger='onBlur'
          rules={rules.confirm_password}
          dependencies={['password']}
          required
          r-if={!isInfoPage}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label='选择分组' r-if={!isPwdPage}>
          <LinCheckbox
            name='group_ids'
            options={groups}
            form={form}
            itemValueKey='id'
            itemNameKey='name'
            checkGroupClassName='checkbox-group'
            checkItemClassName='checkbox-item'
          />
        </Form.Item>

        <Form.Item r-if={isAddPage} {...buttonLayout}>
          <Button
            type='primary'
            loading={submitting}
            onClick={() => onSubmit()}
            style={{ marginRight: 10 }}
          >
            确 定
          </Button>
          <Button onClick={onReset}>重 置</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default forwardRef(UserInfo)
