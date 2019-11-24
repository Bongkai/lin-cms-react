import React from 'react'
import { connect } from 'react-redux'
import { Icon } from 'antd'
import { changeReuseTab } from '@/store/actions/app.actions'

import './clear-tab.scss'


const connectWrapper = connect(
  state => state,
  { changeReuseTab }
)
class ClearTab extends React.Component {
  clearAllHistories() {
    const { config } = this.props.app.currentRoute
    const ele = {}
    ele.stageId = config.name
    ele.routePath = config.route
    ele.title = config.title
    ele.icon = config.icon
    this.props.changeReuseTab([ele])
  }

  render() {
    const reuseLength = this.props.app.histories.length
    return (<>
      {
        reuseLength > 1
        ?
        <div className='clear-icon' title='关闭全部历史记录'
          onClick={()=>this.clearAllHistories()}
        >
          <Icon type='delete' style={{ fontSize: '20px' }} />
        </div> : null
      }
    </>)
  }
}

export default connectWrapper(ClearTab)