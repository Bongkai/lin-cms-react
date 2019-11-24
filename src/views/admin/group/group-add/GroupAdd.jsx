import React from 'react'
import { withRouter } from 'react-router-dom'
import { Form } from 'antd'
import GroupInfo from '../group-info/GroupInfo'

import './group-add.scss'

const formWrapper = Form.create({
  name: 'group_add'
})
class GroupAdd extends React.Component {
  render() {
    const { form, history } = this.props
    return (
      <div className='group-add-container'>
        <div className='title'>新建分组信息</div>
        <div className='content'>
          <GroupInfo pageType='add' 
            form={form} history={history}
          />
        </div>
      </div>
    )
  }
}

export default withRouter(formWrapper(GroupAdd))