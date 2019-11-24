import * as types from '../actions/action-types'

export function updateRoute(pathname) {
  return {
    type: types.UPDATE_ROUTE,
    payload: pathname
  }
}

export function clearRoute() {
  return {
    type: types.CLEAR_ROUTE
  }
}

export function setUserAndState(user) {
  return {
    type: types.SET_USER_AND_STATE,
    payload: user
  }
}

export function setUserAuths(auths) {
  return {
    type: types.SET_USER_AUTHS,
    payload: auths
  }
}

export function setRefreshOption(option) {
  return {
    type: types.SET_REFRESH_OPTION,
    payload: option
  }
}

export function loginOut() {
  return {
    type: types.REMOVE_LOGINED
  }
}

export function changeReuseTab(history) {
  return {
    type: types.CHANGE_REUSE_TAB,
    payload: history
  }
}