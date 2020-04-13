import { removeToken } from '@/lin/utils/token'
import { getStageInfo } from '../getters/app.getters'
import * as types from '../actions/action-types'
import AppConfig from '@/config/index' // 引入项目配置
import stageConfig from '@/config/stage' // 引入舞台配置
import Config from '@/config/index'
import { IAction } from '../actions/app.actions'

import { IAppState, IUserType, IOriginalPermissions } from '@/types/store'
import { IRouterItem } from '@/types/project'

// 初始 state
const initState: IAppState = {
  logined: false, // 是否登录
  user: {} as IUserType, // 当前用户
  sideBarLevel: AppConfig.sideBarLevel || 3,
  defaultRoute: AppConfig.defaultRoute || '/',

  // 推送消息
  // readedMessages: [],
  // unreadMessages: [],
  permissions: [], // 每个用户的所有权限

  // 舞台配置
  stageConfig,

  // refreshOptions: {},

  // 当前页信息
  currentRoute: {
    config: {} as IRouterItem,
    treePath: [],
  },

  // ReuseTab 的数据
  histories: [],
}

export function app(state: IAppState = initState, action: IAction): IAppState {
  switch (action.type) {
    case types.UPDATE_ROUTE:
      const stageInfo = getStageInfo(state)(action.payload)
      return {
        ...state,
        currentRoute: {
          config: stageInfo[stageInfo.length - 1],
          treePath: stageInfo,
        },
      }
    case types.CLEAR_ROUTE:
      return {
        ...state,
        currentRoute: {
          config: {} as IRouterItem,
          treePath: [],
        },
      }
    case types.SET_USER_AND_STATE:
      return {
        ...state,
        logined: true,
        user: {
          ...action.payload,
          avatar: handleAvatar(action.payload.avatar),
        },
      }
    case types.SET_USER_PERMISSIONS:
      const permissions = handlePermissions(action.payload)
      return { ...state, permissions }
    // case types.SET_REFRESH_OPTION:
    //   return { ...state, refreshOptions: action.payload }
    case types.REMOVE_LOGINED:
      removeToken()
      return { ...state, logined: false }
    case types.CHANGE_REUSE_TAB:
      return { ...state, histories: action.payload }
    default:
      return state
  }
}

function handlePermissions(permissions: IOriginalPermissions[]): string[] {
  const _permissions: string[] = []
  for (let i = 0; i < permissions.length; i++) {
    for (const key in permissions[i]) {
      for (let j = 0; j < permissions[i][key].length; j++) {
        _permissions.push(permissions[i][key][j].permission)
      }
    }
  }
  return _permissions
}

function handleAvatar(avatar: string | null): string {
  return avatar?.startsWith('http')
    ? avatar
    : `${Config.baseURL}/assets/${avatar}`
}
