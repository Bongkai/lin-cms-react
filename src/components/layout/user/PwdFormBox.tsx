import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import PwdForm from './PwdForm'
import { loginOut } from '@/store/actions/app.actions'

const formWrapper = Form.create<FormComponentProps<any>>({
  name: 'password_reset',
})

function PwdFormBox({ form }) {
  const dispatch = useDispatch()
  const passwordForm = useRef<any>()

  function onSubmit() {
    passwordForm.current.onSubmit((success: boolean) => {
      success && outLogin()
    })
  }

  function outLogin() {
    setTimeout(() => {
      dispatch(loginOut())
    }, 500)
  }

  function resetForm() {
    form.resetFields()
  }

  return (
    <div>
      <PwdForm ref={passwordForm} form={form} />
      <div style={{ marginLeft: 84 }}>
        <Button type='primary' onClick={onSubmit} style={{ marginRight: 10 }}>
          确 定
        </Button>
        <Button onClick={resetForm}>重 置</Button>
      </div>
    </div>
  )
}

export default formWrapper(PwdFormBox)
