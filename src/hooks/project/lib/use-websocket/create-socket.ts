import { MutableRefObject } from 'react'
import { sharedWebSockets, ReadyState } from './globals'
import { ReadyStateState } from './types'

export const createSocket = (
  webSocketRef: MutableRefObject<WebSocket | null>,
  url: string,
  setReadyState: (callback: (prev: ReadyStateState) => ReadyStateState) => void,
) => {
  if (sharedWebSockets[url] === undefined) {
    setReadyState(prev =>
      Object.assign({}, prev, { [url]: ReadyState.CONNECTING }),
    )
    sharedWebSockets[url] = new WebSocket(url)
  }
  webSocketRef.current = sharedWebSockets[url] || null
}
