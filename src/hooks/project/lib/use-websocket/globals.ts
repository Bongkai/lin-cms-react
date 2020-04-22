export interface SharedWebSockets {
  [url: string]: WebSocket | undefined
}

export enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

// 符合要求的数据类型
const dataTypes = [
  '[object String]',
  '[object ArrayBuffer]',
  '[object SharedArrayBuffer]',
  '[object Blob]',
  '[object Object]',
]

// 全局 WebSockets 集合
export const sharedWebSockets: SharedWebSockets = {}

// 获取数据类型
export const getType = (value: any): string => {
  return Object.prototype.toString.call(value)
}

// 检验待发送的数据的类型是否符合要求
export const isValidData = (type: string): boolean => {
  return dataTypes.includes(type)
}
