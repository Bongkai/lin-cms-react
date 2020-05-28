import { IRouterItem } from './project'
import { IGroupItem } from './model'

// ----- index -----

export interface IStoreState {
  app: IAppState
}

// ----- getter -----

export interface ISideBarListItem {
  icon: string
  name: symbol | string | null
  path: string | null
  title: string
  type?: string
  children?: ISideBarListItem[]
}

// ----- app -----

export interface IAppState {
  logined: boolean
  user: IUserType
  sideBarLevel: number
  defaultRoute: string
  readedMessages: IMessage[]
  unreadMessages: IMessage[]
  permissions: string[]
  stageConfig: IRouterItem[]
  currentRoute: {
    config: IRouterItem
    treePath: IRouterItem[]
  }
  histories: IHistoryItem[]
}

export interface IUserType {
  nickname: string | null | undefined
  username: string | null | undefined
  admin: boolean
  groups: IGroupItem[]
  permissions: IOriginalPermissions[]
  email: string | null
  avatar: string | null
}

export interface IOriginalPermissions {
  [propName: string]: IOriginalPermissionItem[]
}

export interface IOriginalPermissionItem {
  permission: string
  module: string
}

export interface IHistoryItem {
  icon: string
  routePath: string | null
  stageId: symbol | string | null
  title: string
}

export interface IMessage {
  is_read: boolean
  id: number
  time: string
  user: string
  content: string
}
