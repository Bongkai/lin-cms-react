import AppConfig from '@/config/index' // 引入项目配置
import stageConfig from '@/config/stage' // 引入舞台配置

import { IAppState, IUserType } from '@/types/store'
import { IRouterItem } from '@/types/project'

// 初始 app state
export const appState: IAppState = {
  logined: false, // 是否登录
  user: {} as IUserType, // 当前用户
  sideBarLevel: AppConfig.sideBarLevel || 3,
  defaultRoute: AppConfig.defaultRoute || '/',

  // 推送消息
  readedMessages: [],
  unreadMessages: [],

  // 用户权限
  permissions: [], // 每个用户的所有权限

  // 舞台配置
  stageConfig,

  // 当前页信息
  currentRoute: {
    config: {} as IRouterItem,
    treePath: [],
  },

  // ReuseTab 的数据
  histories: [],
}
