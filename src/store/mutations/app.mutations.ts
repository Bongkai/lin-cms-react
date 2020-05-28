import { removeToken } from '@/lin/utils/token'
import {
  getStageInfo,
  handleAvatar,
  handlePermissions,
} from '../getters/app.getters'
import * as types from './mutation-types'

import { IRouterItem } from '@/types/project'
import {
  IUserType,
  IOriginalPermissions,
  IHistoryItem,
  IMessage,
  IAppState,
} from '@/types/store'
import { Mutation } from 'dream-redux/types'

const target = 'app'

export const updateRoute = (pathname: string): Mutation => ({
  type: types.UPDATE_ROUTE,
  target,
  operation: (state: IAppState) => {
    const stageInfo = getStageInfo(state)(pathname)
    state.currentRoute = {
      config: stageInfo[stageInfo.length - 1],
      treePath: stageInfo,
    }
  },
})

export const clearRoute = (): Mutation => ({
  type: types.CLEAR_ROUTE,
  target,
  operation: (state: IAppState) => {
    state.currentRoute = {
      config: {} as IRouterItem,
      treePath: [],
    }
  },
})

export const setUserAndState = (user: IUserType): Mutation => ({
  type: types.SET_USER_AND_STATE,
  target,
  operation: (state: IAppState) => {
    user.avatar = handleAvatar(user.avatar)
    state.logined = true
    state.user = user
  },
})

export const setUserPermissions = (
  permissions: IOriginalPermissions[],
): Mutation => ({
  type: types.SET_USER_PERMISSIONS,
  target,
  operation: (state: IAppState) => {
    state.permissions = handlePermissions(permissions)
  },
})

export const loginOut = (): Mutation => ({
  type: types.REMOVE_LOGINED,
  target,
  operation: (state: IAppState) => {
    removeToken()
    state.logined = false
  },
})

export const changeReuseTab = (histories: IHistoryItem[]): Mutation => ({
  type: types.CHANGE_REUSE_TAB,
  target,
  operation: (state: IAppState) => {
    state.histories = histories
  },
})

export const addReadedMessage = (message: IMessage): Mutation => ({
  type: types.ADD_READED_MESSAGE,
  target,
  operation: (state: IAppState) => {
    state.readedMessages.push(message)
  },
})

export const addUnreadMessage = (message: IMessage): Mutation => ({
  type: types.ADD_UNREAD_MESSAGE,
  target,
  operation: (state: IAppState) => {
    state.unreadMessages.push(message)
  },
})

export const removeUnreadMessage = (messageId: number): Mutation => ({
  type: types.ADD_UNREAD_MESSAGE,
  target,
  operation: (state: IAppState) => {
    const index = state.unreadMessages.findIndex(item => item.id === messageId)
    state.unreadMessages.splice(index, 1)
  },
})
