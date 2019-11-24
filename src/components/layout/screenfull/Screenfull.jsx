import React from 'react'
import screenfull from 'screenfull'

import './screenfull.scss'
import { Icon } from 'antd'

export default class Screenfull extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isFullscreen: false
    }
    this.handleFullScreen = this.handleFullScreen.bind(this)
    this.change = this.change.bind(this)
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    this.destroy()
  }

  handleFullScreen() {
    // TODO: 这里可以加上浏览器不支持 screenfull 功能时的提示
    
    screenfull.toggle()
    this.change()
  }

  change() {
    this.setState({
      isFullscreen: !screenfull.isFullscreen
    })
  }

  init() {
    if (screenfull.enabled) {
      screenfull.on('change', this.change)
    }
  }

  destroy() {
    if (screenfull.enabled) {
      screenfull.off('change', this.change)
    }
  }

  render() {
    const { isFullscreen } = this.state
    return (
      <div className='screenfull-container' title='全屏/正常'>
        {/* <i className={`iconfont ${isFullscreen?'icon-quxiaoquanping':'icon-quanping'}`} 
          onClick={this.handleFullScreen}
        /> */}
        <Icon type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} className='screenfull-icon'
          onClick={this.handleFullScreen}
        />
      </div>
    )
  }
}