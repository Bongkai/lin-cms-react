import { useEffect, useRef, useState, useCallback } from 'react'
import { attachListeners } from './attach-listener'
import { createSocket } from './create-socket'
import websocketWrapper from './proxy'
import {
  Options,
  ReadyStateState,
  SendMessage,
  WebSocketMessage,
  IJSON,
} from './types'
import { isValidData, getType, ReadyState } from './globals'
import { DEFAULT_OPTIONS } from './config'

export const useWebSocket = (
  url: string | (() => string | Promise<string>) | null,
  options: Options = DEFAULT_OPTIONS,
): {
  send: SendMessage
  message: WebSocketEventMap['message'] | null
  readyState: ReadyState
  connect: () => void
  wsInstance: WebSocket | null
} => {
  // onmessage 事件收到的消息对象
  const [lastMessage, setLastMessage] = useState<
    WebSocketEventMap['message'] | null
  >(null)
  // 多个 ws 实例的 readyState 集合
  const [readyState, setReadyState] = useState<ReadyStateState>({})
  // ws 连接的最终 url
  const convertedUrl = useRef<string | null>(null)
  // 原始 ws 实例
  const webSocketRef = useRef<WebSocket | null>(null)
  // 经过 Proxy 包装的 ws 实例
  const webSocketProxy = useRef<WebSocket | null>(null)
  // 连接/重连的方法
  const startRef = useRef<() => void>(() => {})
  const reconnectCount = useRef<number>(0)
  // 消息队列，当指定 ws 不处于连接状态时储存待发送数据，等到连接时再发送
  const messageQueue = useRef<(WebSocketMessage | IJSON)[]>([])
  // 该 ws 是否处于关闭状态，为 true 时限制某些操作
  const expectClose = useRef<boolean>(false)

  // 当前 url 对应的 wsInstance 的 readyState
  const readyStateFromUrl =
    convertedUrl.current && readyState[convertedUrl.current] !== undefined
      ? readyState[convertedUrl.current]
      : url !== null
      ? ReadyState.CONNECTING
      : ReadyState.UNINSTANTIATED

  // 封装 WebSocket.send 方法
  const sendMessage: SendMessage = useCallback(message => {
    // 检验数据格式
    const type = getType(message)
    if (!isValidData(type)) {
      console.warn(
        "The data format you pass to useWebSocket's send method is invalid",
      )
      return
    }

    const wsInstance = webSocketRef.current
    if (wsInstance && wsInstance.readyState === ReadyState.OPEN) {
      if (type === '[object Object]') {
        // 对 json 格式数据处理后再发送
        wsInstance.send(JSON.stringify(message))
      } else {
        wsInstance.send(message as WebSocketMessage)
      }
    } else {
      // 放进消息队列
      messageQueue.current.push(message)
    }
  }, []) // eslint-disable-line

  // 获取 ws 实例
  const getWebSocket = useCallback(() => {
    if (webSocketProxy.current === null && webSocketRef.current !== null) {
      webSocketProxy.current = websocketWrapper(webSocketRef.current)
    }
    return webSocketProxy.current
  }, [])

  // 主流程：根据 url 创建 wsInatance
  useEffect(() => {
    if (url !== null) {
      let removeListeners: () => void

      const start = async () => {
        expectClose.current = false

        // 处理 url
        if (typeof url === 'function') {
          convertedUrl.current = await url()
        } else {
          convertedUrl.current = url
        }

        // 创建 wsInstance
        createSocket(webSocketRef, convertedUrl.current, setReadyState)

        // 监听 on 事件
        if (webSocketRef.current !== null) {
          removeListeners = attachListeners(
            webSocketRef.current,
            convertedUrl.current,
            {
              setLastMessage,
              setReadyState,
            },
            options,
            startRef.current,
            reconnectCount,
            expectClose,
            sendMessage,
          )
        }
      }

      startRef.current = () => {
        expectClose.current = true
        if (webSocketProxy.current) webSocketProxy.current = null
        removeListeners?.()
        start()
      }

      start()
      return () => {
        expectClose.current = true
        if (webSocketProxy.current) webSocketProxy.current = null
        removeListeners?.()
      }
    }
  }, [url]) // eslint-disable-line

  // ws 连接成功后发送消息队列中的待发送数据
  useEffect(() => {
    if (readyStateFromUrl === ReadyState.OPEN) {
      messageQueue.current.splice(0).forEach(message => {
        sendMessage(message)
      })
    }
  }, [readyStateFromUrl]) // eslint-disable-line

  return {
    send: sendMessage,
    message: lastMessage,
    readyState: readyStateFromUrl,
    connect: startRef.current,
    wsInstance: getWebSocket(),
  }
}
