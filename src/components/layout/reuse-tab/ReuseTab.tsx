import React, { useEffect, useCallback, useRef, MouseEvent } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import { Icon } from 'antd'
import Swiper from '@/components/base/swiper/Swiper'
import Utils from '@/lin/utils/util'
import { changeReuseTab } from '@/store/actions/app.actions'
import {
  getStageByName,
  getStageByRoute,
  getStageList,
} from '@/store/getters/app.getters'

import { IStoreState, IAppState, IHistoryItem } from '@/types/store'
import { IRouterItem } from '@/types/project'

import './reuse-tab.scss'

const swiperParameters = {
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

export default function ReuseTab() {
  const appState = useSelector<IStoreState, IAppState>(state => state.app)
  const { logined, histories, defaultRoute } = appState
  const stageConfig = appState.currentRoute.config
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const history = useHistory()
  const stageList = getStageList()
  const historiesRef = useRef<IHistoryItem[]>()

  const changeRoute = useCallback(
    config => {
      if (!config) {
        return
      }
      // 判断待跳转页面是否有权限，无权限则不加入ReuseTab列表中
      let findResult: IRouterItem
      if (config.stageId) {
        findResult = getStageByName(config.stageId)
      } else {
        findResult = getStageByRoute(config.route)
      }
      if (!findResult) {
        return
      }
      if (histories.some(item => item.routePath === config.route)) {
        return
      }
      const ele = {} as IHistoryItem
      ele.stageId = config.name
      ele.routePath = config.route
      ele.title = config.title
      ele.icon = config.icon
      dispatch(changeReuseTab([ele, ...histories]))
    },
    [histories, dispatch],
  )

  // 保持一个可给 useEffect 使用的最新的 histories 值
  useEffect(() => {
    historiesRef.current = histories
  }, [histories])

  // 页面刷新或者用户账号登出时保存 histories
  useEffect(() => {
    function saveHistories() {
      if (logined) {
        localStorage.setItem('history', JSON.stringify(historiesRef.current))
      }
    }
    // 刷新页面时
    window.onbeforeunload = () => {
      saveHistories() // 缓存历史记录
    }
    // 退出登录时
    return () => saveHistories()
  }, [logined, historiesRef])

  // 初始化 histories 数据
  useEffect(() => {
    function init() {
      const histories: IHistoryItem[] = []

      // 获取当前的历史记录
      const localHistoryStr = localStorage.getItem('history') || '[]'
      const localHistory: IHistoryItem[] = JSON.parse(localHistoryStr)

      localHistory.forEach(item => {
        let findResult: IRouterItem
        if (item.stageId) {
          findResult = getStageByName(item.stageId)
        } else {
          findResult = getStageByRoute(item.routePath)
        }
        if (!findResult) {
          return
        }
        histories.push({
          ...item,
          stageId: findResult.name,
        })
      })

      if (
        histories.length === 0 ||
        !histories.some(item => item.routePath === pathname)
      ) {
        // ReuseTab 为空或者匹配不到当前路由时加入当前路由的数据
        changeRoute(stageConfig)
      } else {
        // 其他情况直接更新 histories 数据
        dispatch(changeReuseTab(histories))
      }
    }
    init()
  }, []) // eslint-disable-line

  // 路由切换时同步 Reuse 显示情况
  useEffect(() => {
    // stageConfig.route 和 pathname 一致时执行，避免删除时重新执行生成新的 tab
    if (stageConfig && stageConfig.route === pathname) {
      changeRoute(stageConfig)
    }
  }, [changeRoute, stageConfig, pathname])

  function close(ev: MouseEvent, index: number) {
    ev.stopPropagation()
    // 检测是否是当前页, 如果是当前页则自动切换路由
    if (pathname === histories[index].routePath) {
      if (index > 0) {
        const { routePath } = histories[index - 1]
        routePath && history.push(routePath)
      } else if (histories.length > 1) {
        const { routePath } = histories[1]
        routePath && history.push(routePath)
      } else {
        history.push(defaultRoute)
      }
    }
    // 删除该历史记录
    const _histories = [...histories]
    _histories.splice(index, 1)
    dispatch(changeReuseTab(_histories))
  }

  function onLinkClick(route: string) {
    if (pathname !== route) {
      history.push(route)
    }
  }

  const visible = histories.length > 1

  return (
    <div className='reuse-tab-container' r-if={visible}>
      <Swiper parameters={swiperParameters}>
        {histories.map((item: IHistoryItem, index) => {
          const { stageId, icon, title } = item
          const stageItem: IRouterItem =
            stageId && stageList[stageId] ? stageList[stageId] : {}
          const { route } = stageItem
          return route ? (
            <div className='swiper-slide reuse-tab-item' key={index}>
              {/* 这里用 NavLink 的话删除 Tab 的逻辑会出错 */}
              <div
                className={`link ${pathname === route && 'active'}`}
                onClick={() => onLinkClick(route)}
              >
                <Icon type={icon} style={{ fontSize: '16px' }} />
                <span style={{ padding: '0 5px' }}>
                  {Utils.cutString(title, 8)}
                </span>
                <span className='icon-close' onClick={ev => close(ev, index)}>
                  <Icon className='icon-close-icon' type='close' />
                </span>
              </div>
            </div>
          ) : (
            <div key={index}></div> // 这样写用于解决 Swiper 组件的 ts 报错
          )
        })}
      </Swiper>
    </div>
  )
}
