import { store } from '@/store'

import { IUserType } from '@/types/store'

interface IValue {
  permission: IPermission
}

type IPermission = string | string[]

function isAllowed(
  permission: IPermission,
  user: IUserType,
  permissions: string[],
): boolean {
  if (user.admin) {
    return true
  }
  if (typeof permission === 'string') {
    return permissions.includes(permission)
  }
  if (permission instanceof Array) {
    return permission.some(auth => permissions.indexOf(auth) >= 0)
  }
  return false
}

/**
 * 检查是否有权限进行操作，有权限则返回 true，否则返回 false
 * 功能类似 Vue 版的 v-permission
 *
 * @param value 权限等参数
 */
export function checkPermission(value: IValue) {
  let permission = value.permission
  // let type
  // if (Object.prototype.toString.call(value) === '[object Object]') {
  //   // eslint-disable-next-line prefer-destructuring
  //   permission = value.permission
  //   // eslint-disable-next-line prefer-destructuring
  //   type = value.type
  // } else {
  //   permission = value
  // }
  const { user, permissions } = store.getState().app
  const isAllow = isAllowed(permission, user, permissions)
  if (!isAllow && permission) {
    return false
  }
  return true
}
