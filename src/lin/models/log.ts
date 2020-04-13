import { get } from '@/lin/plugins/axios'

import { ILogUsers, ILogsInfo } from '@/types/model'

class Log {
  name: string | undefined

  start: string | undefined

  end: string | undefined

  keyword: string

  uPage: number

  uCount: number

  lPage: number

  lCount: number

  sPage: number

  sCount: number

  constructor({
    uPage = 0,
    uCount = 5,

    lPage = 0,
    lCount = 15,

    sPage = 0,
    sCount = 15,
  }: {
    uPage?: number
    uCount?: number

    lPage?: number
    lCount?: number

    sPage?: number
    sCount?: number
  }) {
    if (uPage === 0) {
      this.uPage = uPage
    }
    if (uCount) {
      this.uCount = uCount
    }
    if (lPage === 0) {
      this.lPage = lPage
    }
    if (lCount) {
      this.lCount = lCount
    }
    if (sPage === 0) {
      this.sPage = sPage
    }
    if (sCount) {
      this.sCount = sCount
    }
    // lCount && this.lCount = lCount
  }

  async increaseUpage() {
    this.uPage += 1
  }

  async increaseLpage() {
    this.lPage += 1
  }

  increaseSpage() {
    this.sPage += 1
  }

  init() {
    this.lPage = 0
    this.uPage = 0
    this.sPage = 0
  }

  setBaseInfo(name?: string, start?: string, end?: string) {
    this.name = name
    this.start = start
    this.end = end
  }

  setKeyword(keyword: string) {
    this.keyword = keyword
  }

  /**
   * 查询已经被记录过日志的用户（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   */
  async getLoggedUsers({
    count,
    page,
  }: {
    count?: number
    page?: number
  }): Promise<ILogUsers> {
    const users: ILogUsers = await get('cms/log/users', {
      count: count || this.uCount,
      page: page || this.uPage,
    })
    return users
  }

  /**
   * 查询日志信息（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   * @param {number} name 用户昵称
   * @param {number} start 起始时间 # 2018-11-01 09:39:35
   * @param {number} end 结束时间
   */
  async getLogs({
    count,
    page,
    name,
    start,
    end,
    next = false,
  }: {
    count?: number
    page?: number
    keyword?: string
    name?: string
    start?: string
    end?: string
    next?: boolean
  }): Promise<ILogsInfo | undefined> {
    try {
      if (!next) {
        this.setBaseInfo(name, start, end)
      }
      if (page === 0) {
        this.lPage = 0
      }
      const res: ILogsInfo = await get('cms/log', {
        count: count || this.lCount,
        page: page || this.lPage,
        name: name || this.name,
        start: start || this.start,
        end: end || this.end,
      })
      return res
    } catch (err) {
      console.log('error', err)
    }
  }

  /**
   * 所搜日志信息（分页）
   * @param {number} count 每页个数
   * @param {number} page 第几页
   * @param {number} keyword 搜索关键词
   * @param {number} name 用户昵称
   * @param {number} start 起始时间 # 2018-11-01 09:39:35
   * @param {number} end 结束时间
   */
  async searchLogs({
    count,
    page,
    keyword,
    name,
    start,
    end,
    next = false,
  }: {
    count?: number
    page?: number
    keyword?: string
    name?: string
    start?: string
    end?: string
    next?: boolean
  }): Promise<ILogsInfo | undefined> {
    if (!next) {
      this.setBaseInfo(name, start, end)
      this.setKeyword(keyword || '')
    }
    if (page === 0) {
      this.sPage = 0
    }
    try {
      const res: ILogsInfo = await get('cms/log/search', {
        count: count || this.sCount,
        page: page || this.sPage,
        keyword: keyword || this.keyword || '',
        name: name || this.name || null,
        start: start || this.start || null,
        end: end || this.end || null,
      })
      return res
    } catch (err) {
      console.log(err)
    }
  }

  // async moreUserPage(): Promise<string[]> {
  //   await this.increaseUpage()
  //   return this.getLoggedUsers({})
  // }

  moreLogPage(): Promise<ILogsInfo | undefined> {
    this.increaseLpage()
    return this.getLogs({ next: true })
  }

  moreSearchPage(): Promise<ILogsInfo | undefined> {
    this.increaseSpage()
    return this.searchLogs({ next: true })
  }
}

export default new Log({})
