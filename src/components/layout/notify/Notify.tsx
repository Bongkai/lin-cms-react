import React from 'react'
import { useSelector } from '@/store'
import { Dropdown, Badge } from 'antd'
import { WarningFilled, BellOutlined } from '@ant-design/icons'
import NotifyOverlay from './NotifyOverlay'
// import { useWebSocket } from '@/hooks/project/useWebSocket'
// import { addUnreadMessage } from '@/store/mutations/app.mutations'

import './style/notify.scss'

export default function Notify() {
  const unreadMessages = useSelector(state => state.app.unreadMessages)
  // const { message, readyState } = useWebSocket()

  // useEffect(() => {
  //   message && commitMutation(addUnreadMessage(JSON.parse(message.data)))
  // }, [message]) // eslint-disable-line

  // ws 连接异常时的 warning 图标组件
  const WarningIcon = (
    <WarningFilled
      title='消息中心已离线，请刷新页面'
      style={{ color: 'red', fontSize: 18 }}
    />
  )

  // const isWsOffline = readyState > 1
  const isWsOffline = false
  const length = unreadMessages.length

  return (
    <div className='notify-container'>
      <Dropdown
        overlay={<NotifyOverlay messages={unreadMessages} />}
        placement='bottomRight'
        trigger={['click']}
      >
        <Badge
          count={isWsOffline ? WarningIcon : length}
          overflowCount={9}
          title={`你有${length}条未读消息`}
        >
          <BellOutlined style={{ fontSize: 20 }} />
        </Badge>
      </Dropdown>
    </div>
  )
}
