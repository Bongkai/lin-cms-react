import React, { useState, useRef } from 'react'
import { Modal, Tabs, Button } from 'antd'
import GroupInfo from './GroupInfo'

import { ModalProps } from 'antd/lib/modal'
import { IGroupItem } from '@/types/model'

interface IProps extends ModalProps {
  data?: IGroupItem
  refreshData: (...args: any) => void
}

const TAB_INFO = '修改信息'
const TAB_PERMISSIONS = '配置权限'

export default function FormModal({ data, refreshData, ...restProps }: IProps) {
  const [activeTab, setActiveTab] = useState(TAB_INFO)
  const [submitting, setSubmitting] = useState(false)
  const groupInfo = useRef<any>()
  const groupAuths = useRef<any>()

  async function onSubmit() {
    setSubmitting(true)
    const node = activeTab === TAB_INFO ? groupInfo : groupAuths
    node.current.onSubmit((success: boolean) => {
      setSubmitting(false)
      success && refreshData()
    })
  }

  function resetForm() {
    const node = activeTab === TAB_INFO ? groupInfo : groupAuths
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
          <GroupInfo pageType='info' ref={groupInfo} data={data} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={TAB_PERMISSIONS} key={TAB_PERMISSIONS}>
          <GroupInfo pageType='permissions' ref={groupAuths} data={data} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}
