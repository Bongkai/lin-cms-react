import { Options } from './types'

// options 默认配置（会被外部 options 覆盖对应的字段）
export const DEFAULT_OPTIONS: Options = {
  shouldReconnect: false,
  reconnectInterval: 5000,
  reconnectAttempts: 20,
}
