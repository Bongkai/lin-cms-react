import React, { useState, useRef } from 'react'
import { Form, Modal, Tabs, Button } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { FormComponentProps } from '@/types/antd/Form'
import UserInfo from '../user-info/UserInfo'
import { IAdminUserItem } from '@/lin/models/admin'

interface IProps extends ModalProps, FormComponentProps {
  data: IAdminUserItem
  refreshData: (...args: any) => void
}

const formWrapper = Form.create<IProps>({
  name: 'user_edit',
})

function FormModal({ form, data, refreshData, ...restProps }: IProps) {
  const [activeTab, setActiveTab] = useState('修改信息')
  const [submitting, setSubmitting] = useState(false)
  const userInfo = useRef<any>()
  const userPassword = useRef<any>()

  function onSubmit() {
    setSubmitting(true)
    const node = activeTab === '修改信息' ? userInfo : userPassword
    node.current.onSubmit((success: boolean) => {
      setSubmitting(false)
      success && refreshData()
    })
  }

  function resetForm() {
    const node = activeTab === '修改信息' ? userInfo : userPassword
    node.current.onReset()
  }

  function onTabChange(value: string) {
    setActiveTab(value)
  }

  return (
    <Modal
      width={600}
      destroyOnClose
      footer={
        <>
          <Button type='primary' loading={submitting} onClick={onSubmit}>
            确 定
          </Button>
          <Button onClick={resetForm}>重 置</Button>
        </>
      }
      {...restProps}
    >
      <Tabs activeKey={activeTab} animated={false} onChange={onTabChange}>
        <Tabs.TabPane tab='修改信息' key='修改信息'>
          <UserInfo pageType='info' ref={userInfo} form={form} data={data} />
        </Tabs.TabPane>
        <Tabs.TabPane tab='修改密码' key='修改密码'>
          <UserInfo
            pageType='password'
            ref={userPassword}
            form={form}
            data={data}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

export default formWrapper(FormModal)
