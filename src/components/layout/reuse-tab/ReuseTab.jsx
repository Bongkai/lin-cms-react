import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Icon } from 'antd'
import Swiper from 'components/base/swiper/Swiper'
import Utils from 'lin/utils/util'
import { changeReuseTab } from '@/store/actions/app.actions'
import { 
  getStageByName, getStageByRoute, stageList, getStageInfo
} from '@/store/getters/app.getters'

import './reuse-tab.scss'

const connectWrapper = connect(
  state => state,
  { changeReuseTab }
)
class ReuseTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      histories: [],
      // Swiper 的配置
      parameters: {
        slidesPerView: 'auto',
        initialSlide: 0,
        effect: 'slide',
        spaceBetween: 1,
        preventClicks: false,
        freeMode: true,
        mousewheel: {
          sensitivity: 1.5,
        },
        observer: true,
      }
    }
    this.stageList = {}
  }

  componentDidMount() {
    window.onbeforeunload = () => {
      this.saveHistories()  // 缓存历史记录
    }
    this.init()
  }

  componentWillUnmount() {
    this.saveHistories()
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.changeRoute(this.props.app.currentRoute.config)
    }
  }

  init() {
    this.stageList = stageList()

    const _histories = []
    const { app, location: { pathname } } = this.props
    const { histories } = this.state

    let localHistory = []

    // 获取当前的历史记录, 可能从本地存储, 可能直接获取当前的
    if (histories.length > 0) {
      localHistory = [...histories]
    } else {
      localHistory = window.localStorage.getItem('history') || '[]'
      localHistory = JSON.parse(localHistory)
    }

    localHistory.forEach((item) => {
      let findResult
      if (item.stageId) {
        findResult = getStageByName(item.stageId)
      } else {
        findResult = getStageByRoute(item.routePath)
      }
      if (!findResult) {
        return
      }
      _histories.push({
        ...item,
        stageId: findResult.name,
      })
    })
    
    if (
      _histories.length === 0 ||
      !_histories.some(item => item.routePath === pathname)
    ) {
      // ReuseTab 为空或者匹配不到当前路由时加入当前路由的数据
      const stageInfo = getStageInfo(app)(pathname)
      this.changeRoute(stageInfo[stageInfo.length - 1], _histories)
    } else {
      // 其他情况直接更新 histories 数据
      this.props.changeReuseTab(_histories)
    }
  }

  changeRoute(config, histories) {
    if (!config) {
      return
    }

    // 判断待跳转页面是否有权限，无权限则不加入ReuseTab列表中
    let findResult
    if (config.stageId) {
      findResult = getStageByName(config.stageId)
    } else {
      findResult = getStageByRoute(config.route)
    }
    if (!findResult) {
      return
    }

    histories = histories || this.props.app.histories
    if (histories.some((item) => item.routePath === config.route)) {
      return
    }
    const ele = {}
    ele.stageId = config.name
    ele.routePath = config.route
    ele.title = config.title
    ele.icon = config.icon
    this.props.changeReuseTab([ele, ...histories])
  }

  close(ev, index) {
    ev.stopPropagation()
    const { history, location, app: { histories, defaultRoute } } = this.props
    // 检测是否是当前页, 如果是当前页则自动切换路由
    if (location.pathname === histories[index].routePath) {
      if (index > 0) {
        history.push(histories[index - 1].routePath)
      } else if (histories.length > 1) {
        history.push(histories[1].routePath)
      } else {
        history.push(defaultRoute)
      }
    }
    // 删除该历史记录
    const _histories = [...histories]
    _histories.splice(index, 1)
    this.props.changeReuseTab(_histories)
  }

  onLinkClick(route) {
    if (this.props.location.pathname !== route) {
      this.props.history.push(route)
    }
  }

  saveHistories() {
    if (this.props.app.logined) {
      window.localStorage.setItem('history', JSON.stringify(this.props.app.histories))
    }
  }

  render() {
    const { histories } = this.props.app
    const { pathname } = this.props.location
    const visible = histories.length > 1
    return (
      <div className='reuse-tab-wrap' style={{display:visible?'block':'none'}}>
        <Swiper parameters={this.state.parameters}>
          {histories.map((item, index) => {
            const _item = this.stageList[item.stageId]
            return _item ? (
              <div className='swiper-slide reuse-tab-item' key={_item.route}>
                {/* 这里用 NavLink 的话删除 Tab 的逻辑会出错 */}
                <div className={`link ${pathname===_item.route?'active':''}`}
                  onClick={()=>this.onLinkClick(_item.route)}
                >
                  {/* <i className={item.icon} /> */}
                  <Icon type={item.icon} style={{ fontSize: '16px' }} />
                  <span style={{ padding: '0 5px' }}>{Utils.cutString(item.title, 8)}</span>
                  <span className='icon-close' onClick={(ev)=>this.close(ev, index)}>
                    <Icon className='icon-close-icon' type='close' />
                  </span>
                </div>
              </div>
            ) : null
          })}
        </Swiper>
      </div>
    )
  }
}

export default withRouter(connectWrapper(ReuseTab))