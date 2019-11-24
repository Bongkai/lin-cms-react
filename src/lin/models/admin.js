/* eslint-disable class-methods-use-this */
import {
  post,
  get,
  put,
  _delete,
} from '@/lin/plugins/axios'

export default class Admin {
  constructor(ee = 0, uCount = 10, gPage = 0, gCount = 5) {
    this.ee = ee
    this.uCount = uCount
    this.lPage = gPage
    this.gCount = gCount
  }

  async increseee() {
    this.ee += 1
  }

  async increseGpage() {
    this.lPage += 1
  }

  async decreseee() {
    this.ee -= 1
    if (this.ee < 0) {
      this.ee = 0
    }
  }

  async decreseGpage() {
    this.lPage -= 1
    if (this.lPage < 0) {
      this.lPage = 0
    }
  }

  static getAllAuths() {
    return get('cms/admin/authority')
  }

  static async getAdminUsers({ group_id, count = this.uCount, page = this.ee }) {
    let res
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

  async nextUsersPage() {
    await this.increseee()
    return this.getAdminUsers({})
  }

  async preUsersPage() {
    await this.decreseee()
    return this.getAdminUsers({})
  }

  async getGroupsWithAuths({ count = this.uCount, page = this.uPage }) {
    const res = await get('cms/admin/groups', {
      count,
      page,
    })
    return res
  }

  async nextGroupsPage() {
    await this.increseGpage()
    return this.getGroupsWithAuths({})
  }

  async preGroupsPage() {
    await this.decreseGpage()
    return this.getGroupsWithAuths({})
  }

  static async getAllGroups() {
    const groups = await get('cms/admin/group/all')
    return groups
  }

  static async getOneGroup(id) {
    const group = await get(`cms/admin/group/${id}`)
    return group
  }

  static async createOneGroup(name, info, auths) {
    const res = await post('cms/admin/group', {
      name,
      info,
      auths,
    })
    return res
  }

  static async updateOneGroup(name, info, id) {
    const res = await put(`cms/admin/group/${id}`, {
      name,
      info,
    })
    return res
  }

  static async deleteOneGroup(id) {
    const res = await _delete(`cms/admin/group/${id}`)
    return res
  }

  static async deleteOneUser(id) {
    const res = await _delete(`cms/admin/${id}`)
    return res
  }

  static async updateOneUser(email, group_id, id) {
    const res = await put(`cms/admin/${id}`, {
      email,
      group_id,
    })
    return res
  }

  static async dispatchAuths(group_id, auths) {
    const res = await post('cms/admin/dispatch/patch', {
      group_id,
      auths,
    })
    return res
  }

  static async changePassword(new_password, confirm_password, id) {
    const res = await put(`cms/admin/password/${id}`, {
      new_password,
      confirm_password,
    })
    return res
  }

  static async removeAuths(group_id, auths) {
    const res = await post('cms/admin/remove', {
      group_id,
      auths,
    })
    return res
  }
}
