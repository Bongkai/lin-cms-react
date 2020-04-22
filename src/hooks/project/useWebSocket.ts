/* Author: https://github.com/robtaussig/react-use-websocket */
/* Version: 1.7.3 */

import { useMemo } from 'react'
import { useWebSocket as _useWebSocket } from './lib/use-websocket/use-websocket'
import { DEFAULT_OPTIONS } from './lib/use-websocket/config'
import { Options, SendMessage } from './lib/use-websocket/types'
import { ReadyState } from './lib/use-websocket/globals'
import Config from '@/config'
import { getToken } from '@/lin/utils/token'

export { Options, SendMessage, ReadyState }

// 项目的默认 WebSocket url
// const MAIN_URL = 'wss://echo.websocket.org'
const MAIN_URL = `${Config.baseWebSocketURL}/ws/message?token=${
  getToken('access_token')?.split(' ')[1]
}`

// 项目的 WebSocket 主要配置
const MAIN_OPTIONS = {
  shouldReconnect: true,
}

export const useWebSocket = (
  ...args: [(string | (() => string | Promise<string>) | null)?, Options?]
) => {
  const url = args[0] || MAIN_URL || null

  // STATIC_OPTIONS
  const options = useMemo(() => {
    return Object.assign(DEFAULT_OPTIONS, args[1] || MAIN_OPTIONS)
  }, []) // eslint-disable-line

  return _useWebSocket(url, options)
}
