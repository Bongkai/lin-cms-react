import React from 'react'
import { useSelector, commitMutation } from '@/store'
import { DeleteOutlined } from '@ant-design/icons'
import { changeReuseTab } from '@/store/mutations/app.mutations'

import { IHistoryItem } from '@/types/store'

import './clear-tab.scss'

export default function ClearTab() {
  const config = useSelector(state => state.app.currentRoute.config)
  const histories = useSelector(state => state.app.histories)
  const reuseLength = histories.length

  function clearAllHistories() {
    const ele = {} as IHistoryItem
    ele.stageId = config.name
    ele.routePath = config.route
    ele.title = config.title
    ele.icon = config.icon
    commitMutation(changeReuseTab([ele]))
  }

  return (
    <div
      className='clear-icon'
      title='关闭全部历史记录'
      onClick={clearAllHistories}
      r-if={reuseLength > 1}
    >
      <DeleteOutlined style={{ fontSize: '20px' }} />
    </div>
  )
}
