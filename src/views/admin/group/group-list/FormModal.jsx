import React from 'react'
import { Form, Modal, Tabs, Button } from 'antd'
import GroupInfo from '../group-info/GroupInfo'

const formWrapper = Form.create({
  name: 'group_edit'
})
class FormModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: '修改信息',
      submitting: false,
    }
  }

  onSubmit() {
    this.setState({ submitting: true })
    const node = this.state.activeTab === '修改信息'
      ? this.groupInfo : this.groupAuths
    node.onSubmit(this.state.activeTab, (success) => {
      this.setState({ submitting: false })
      success && this.props.refreshData()
    })
  }

  resetForm() {
    this.props.form.resetFields()
  }

  onTabChange(value) {
    this.setState({
      activeTab: value
    })
  }
  
  render() {
    const { form, data, ...restProps } = this.props
    const { activeTab, submitting } = this.state
    return (
      <Modal width={600} destroyOnClose
        footer={(<>
          <Button type='primary'
            loading={submitting}
            onClick={()=>this.onSubmit()}
          >确 定</Button>
          <Button onClick={()=>this.resetForm()}>重 置</Button>
        </>)}
        {...restProps}
      >
        <Tabs activeKey={activeTab} animated={false}
          onChange={(activeKey)=>this.onTabChange(activeKey)}
        >
          <Tabs.TabPane tab='修改信息' key='修改信息'>
            <GroupInfo pageType='info' ref={ref=>this.groupInfo=ref}
              form={form} data={data}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='配置权限' key='配置权限'>
            <GroupInfo pageType='auths' ref={ref=>this.groupAuths=ref}
              form={form} data={data}
            />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    )
  }
}

export default formWrapper(FormModal)