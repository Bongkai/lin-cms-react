import { post, get, put } from '@/lin/plugins/axios'
import { saveTokens } from '../utils/token'
import { store } from '@/store/index'

import { IUserType } from '@/types/store'
import { IUserToken, IUserInformation } from '@/types/model'

export default class User {
  /**
   * 分配用户
   * @param {object} data 注册信息
   */
  static register(data: any): Promise<any> {
    return post('cms/user/register', data, { handleError: true })
  }

  /**
   * 登陆获取tokens
   * @param {string} username 用户名
   * @param {string} password 密码
   */
  static async getToken(
    username: string,
    password: string,
  ): Promise<IUserToken> {
    const tokens: IUserToken = await post('cms/user/login', {
      username,
      password,
    })
    saveTokens(tokens.access_token, tokens.refresh_token)
    return tokens
  }

  /**
   * 获取当前用户信息，并返回User实例
   */
  static async getInformation(): Promise<IUserType> {
    const info: IUserInformation = await get('cms/user/information')
    const storeUser = store.getState().app.user || {}

    return Object.assign({ ...storeUser }, info)
  }

  /**
   * 获取当前用户信息和所拥有的权限
   */
  static async getPermissions(): Promise<IUserType> {
    const info: IUserInformation = await get('cms/user/permissions')
    const storeUser = store.getState().app.user || {}

    return Object.assign({ ...storeUser }, info)
  }

  /**
   * 用户修改密码
   * @param {string} newPassword 新密码
   * @param {string} confirmPassword 确认新密码
   * @param {string} oldPassword 旧密码
   */
  static updatePassword({
    old_password,
    new_password,
    confirm_password,
  }: {
    old_password: string
    new_password: string
    confirm_password: string
  }): Promise<any> {
    return put('cms/user/change_password', {
      new_password,
      confirm_password,
      old_password,
    })
  }
}
