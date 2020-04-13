import { post, get, put } from '@/lin/plugins/axios'
import { saveTokens } from '../utils/token'
import { store } from '@/store/index'

import { IUserType } from '@/types/store'
import { IUserToken, IUserInformation } from '@/types/model'

// const SUPER_VALUE = 2
// const ACTIVE_VALUE = 1

export default class User {
  // 当前用户是否在激活状态
  // isActive: boolean

  // 邮箱
  // email: string | null = null

  // 权限分组id
  // groupId: number = null

  // 用户名
  // username: string = null

  // 是否为超级管理员
  // isSuper: boolean

  // 用户头像
  // avatar: string | null = null

  // 拥有的权限
  // auths: IOriginalPermissions[] = []

  // 昵称
  // nickname: string | null = null

  // 分组名称
  // groupName: string | null = null

  // constructor(
  //   // _super: number,
  //   // readonly auths: IOriginalPermissions[], // 拥有的权限
  //   // readonly groupName: string | undefined, // 分组名称
  //   readonly nickname: string | null, // 昵称
  //   readonly username: string, // 用户名
  //   readonly admin: boolean,
  //   readonly groups: any[], // 所属分组信息
  //   readonly permissions: IOriginalPermissions[], // 拥有的权限
  //   readonly email: string | null, // 邮箱
  //   readonly avatar: string | null, // 用户头像 // active: number, // readonly groupId: number | null, // 权限分组id
  // ) {
  //   this.isSuper = admin
  //   // this.isActive = active === ACTIVE_VALUE
  //   // this.email = email
  //   // this.groupId = groupId
  //   // this.groupId = groupId
  //   // this.username = username
  //   // this.avatar = avatar
  //   // this.auths = auths || []
  //   // this.nickname = nickname
  //   // this.groupName = groupName
  // }

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
    const storeUser =
      store.getState().app.user === null ? {} : store.getState().app.user

    return Object.assign({ ...storeUser }, info)
  }

  /**
   * 获取当前用户信息和所拥有的权限
   */
  static async getPermissions(): Promise<IUserType> {
    const info: IUserInformation = await get('cms/user/permissions')
    const storeUser =
      store.getState().app.user === null ? {} : store.getState().app.user

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
