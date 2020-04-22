import { MutableRefObject } from 'react'
import { sharedWebSockets, ReadyState } from './globals'
import { Options, ReadyStateState, SendMessage } from './types'

interface Setters {
  setLastMessage: (message: WebSocketEventMap['message']) => void
  setReadyState: (callback: (prev: ReadyStateState) => ReadyStateState) => void
}

type Subscriber = {
  setLastMessage: (message: WebSocketEventMap['message']) => void
  setReadyState: (callback: (prev: ReadyStateState) => ReadyStateState) => void
  options: Options
  reconnect: () => void
  id: string
}

type Subscribers = {
  [url: string]: Subscriber[] | undefined
}

const subscribers: Subscribers = {}

export const attachListeners = (
  wsInstance: WebSocket,
  url: string,
  setters: Setters,
  options: Options,
  reconnect: () => void,
  reconnectCount: MutableRefObject<number>,
  expectClose: MutableRefObject<boolean>,
  sendMessage: SendMessage,
): (() => void) => {
  const { setLastMessage, setReadyState } = setters
  let reconnectTimeout: NodeJS.Timer

  if (subscribers[url] === undefined) {
    subscribers[url] = []

    // onopen
    wsInstance.onopen = (event: WebSocketEventMap['open']) => {
      reconnectCount.current = 0
      subscribers[url]?.forEach(subscriber => {
        if (expectClose.current === false) {
          subscriber.setReadyState(prev =>
            Object.assign({}, prev, { [url]: ReadyState.OPEN }),
          )
        }
        if (subscriber.options.onOpen) {
          subscriber.options.onOpen(event, sendMessage)
        }
      })
    }

    // onmessage
    wsInstance.onmessage = (message: WebSocketEventMap['message']) => {
      if (
        typeof options.filter === 'function' &&
        options.filter(message) !== true
      ) {
        return
      }
      subscribers[url]?.forEach(subscriber => {
        subscriber.setLastMessage(message)

        if (subscriber.options.onMessage) {
          subscriber.options.onMessage(message)
        }
      })
    }

    // onclose
    wsInstance.onclose = (event: WebSocketEventMap['close']) => {
      const {
        reconnectAttempts = 0,
        reconnectInterval = 0,
        shouldReconnect,
      } = options

      subscribers[url]?.forEach(subscriber => {
        if (expectClose.current === false) {
          subscriber.setReadyState(prev =>
            Object.assign({}, prev, { [url]: ReadyState.CLOSED }),
          )
        }
        if (subscriber.options.onClose) {
          subscriber.options.onClose(event)
        }
      })

      sharedWebSockets[url] = undefined
      const subscribersToReconnect = [...subscribers[url]]
      subscribers[url] = undefined

      if (!shouldReconnect) {
        return
      }
      if (
        shouldReconnect === true ||
        (typeof shouldReconnect === 'function' && shouldReconnect(event))
      ) {
        if (reconnectCount.current < reconnectAttempts) {
          if (expectClose.current === false) {
            console.log(`Auto Reconnecting...${reconnectCount.current}...`)
            reconnectTimeout = setTimeout(() => {
              reconnectCount.current++

              subscribersToReconnect.forEach(subscriber => {
                subscriber.reconnect()
              })
            }, reconnectInterval)
          }
        } else {
          console.error(
            `Max reconnect attempts of ${reconnectAttempts} exceeded`,
          )
        }
      }
    }

    // onerror
    wsInstance.onerror = (error: WebSocketEventMap['error']) => {
      subscribers[url]?.forEach(subscriber => {
        if (subscriber.options.onError) {
          subscriber.options.onError(error)
        }
      })
    }
  } else {
    // 为当前 wsInstance 设置已存在的相同 url 对应的 readyState
    setReadyState(prev =>
      Object.assign({}, prev, { [url]: sharedWebSockets[url]?.readyState }),
    )
  }

  const subscriber = {
    setLastMessage,
    setReadyState,
    options,
    reconnect,
    id: Math.random()
      .toFixed(10)
      .substring(2),
  }

  subscribers[url]?.push(subscriber)

  // console.log('subscriber', subscriber)
  // console.log('subscribers', subscribers)

  return () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout)

    const subsArr = subscribers[url]

    if (subsArr && subsArr.length > 0) {
      const index = subsArr.indexOf(subscriber)
      if (index === -1) {
        return
      }
      if (subsArr.length === 1) {
        subsArr[0].setReadyState(prev =>
          Object.assign({}, prev, { [url]: ReadyState.CLOSING }),
        )
        wsInstance.close()
      } else {
        subsArr.splice(index, 1)
      }
    }
  }
}
