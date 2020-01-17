/* eslint-disable class-methods-use-this */
import { post, get, put, _delete } from '@/lin/plugins/axios'

export interface IAllAuths {
  [propName: string]: {
    [propName: string]: string[]
  }
}

export interface IGroupItem {
  id: number
  info: string
  name: string
}

export interface IGroupItemWithAuths extends IGroupItem {
  auths: IGroupItemAuths[]
}

export interface IGroupItemAuths {
  [propName: string]: {
    auth: string
    module: string
  }[]
}

export interface IAdminUsers {
  count: number
  items: IAdminUserItem[]
  page: number
  total: number
  total_page: number
}

export interface IAdminUserItem {
  active: number
  admin: number
  avatar: string | null
  create_time: number
  email: string | null
  group_id: number
  group_name: string
  id: number
  nickname: string | null
  username: string
}

export interface IResponseWithoutData {
  error_code: number
  msg: string
  request: string
}

const EE = 0,
  UCOUNT = 10,
  LPAGE = 0,
  GCOUNT = 5

export default class Admin {
  ee: number

  uCount: number

  lPage: number

  gCount: number

  constructor(
    ee: number = EE,
    uCount: number = UCOUNT,
    gPage: number = LPAGE,
    gCount: number = GCOUNT,
  ) {
    this.ee = ee
    this.uCount = uCount
    this.lPage = gPage
    this.gCount = gCount
  }

  async increaseee() {
    this.ee += 1
  }

  async increaseGpage() {
    this.lPage += 1
  }

  async decreaseee() {
    this.ee -= 1
    if (this.ee < 0) {
      this.ee = 0
    }
  }

  async decreaseGpage() {
    this.lPage -= 1
    if (this.lPage < 0) {
      this.lPage = 0
    }
  }

  static async getAllAuths(): Promise<IAllAuths> {
    return get('cms/admin/authority')
  }

  static async getAdminUsers({
    group_id,
    count = UCOUNT,
    page = EE,
  }: {
    group_id?: number
    count?: number
    page?: number
  }): Promise<IAdminUsers> {
    let res: IAdminUsers
    if (group_id) {
      res = await get('cms/admin/users', {
        count,
        page,
        group_id,
      })
    } else {
      res = await get('cms/admin/users', {
        count,
        page,
      })
    }
    return res
  }

  async nextUsersPage(): Promise<IAdminUsers> {
    await this.increaseee()
    return Admin.getAdminUsers({})
  }

  async preUsersPage(): Promise<IAdminUsers> {
    await this.decreaseee()
    return Admin.getAdminUsers({})
  }

  // async getGroupsWithAuths({ count = UCOUNT, page = LPAGE }: {
  //   count?: number
  //   page?: number
  // }): Promise<any> {
  //   const res = await get('cms/admin/groups', {
  //     count,
  //     page,
  //   })
  //   return res
  // }

  // async nextGroupsPage(): Promise<any> {
  //   await this.increaseGpage()
  //   return this.getGroupsWithAuths({})
  // }

  // async preGroupsPage(): Promise<any> {
  //   await this.decreaseGpage()
  //   return this.getGroupsWithAuths({})
  // }

  static async getAllGroups(): Promise<IGroupItem[]> {
    const groups: IGroupItem[] = await get('cms/admin/group/all')
    return groups
  }

  static async getOneGroup(id: number): Promise<IGroupItemWithAuths> {
    const group: IGroupItemWithAuths = await get(`cms/admin/group/${id}`)
    return group
  }

  static async createOneGroup(
    name: string,
    info: string,
    auths: string[],
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await post('cms/admin/group', {
      name,
      info,
      auths,
    })
    return res
  }

  static async updateOneGroup(
    name: string,
    info: string,
    id: number,
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await put(`cms/admin/group/${id}`, {
      name,
      info,
    })
    return res
  }

  static async deleteOneGroup(id: number): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await _delete(`cms/admin/group/${id}`)
    return res
  }

  static async deleteOneUser(id: number): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await _delete(`cms/admin/${id}`)
    return res
  }

  static async updateOneUser(
    email: string,
    group_id: number,
    id: number,
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await put(`cms/admin/${id}`, {
      email,
      group_id,
    })
    return res
  }

  static async dispatchAuths(
    group_id: number,
    auths: string[],
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await post('cms/admin/dispatch/patch', {
      group_id,
      auths,
    })
    return res
  }

  static async changePassword(
    new_password: string,
    confirm_password: string,
    id: number,
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await put(`cms/admin/password/${id}`, {
      new_password,
      confirm_password,
    })
    return res
  }

  static async removeAuths(
    group_id: number,
    auths: string[],
  ): Promise<IResponseWithoutData> {
    const res: IResponseWithoutData = await post('cms/admin/remove', {
      group_id,
      auths,
    })
    return res
  }
}
