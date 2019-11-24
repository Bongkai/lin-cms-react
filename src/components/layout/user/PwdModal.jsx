import React from 'react'
import { Form, Modal, Button } from 'antd'
import PwdForm from './PwdForm'


const formWrapper = Form.create({
  name: 'password_reset'
})
class PwdModal extends React.Component {
  onSubmit() {
    this.passwordForm.onSubmit((success) => {
      success && this.props.onCancel()
    })
  }

  resetForm() {
    this.props.form.resetFields()
  }
  
  render() {
    const { form, data, ...restProps } = this.props
    return (
      <Modal width={600} title='修改密码' destroyOnClose
        footer={(<>
          <Button type='primary' onClick={()=>this.onSubmit()}>确 定</Button>
          <Button onClick={()=>this.resetForm()}>重 置</Button>
        </>)}
        {...restProps}
      >
        <PwdForm ref={ref=>this.passwordForm=ref}
          form={form} data={data}
        />
      </Modal>
    )
  }
}

export default formWrapper(PwdModal)