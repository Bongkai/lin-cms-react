import * as types from './action-types'
import { IUserType, IOriginalAuths, IHistoryItem } from '../redux/app.redux'

export type IAction =
  | UpdateRoute
  | ClearRoute
  | SetUserAndState
  | SetUserAuths
  // | SetRefreshOption
  | LoginOut
  | ChangeReuseTab

export interface UpdateRoute {
  type: types.UPDATE_ROUTE
  payload: string
}
export function updateRoute(pathname: string): UpdateRoute {
  return {
    type: types.UPDATE_ROUTE,
    payload: pathname,
  }
}

export interface ClearRoute {
  type: types.CLEAR_ROUTE
}
export function clearRoute(): ClearRoute {
  return {
    type: types.CLEAR_ROUTE,
  }
}

export interface SetUserAndState {
  type: types.SET_USER_AND_STATE
  payload: IUserType
}
export function setUserAndState(user: IUserType): SetUserAndState {
  return {
    type: types.SET_USER_AND_STATE,
    payload: user,
  }
}

export interface SetUserAuths {
  type: types.SET_USER_AUTHS
  payload: IOriginalAuths[]
}
export function setUserAuths(auths: IOriginalAuths[]): SetUserAuths {
  return {
    type: types.SET_USER_AUTHS,
    payload: auths,
  }
}

// export interface SetRefreshOption {
//   type: types.SET_REFRESH_OPTION,
//   payload: any,
// }
// export function setRefreshOption(option): SetRefreshOption {
//   return {
//     type: types.SET_REFRESH_OPTION,
//     payload: option,
//   }
// }

export interface LoginOut {
  type: types.REMOVE_LOGINED
}
export function loginOut(): LoginOut {
  return {
    type: types.REMOVE_LOGINED,
  }
}

export interface ChangeReuseTab {
  type: types.CHANGE_REUSE_TAB
  payload: IHistoryItem[]
}
export function changeReuseTab(histories: IHistoryItem[]): ChangeReuseTab {
  return {
    type: types.CHANGE_REUSE_TAB,
    payload: histories,
  }
}
