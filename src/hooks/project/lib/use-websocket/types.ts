import { ReadyState } from './globals'

export interface Options {
  // 自定义监听事件
  onOpen?: (event: WebSocketEventMap['open'], sendMessage: SendMessage) => void
  onClose?: (event: WebSocketEventMap['close']) => void
  onMessage?: (event: WebSocketEventMap['message']) => void
  onError?: (event: WebSocketEventMap['error']) => void

  shouldReconnect?: boolean | ((event: WebSocketEventMap['close']) => boolean)
  reconnectInterval?: number
  reconnectAttempts?: number
  filter?: (message: WebSocketEventMap['message']) => boolean
}

export type ReadyStateState = {
  [url: string]: ReadyState
}

export interface IJSON {
  [key: string]: any
}

export type WebSocketMessage =
  | string
  | ArrayBuffer
  | SharedArrayBuffer
  | Blob
  | ArrayBufferView

export type SendMessage = (message: WebSocketMessage | IJSON) => void
