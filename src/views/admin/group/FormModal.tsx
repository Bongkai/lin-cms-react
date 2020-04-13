import React, { useState, useRef } from 'react'
import { Form, Modal, Tabs, Button } from 'antd'
import GroupInfo from './GroupInfo'

import { ModalProps } from 'antd/lib/modal'
import { FormComponentProps } from '@/types/antd/Form'
import { IGroupItem } from '@/types/model'

interface IProps extends ModalProps, FormComponentProps {
  data?: IGroupItem
  refreshData: (...args: any) => void
}

const formWrapper = Form.create<IProps>({
  name: 'group_edit',
})

function FormModal({ form, data, refreshData, ...restProps }: IProps) {
  const [activeTab, setActiveTab] = useState('修改信息')
  const [submitting, setSubmitting] = useState(false)
  const groupInfo = useRef<any>()
  const groupAuths = useRef<any>()

  async function onSubmit() {
    setSubmitting(true)
    const node = activeTab === '修改信息' ? groupInfo : groupAuths
    node.current.onSubmit((success: boolean) => {
      setSubmitting(false)
      success && refreshData()
    })
  }

  function resetForm() {
    const node = activeTab === '修改信息' ? groupInfo : groupAuths
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
          <GroupInfo pageType='info' ref={groupInfo} form={form} data={data} />
        </Tabs.TabPane>
        <Tabs.TabPane tab='配置权限' key='配置权限'>
          <GroupInfo
            pageType='permissions'
            ref={groupAuths}
            form={form}
            data={data}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}

export default formWrapper(FormModal)
