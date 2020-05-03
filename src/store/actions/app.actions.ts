import * as types from './action-types'
import {
  IUserType,
  IOriginalPermissions,
  IHistoryItem,
  IMessage,
} from '@/types/store'

export function updateRoute(pathname: string) {
  return {
    type: types.UPDATE_ROUTE,
    payload: pathname,
  }
}

export function clearRoute() {
  return {
    type: types.CLEAR_ROUTE,
  }
}

export function setUserAndState(user: IUserType) {
  return {
    type: types.SET_USER_AND_STATE,
    payload: user,
  }
}

export function setUserPermissions(permissions: IOriginalPermissions[]) {
  return {
    type: types.SET_USER_PERMISSIONS,
    payload: permissions,
  }
}

export function loginOut() {
  return {
    type: types.REMOVE_LOGINED,
  }
}

export function changeReuseTab(histories: IHistoryItem[]) {
  return {
    type: types.CHANGE_REUSE_TAB,
    payload: histories,
  }
}

export function addReadedMessage(message: IMessage) {
  return {
    type: types.ADD_READED_MESSAGE,
    payload: message,
  }
}

export function addUnreadMessage(message: IMessage) {
  return {
    type: types.ADD_UNREAD_MESSAGE,
    payload: message,
  }
}

export function removeUnreadMessage(messageId: number) {
  return {
    type: types.REMOVE_UNREAD_MESSAGE,
    payload: messageId,
  }
}
