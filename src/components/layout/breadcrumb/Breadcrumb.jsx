import React from 'react'
import { connect } from 'react-redux'

import './breadcrumb.scss'


const connectWrapper = connect(
  state => state
)
class Breadcrumb extends React.Component {
  render() {
    const stageInfo = this.props.app.currentRoute.treePath
    const titleArr = stageInfo.map(item => item.title).filter(item => !!item)
    return (
      <div className='nav-title'>
        {titleArr.map(item => (
          <div className='item' key={item}>
            <span>{item}</span>
          </div>
        ))}
      </div>
    )
  }
}

export default connectWrapper(Breadcrumb)