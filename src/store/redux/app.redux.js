import { removeToken } from 'lin/utils/token'
import { getStageInfo } from '../getters/app.getters'
import * as types from '../actions/action-types'
import AppConfig from '@/config/index' // 引入项目配置
import stageConfig from '@/config/stage' // 引入舞台配置


const initState = {
  logined: false, // 是否登录
  user: {}, // 当前用户
  sideBarLevel: AppConfig.sideBarLevel || 3,
  defaultRoute: AppConfig.defaultRoute || '/',

  // 推送消息
  readedMessages: [],
  unreadMessages: [],
  auths: [], // 每个用户的所有权限

  // 舞台配置
  stageConfig,

  refreshOptions: {},

  // 当前页信息
  currentRoute: {
    config: null,
    treePath: [],
  },

  // ReuseTab 的数据
  histories: []
}

export function app(state = initState, action) {
  switch(action.type) {
    case types.UPDATE_ROUTE:
      const stageInfo = getStageInfo(state)(action.payload)
      return {
        ...state,
        currentRoute: {
          config: stageInfo[stageInfo.length - 1],
          treePath: stageInfo
        }
      }
    case types.CLEAR_ROUTE:
      return {
        ...state,
        currentRoute: {
          config: null,
          treePath: [],
        }
      }
    case types.SET_USER_AND_STATE:
      return {
        ...state,
        logined: true,
        user: action.payload
      }
    case types.SET_USER_AUTHS:
      const auths = _handleAuths(action.payload)
      return { ...state, auths }
    case types.SET_REFRESH_OPTION:
      return { ...state, refreshOptions: action.payload }
    case types.REMOVE_LOGINED:
      removeToken()
      return { ...state, logined: false }
    case types.CHANGE_REUSE_TAB:
      return { ...state, histories: action.payload }
    default:
      return state
  }
}

function _handleAuths(auths) {
  const _auths = []
  for (let i = 0; i < auths.length; i++) {
    for (const key in auths[i]) {
      for (let j = 0; j < auths[i][key].length; j++) {
        _auths.push(auths[i][key][j].auth)
      }
    }
  }
  return _auths
}
