// DatePicker 等 antd 组件需要用到 Moment 接口
export { Moment } from '../../node_modules/moment/moment'

export interface IRouterItem {
  title: string
  type: string
  name: string | symbol | null
  route: string | null
  filePath: string
  inNav: boolean
  icon: string
  order?: number | null
  permission?: string[]
  children?: IRouterItem[]
}
