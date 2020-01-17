import { post, get, put } from '@/lin/plugins/axios'
import { saveTokens } from '../utils/token'
import { IOriginalAuths } from '@/store/redux/app.redux'

export interface IUserToken {
  access_token: string
  refresh_token: string
}

export interface IUserInformation {
  active: number
  admin: number
  auths: IOriginalAuths[]
  avatar: string | null
  create_time: number
  email: string | null
  group_id: number | null
  id: number
  nickname: string | null
  update_time: number
  username: string
  groupName?: string | undefined
}

const SUPER_VALUE = 2
const ACTIVE_VALUE = 1

export default class User {
  // 当前用户是否在激活状态
  isActive: boolean

  // 邮箱
  // email: string | null = null

  // 权限分组id
  // groupId: number = null

  // 用户名
  // username: string = null

  // 是否为超级管理员
  isSuper: boolean

  // 用户头像
  // avatar: string | null = null

  // 拥有的权限
  // auths: IOriginalAuths[] = []

  // 昵称
  // nickname: string | null = null

  // 分组名称
  // groupName: string | null = null

  constructor(
    active: number,
    readonly email: string | null, // 邮箱
    readonly groupId: number | null, // 权限分组id
    readonly username: string, // 用户名
    _super: number,
    readonly avatar: string | null, // 用户头像
    readonly auths: IOriginalAuths[], // 拥有的权限
    readonly nickname: string | null, // 昵称
    readonly groupName: string | undefined, // 分组名称
  ) {
    this.isActive = active === ACTIVE_VALUE
    // this.email = email
    // this.groupId = groupId
    // this.username = username
    // this.avatar = avatar
    this.isSuper = _super === SUPER_VALUE
    // this.auths = auths || []
    // this.nickname = nickname
    // this.groupName = groupName
  }

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
  static async getInformation(): Promise<User> {
    const info: IUserInformation = await get('cms/user/information')
    return new User(
      info.active,
      info.email,
      info.group_id,
      info.username,
      info.admin,
      info.avatar,
      info.auths,
      info.nickname,
      info.groupName,
    )
  }

  /**
   * 获取当前用户信息和所拥有的权限
   */
  static async getAuths(): Promise<User> {
    const info: IUserInformation = await get('cms/user/auths')
    return new User(
      info.active,
      info.email,
      info.group_id,
      info.username,
      info.admin,
      info.avatar,
      info.auths,
      info.nickname,
      info.groupName,
    )
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
