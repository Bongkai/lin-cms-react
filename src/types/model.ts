import { Method } from 'axios'
import { IOriginalPermissions } from './store'

// ----- admin -----

export interface IAllPermissions {
  [propName: string]: IPermissionItem[]
}

export interface IPermissionItem {
  id: number
  name: string
  module: string
}

export interface IGroupItem {
  id: number
  info: string
  name: string
}

export interface IGroupItemWithPermissions extends IGroupItem {
  permissions: IPermissionItem[]
}

export interface IAdminUsers {
  count: number
  items: IAdminUserItem[]
  page: number
  total: number
  total_page: number
}

export interface IAdminUserItem {
  active: number
  admin: number
  avatar: string | null
  create_time: number
  email: string | null
  groups: IGroupItem[] // 接口获取的数据中的 group_ids 的原始字段
  group_ids: IGroupItem[]
  groupNames: string
  id: number
  nickname: string | null
  username: string
}

export interface IResponseWithoutData {
  code: number
  message: string
  request: string
}

// ----- user -----

export interface IUserToken {
  access_token: string
  refresh_token: string
}

export interface IUserInformation {
  nickname: string | null
  username: string
  admin: boolean
  groups: any[]
  permissions: IOriginalPermissions[]
  email: string | null
  avatar: string | null
}

// ----- log -----

export interface ILogUsers {
  total: number
  items: string[]
  page: number
  count: number
}

export interface ILogsInfo {
  count: number
  items: ILogItem[]
  page: number
  total: number
  total_page: number
}

export interface ILogItem {
  authority: string
  id: number
  message: string
  method: Method
  path: string
  status_code: number
  time: number
  user_id: number
  username: string
}
