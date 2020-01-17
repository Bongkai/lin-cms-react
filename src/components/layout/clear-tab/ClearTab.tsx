import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Icon } from 'antd'
import { changeReuseTab } from '@/store/actions/app.actions'
import { IStoreState } from '@/store'
import { IHistoryItem } from '@/store/redux/app.redux'
import { IRouterItem } from '@/config/stage'

import './clear-tab.scss'

export default function ClearTab() {
  const config = useSelector<IStoreState, IRouterItem>(
    state => state.app.currentRoute.config,
  )
  const reuseLength = useSelector<IStoreState, IHistoryItem[]>(
    state => state.app.histories,
  ).length
  const dispatch = useDispatch()

  function clearAllHistories() {
    const ele = {} as IHistoryItem
    ele.stageId = config.name
    ele.routePath = config.route
    ele.title = config.title
    ele.icon = config.icon
    dispatch(changeReuseTab([ele]))
  }

  return reuseLength > 1 ? (
    <div
      className='clear-icon'
      title='关闭全部历史记录'
      onClick={clearAllHistories}
    >
      <Icon type='delete' style={{ fontSize: '20px' }} />
    </div>
  ) : null
}
