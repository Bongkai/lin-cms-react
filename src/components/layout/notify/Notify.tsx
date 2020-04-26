import React from 'react'
import { useSelector } from 'react-redux'
import { Dropdown, Badge } from 'antd'
import { WarningFilled, BellOutlined } from '@ant-design/icons'
import NotifyOverlay from './NotifyOverlay'
// import { useWebSocket } from '@/hooks/project/useWebSocket'
// import { addUnreadMessage } from '@/store/actions/app.actions'

import { IStoreState, IAppState } from '@/types/store'

import './style/notify.scss'

export default function Notify() {
  const { unreadMessages } = useSelector<IStoreState, IAppState>(
    state => state.app,
  )
  // const dispatch = useDispatch()

  // const { message, readyState } = useWebSocket()

  // useEffect(() => {
  //   message && dispatch(addUnreadMessage(JSON.parse(message.data)))
  // }, [message]) // eslint-disable-line

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
