import { MutableRefObject } from 'react'
import { sharedWebSockets, ReadyState } from './globals'
import { ReadyStateState } from './types'

export const createSocket = (
  webSocketRef: MutableRefObject<WebSocket | null>,
  url: string,
  setReadyState: (callback: (readyState: ReadyStateState) => void) => void,
) => {
  if (sharedWebSockets[url] === undefined) {
    setReadyState(readyState => {
      readyState[url] = ReadyState.CONNECTING
    })
    sharedWebSockets[url] = new WebSocket(url)
  }
  webSocketRef.current = sharedWebSockets[url] || null
}
