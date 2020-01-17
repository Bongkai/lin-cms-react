import { removeToken } from 'lin/utils/token'
import { getStageInfo } from '../getters/app.getters'
import * as types from '../actions/action-types'
import AppConfig from '@/config/index' // 引入项目配置
import stageConfig, { IRouterItem } from '@/config/stage' // 引入舞台配置
import { IAction } from '../actions/app.actions'

export interface IUserType {
  auths: IOriginalAuths[]
  avatar: string | null
  email: string | null
  groupId: number | null
  groupName: string | null | undefined
  isActive: boolean
  isSuper: boolean
  nickname: string | null
  username: string
}

export interface IOriginalAuths {
  [propName: string]: IOriginalAuthItem[]
}

export interface IOriginalAuthItem {
  auth: string
  module: string
}

export interface IHistoryItem {
  icon: string
  routePath: string | null
  stageId: symbol | string | null
  title: string
}

export interface IAppState {
  logined: boolean
  user: IUserType
  sideBarLevel: number
  defaultRoute: string
  // readedMessages: any[],
  // unreadMessages: any[],
  auths: string[]
  stageConfig: IRouterItem[]
  // refreshOptions: object,
  currentRoute: {
    config: IRouterItem
    treePath: IRouterItem[]
  }
  histories: IHistoryItem[]
}

// 初始 state
const initState: IAppState = {
  logined: false, // 是否登录
  user: {} as IUserType, // 当前用户
  sideBarLevel: AppConfig.sideBarLevel || 3,
  defaultRoute: AppConfig.defaultRoute || '/',

  // 推送消息
  // readedMessages: [],
  // unreadMessages: [],
  auths: [], // 每个用户的所有权限

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
        user: action.payload,
      }
    case types.SET_USER_AUTHS:
      const auths = handleAuths(action.payload)
      return { ...state, auths }
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

function handleAuths(_auths: IOriginalAuths[]): string[] {
  const auths: string[] = []
  for (let i = 0; i < _auths.length; i++) {
    for (const key in _auths[i]) {
      for (let j = 0; j < _auths[i][key].length; j++) {
        auths.push(_auths[i][key][j].auth)
      }
    }
  }
  return auths
}
