import React from 'react'
import { Icon } from 'antd'

import './back-top.scss'


export default class BackTop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      targetDom: null, // 当前滚动对象
      showBackTop: false, // 是否显示回到顶部标识
      scrollY: 0, // 滚动距离
    }
    this.handleScroll = this.handleScroll.bind(this)
    this.backTop = this.backTop.bind(this)
  }

  componentDidMount() {
    // 监听页面滚动
    window.addEventListener('scroll', this.handleScroll, true)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll(ev) {
    this.setState({
      targetDom: ev,
      showBackTop: ev.target.scrollTop > 100, // 页面滚动距离大于100的时候显示回到top的标识
      scrollY: ev.target.scrollTop,
    })
  }

  // 滑动到顶部
  backTop() {
    const _this = this
    let timer = requestAnimationFrame(function fn() {
      const currentTop = _this.state.targetDom.target.scrollTop
      if (currentTop > 0) {
        // 平滑滚动
        const scrollSpeed = currentTop + ((0 - currentTop) / 6)
        _this.state.targetDom.target.scrollTop = scrollSpeed
        timer = requestAnimationFrame(fn)
      } else {
        cancelAnimationFrame(timer)
      }
    })
  }
  
  render() {
    const { showBackTop } = this.state
    const styles = {
      display: showBackTop ? 'block' : 'none',
      right: 50,
      bottom: 50,
    }
    return (
      <div className='back-top' style={styles}>
        <Icon type='arrow-up' style={{ fontSize: 24 }}
          onClick={this.backTop}
        />
      </div>
    )
  }
}