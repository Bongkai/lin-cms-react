import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Icon } from 'antd'
import { changeReuseTab } from '@/store/actions/app.actions'

import { IStoreState, IHistoryItem } from '@/types/store'
import { IRouterItem } from '@/types/project'

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

  return (
    <div
      className='clear-icon'
      title='关闭全部历史记录'
      onClick={clearAllHistories}
      r-if={reuseLength > 1}
    >
      <Icon type='delete' style={{ fontSize: '20px' }} />
    </div>
  )
}
