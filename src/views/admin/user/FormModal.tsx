import React, { useState, useRef } from 'react'
import { Modal, Tabs, Button } from 'antd'
import UserInfo from './UserInfo'

import { ModalProps } from 'antd/lib/modal'
import { IAdminUserItem } from '@/types/model'

interface IProps extends ModalProps {
  data: IAdminUserItem
  refreshData: (...args: any) => void
}

const TAB_INFO = '修改信息'
const TAB_PASSWORD = '修改密码'

export default function FormModal({ data, refreshData, ...restProps }: IProps) {
  const [activeTab, setActiveTab] = useState(TAB_INFO)
  const [submitting, setSubmitting] = useState(false)
  const userInfo = useRef<any>()
  const userPassword = useRef<any>()

  function onSubmit() {
    setSubmitting(true)
    const node = activeTab === TAB_INFO ? userInfo : userPassword
    node.current.onSubmit((success: boolean) => {
      setSubmitting(false)
      success && refreshData()
    })
  }

  function resetForm() {
    const node = activeTab === TAB_INFO ? userInfo : userPassword
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
        <Tabs.TabPane tab={TAB_INFO} key={TAB_INFO}>
          <UserInfo pageType='info' ref={userInfo} data={data} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={TAB_PASSWORD} key={TAB_PASSWORD}>
          <UserInfo pageType='password' ref={userPassword} data={data} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}
