import React from 'react'

import './sticky-top.scss'


export default class StickyTop extends React.Component {
  render() {
    const { children, height } = this.props
    return (
      <div className='sticky-top-container' style={{height:height?height:'auto'}}>
        {children}
      </div>
    )
  }
}