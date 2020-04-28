import React, { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '@/hooks/project/useRedux'
import { Form, Dropdown, Menu, Button, DatePicker, Divider } from 'antd'
import {
  UserOutlined,
  DownOutlined,
  Loading3QuartersOutlined,
  DownCircleOutlined,
} from '@ant-design/icons'
import { Moment } from 'moment'
import timeFormatter from '@/lin/utils/time-formatter'
import { searchLogKeyword } from '@/lin/utils/search'
import StickyTop from '@/components/base/sticky-top/StickyTop'
import LinHeader from '@/components/base/lin-header/LinHeader'
import LoadingWrapper from '@/components/base/loading-wrapper/LoadingWrapper'
import LinSearch from '@/components/base/lin-search/LinSearch'
import LogModel from '@/lin/models/log'
import useDeepCompareEffect from '@/hooks/base/useDeepCompareEffect'
import useFirstMountState from '@/hooks/base/useFirstMountState'
import { checkPermission } from '@/lin/directives/authorize'

import { ILogUsers, ILogItem, ILogsInfo } from '@/types/model'

import './log.scss'

// 每次请求返回的 log 条数
const SEARCH_DATA_PER_TIME = 15

export default function Log() {
  const [loading, setLoading] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)
  const [isSearch, setIsSearch] = useState(false)
  const [users, setUsers] = useState<ILogUsers>({} as ILogUsers)
  const [logs, setLogs] = useState<ILogItem[]>([])
  const [keyword, setKeyword] = useState('') // 三个筛选项的合称词条
  const [totalCount, setTotalCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [searchUser, setSearchUser] = useState('全部人员')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchDate, setSearchDate] = useState<[string, string] | []>([])
  const [form] = Form.useForm()
  const { user, permissions } = useAppSelector()
  const isFirstMount = useFirstMountState()

  // 获取条件检索数据
  const getSearchData = useCallback(async () => {
    const name = searchUser === '全部人员' ? '' : searchUser
    const res: ILogsInfo | undefined = await LogModel.searchLogs({
      page: 0,
      keyword: searchKeyword,
      name,
      start: searchDate[0],
      end: searchDate[1],
    })
    if (typeof res === 'undefined') return
    if (res.items.length > 0) {
      let logs = res.items
      if (searchKeyword) {
        logs = await searchLogKeyword(searchKeyword, logs)
      }
      setLogs(logs)
      setTotalCount(res.total)
      setFinished(logs.length < SEARCH_DATA_PER_TIME)
    } else {
      setFinished(true)
    }
    setLoading(false)
  }, [searchKeyword, searchUser, searchDate])

  // 请求数据
  // TODO: 进一步拆分优化
  useDeepCompareEffect(() => {
    // 初始化
    async function initPage() {
      try {
        if (logs.length > 0) return
        if (user.admin || permissions.includes('查询日志记录的用户')) {
          const users: ILogUsers = await LogModel.getLoggedUsers({})
          const res: ILogsInfo | undefined = await LogModel.getLogs({ page: 0 })
          if (typeof res === 'undefined') return

          setUsers(users)
          setLogs(res.items)
          setTotalCount(res.total)
          setFinished(res.items.length < SEARCH_DATA_PER_TIME)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // 加载下一页
    async function getNextPage() {
      let res: ILogsInfo | undefined
      if (isSearch) {
        res = await LogModel.moreSearchPage()
      } else {
        res = await LogModel.moreLogPage()
      }
      if (typeof res === 'undefined') return

      setMoreLoading(false)
      if (res.items.length > 0) {
        let moreLogs: ILogItem[] = res.items
        if (isSearch && searchKeyword) {
          moreLogs = await searchLogKeyword(searchKeyword, moreLogs)
        }
        setLogs(logs.concat(moreLogs))
        setFinished(logs.length < SEARCH_DATA_PER_TIME)
      } else {
        setFinished(true)
      }
    }

    loading && !isSearch && initPage()
    loading && isSearch && getSearchData()
    moreLoading && getNextPage()

    // eslint-disable-next-line
  }, [
    loading,
    isSearch,
    moreLoading,
    getSearchData,
    logs,
    user.admin,
    permissions,
  ])

  // 开启条件检索
  useEffect(() => {
    // 首次加载时不执行该 useEffect
    if (isFirstMount) return

    function searchPage() {
      const kwArr: string[] = []
      let isSearch = false
      if (searchUser !== '全部人员') {
        kwArr.push(searchUser)
        isSearch = true
      }
      if (searchKeyword) {
        kwArr.push(searchKeyword)
        isSearch = true
      }
      if (searchDate.length !== 0) {
        kwArr.push(`${searchDate[0]}至${searchDate[1]}`)
        isSearch = true
      }
      const keyword = kwArr.join(' ')

      setKeyword(keyword)
      setTotalCount(0)
      setLogs([])
      setLoading(true)
      setIsSearch(isSearch)
      setFinished(false)
    }
    searchPage()
  }, [searchUser, searchKeyword, searchDate, isFirstMount])

  // 开启加载下一页
  function nextPage() {
    setMoreLoading(true)
  }

  // 清空检索
  function backInit() {
    form.resetFields()

    // 重置搜索相关的 state 值
    setIsSearch(false)
    setLogs([])
    setKeyword('')
    setTotalCount(0)
    setFinished(false)
    setSearchUser('全部人员')
    setSearchKeyword('')
    setSearchDate([])
    setLoading(true)
  }

  function onSearchChange(value: string) {
    setSearchKeyword(value.trim())
  }

  function onDropdownChange(value: string) {
    setSearchUser(value)
  }

  function onPickerChange(value: [Moment, Moment], valueStr: [string, string]) {
    let begin: string,
      end: string,
      range: [string, string] | [] = []
    if (valueStr[0] !== '') {
      begin = valueStr[0] + ' 00:00:00'
      end = valueStr[1] + ' 23:59:59'
      range = [begin, end]
    }
    setSearchDate(range)
  }

  const menu = (
    <Menu>
      <Menu.Item
        style={{ paddingLeft: '17px' }}
        onClick={() => onDropdownChange('全部人员')}
      >
        全部人员
      </Menu.Item>
      {(users.items || []).map(item => (
        <Menu.Item
          key={item}
          style={{ paddingLeft: '17px' }}
          onClick={() => onDropdownChange(item)}
        >
          <UserOutlined style={{ marginRight: '6px' }} />
          {item}
        </Menu.Item>
      ))}
    </Menu>
  )

  const logsLength = logs && logs.length

  return (
    <div className='log-container'>
      {/* 头部及搜索栏区域 */}
      <StickyTop height={60}>
        <LinHeader
          title='日志信息'
          divider={false}
          style={{ padding: '0 20px' }}
        >
          <div
            className='header-right'
            r-if={checkPermission({ permission: '搜索日志' })}
          >
            <Form form={form} component={false}>
              <Form.Item name='search' noStyle>
                <LinSearch onValueChange={onSearchChange} />
              </Form.Item>

              <Form.Item name='user' noStyle>
                <Dropdown
                  className='dropdown'
                  placement='bottomCenter'
                  overlay={menu}
                  disabled={
                    !checkPermission({ permission: '查询日志记录的用户' })
                  }
                >
                  <Button>
                    {searchUser}
                    <DownOutlined style={{ marginLeft: '10px' }} />
                  </Button>
                </Dropdown>
              </Form.Item>

              <Form.Item name='date' noStyle>
                <DatePicker.RangePicker
                  className='date-picker'
                  dropdownClassName='picker'
                  separator='至'
                  format='YYYY-MM-DD'
                  renderExtraFooter={undefined}
                  onChange={onPickerChange}
                />
              </Form.Item>
            </Form>
          </div>
        </LinHeader>
      </StickyTop>

      {/* 搜索结果区域 */}
      <div className='search' r-if={isSearch}>
        <p className='search-tip'>
          搜索 “<span className='search-keyword'>{keyword}</span>”， 找到{' '}
          <span className='search-num'>{totalCount}</span> 条日志信息
        </p>
        <button className='search-back' onClick={backInit}>
          返回全部日志
        </button>
      </div>

      {/* 日志展示区域 */}
      <div className='content'>
        <LoadingWrapper loading={loading} minHeight={300}>
          <article>
            {logs.map((item, index) => (
              <section key={item.time + index}>
                <span className='point-time'></span>
                <aside>
                  <p
                    className='things'
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  <p className='brief'>
                    <span className='text-yellow'>{item.username}</span>
                    {timeFormatter(item.time)}
                  </p>
                </aside>
              </section>
            ))}
          </article>
        </LoadingWrapper>

        <div r-if={!loading}>
          <Divider style={{ height: '2px' }} r-if={logsLength} />
          <div className='more' r-if={logsLength}>
            <Loading3QuartersOutlined
              className='more-loading-icon'
              r-if={moreLoading}
            />
            <div
              onClick={nextPage}
              r-if={!loading && !moreLoading && !finished}
            >
              <span>查看更多</span>
              <DownCircleOutlined className='down-circle-icon' />
            </div>
            <div r-if={finished}>
              <span>{totalCount === 0 ? '暂无数据' : '没有更多数据了'}</span>
            </div>
          </div>
          <div className='nothing' r-else>
            暂无日志信息
          </div>
        </div>
      </div>
    </div>
  )
}
