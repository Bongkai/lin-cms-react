import { post, get, put } from '@/lin/plugins/axios'

export default class Notify {
  url = null

  events = null

  constructor(url) {
    this.url = url
  }

  async getEvents() {
    const res = await get('cms/notify/events')
    this.events = res.events
  }

  /**
   * 创建events
   * @param {number} group_id
   * @param {Array} events
   */
  async createEvents(group_id, events) {
    const res = await post('cms/notify/events', { group_id, events })
    return res
  }

  /**
   * 更新events
   * @param {number} group_id
   * @param {Array} events
   */
  async updateEvents(group_id, events) {
    const res = await put('cms/notify/events', { group_id, events })
    return res
  }
}
