import React from 'react'
import { connect } from 'react-redux'
import { withRouter, NavLink } from 'react-router-dom'
import { Icon } from 'antd'

import './menu-tab.scss'


const connectWrapper = connect(
  state => state
)
class MenuTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      tabArr: []
    }
  }

  componentDidMount() {
    this.handleStage(this.props.location.pathname)
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.location.pathname === this.props.location.pathname) {
  //     return
  //   }
  //   this.handleStage(nextProps.location.pathname)
  // }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname === prevProps.location.pathname) {
      return
    }
    this.handleStage(this.props.location.pathname)
  }

  handleStage(pathname) {
    let tabArr = [], visible = false
    const stageInfo = this.props.app.currentRoute.treePath
    // TODO: 这里是不是应该改成通用的检查 tab 的写法
    if (stageInfo.length === 3 && stageInfo[1].type === 'tab') {
      tabArr = stageInfo[1].children
      visible = true
    }

    this.setState({
      tabArr, visible
    })
  }

  render() {
    // const { stageConfig } = this.props.app
    const { visible, tabArr } = this.state

    return (
      <div>
        {visible ? (
          <div>
            <ul className='menu-tab'>
              {tabArr.map((item) => (
                <NavLink to={item.route} key={item.route}>
                  <li className='menu-li'>
                    {/* <i className={item.icon} /> */}
                    {/* <span className='title'>{item.title || filterTitle}</span> */}
                    <div>
                      <Icon type={item.icon} style={{ fontSize: '16px' }} />
                      <span className='title'>{item.title}</span>
                    </div>
                  </li>
                </NavLink>
              ))}
            </ul>
          </div>) : null
        }
      </div>
    )
  }
}

export default withRouter(connectWrapper(MenuTab))