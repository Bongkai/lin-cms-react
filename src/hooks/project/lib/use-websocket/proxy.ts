// prettier-ignore
type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B

// prettier-ignore
type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T]

export const websocketWrapper = (webSocket: WebSocket): WebSocket => {
  return new Proxy<WebSocket>(webSocket, {
    get: (wsInstance, key: keyof WebSocket) => {
      const val = wsInstance[key]

      // 阻止直接在 wsInstance 对象上获取方法来使用
      if (typeof val === 'function') {
        console.error(
          'Calling methods directly on the websocket is not supported at this moment. You must use the methods returned by useWebSocket.',
        )

        // Prevent error thrown by invoking a non-function
        return () => {}
      } else {
        return val
      }
    },
    set: (wsInstance: WebSocket, key: WritableKeys<WebSocket>, val: any) => {
      // 阻止直接对 wsInatance 赋值 on 事件
      if (/^on/.test(key)) {
        console.warn(
          "The websocket's event handlers should be defined through the options object passed into useWebSocket.",
        )
        return false
      } else {
        wsInstance[key] = val
        return true
      }
    },
  })
}

export default websocketWrapper
