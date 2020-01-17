import React, { useRef } from 'react'
import { Form, Modal, Button } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { FormComponentProps } from 'antd/lib/form'
import PwdForm from './PwdForm'

interface IProps extends ModalProps, FormComponentProps<any> {
  onCancel: () => void
}

const formWrapper = Form.create<IProps>({
  name: 'password_reset',
})

function PwdModal({ form, onCancel, ...restProps }: IProps) {
  const passwordForm = useRef<any>()

  function onSubmit() {
    passwordForm.current.onSubmit((success: boolean) => {
      success && onCancel()
    })
  }

  function resetForm() {
    form.resetFields()
  }

  return (
    <Modal
      width={600}
      title='修改密码'
      destroyOnClose
      footer={
        <>
          <Button type='primary' onClick={onSubmit}>
            确 定
          </Button>
          <Button onClick={resetForm}>重 置</Button>
        </>
      }
      onCancel={onCancel}
      {...restProps}
    >
      <PwdForm ref={passwordForm} form={form} />
    </Modal>
  )
}

export default formWrapper(PwdModal)
