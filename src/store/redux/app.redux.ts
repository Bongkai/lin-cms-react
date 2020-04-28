import { produce } from 'immer'
import { removeToken } from '@/lin/utils/token'
import { getStageInfo } from '../getters/app.getters'
import * as types from '../actions/action-types'
import AppConfig from '@/config/index' // 引入项目配置
import stageConfig from '@/config/stage' // 引入舞台配置
import Config from '@/config/index'

import {
  IAppState,
  IAction,
  IUserType,
  IOriginalPermissions,
} from '@/types/store'
import { IRouterItem } from '@/types/project'

// 初始 state
export const initState: IAppState = {
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

export function appReducer(state: IAppState = initState, action: IAction) {
  return produce(state, draft => {
    switch (action.type) {
      case types.UPDATE_ROUTE:
        const stageInfo = getStageInfo(draft)(action.payload)
        draft.currentRoute = {
          config: stageInfo[stageInfo.length - 1],
          treePath: stageInfo,
        }
        break

      case types.CLEAR_ROUTE:
        draft.currentRoute = {
          config: {} as IRouterItem,
          treePath: [],
        }
        break

      case types.SET_USER_AND_STATE:
        action.payload.avatar = handleAvatar(action.payload.avatar)
        draft.logined = true
        draft.user = action.payload
        break

      case types.SET_USER_PERMISSIONS:
        draft.permissions = handlePermissions(action.payload)
        break

      case types.REMOVE_LOGINED:
        removeToken()
        draft.logined = false
        break

      case types.CHANGE_REUSE_TAB:
        draft.histories = action.payload
        break

      case types.ADD_READED_MESSAGE:
        draft.readedMessages.push(action.payload)
        break

      case types.ADD_UNREAD_MESSAGE:
        draft.unreadMessages.push(action.payload)
        break

      case types.REMOVE_UNREAD_MESSAGE:
        const index = draft.unreadMessages.findIndex(
          item => item.id === action.payload,
        )
        draft.unreadMessages.splice(index, 1)
        break
    }
  })
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
