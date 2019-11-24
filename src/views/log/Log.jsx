import React from 'react'
import { connect } from 'react-redux'
import { Dropdown, Menu, Button, Icon, DatePicker, Divider, Spin } from 'antd'
import timeFormatter from 'lin/utils/time-formatter'
import { searchLogKeyword } from 'lin/utils/search'
import StickyTop from 'components/base/sticky-top/StickyTop'
import LinSearch from 'components/base/lin-search/LinSearch'
import log from 'lin/models/log'

import './log.scss'

// 每次请求返回的 log 条数
const SEARCH_DATA_PER_TIME = 15


const connectWrapper = connect(
  state => state
)
class Log extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      moreLoading: false,
      isSearch: false,
      users: [],
      logs: [],
      keyword: '',  // 三个筛选项的合称词条
      totalCount: 0,
      finished: false,

      searchUser: '全部人员',
      searchKeyword: '',
      searchDate: [],
    }
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onPickerChange = this.onPickerChange.bind(this)
  }

  componentDidMount() {
    this.initPage()
  }

  // 页面初始化
  async initPage() {
    try {
      const { user, auths } = this.props.app
      if (user.isSuper || auths.includes('查询日志记录的用户')) {
        const users = await log.getLoggedUsers({})
        const res = await log.getLogs({ page: 0 })
        const logs = res.items
        this.setState({
          users,
          logs,
          totalCount: res.total,
          loading: false
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  backInit(ev) {
    // 主动清除 LinSearch 和 DatePicker 组件中的 value 值
    this.linSearch.setSearchData('')
    this.datePicker.picker.clearSelection(ev)
    // 清除搜索相关的 state 值
    this.setState({
      loading: true,
      isSearch: false,
      logs: [],
      keyword: '',
      totalCount: 0,
      finished: false,

      searchUser: '全部人员',
      searchKeyword: '',
      searchDate: [],
    }, () => {
      this.initPage()
    })
  }

  nextPage() {
    this.setState({
      moreLoading: true
    }, async () => {
      const { isSearch, searchKeyword, logs } = this.state
      let res
      if (isSearch) {
        res = await log.moreSearchPage()
      } else {
        res = await log.moreLogPage()
      }
      if (res.items.length > 0) {
        let moreLogs = res.items
        if (isSearch && searchKeyword) {
          moreLogs = await searchLogKeyword(searchKeyword, moreLogs)
        }
        this.setState({
          logs: logs.concat(moreLogs),
          finished: logs.length < SEARCH_DATA_PER_TIME,
          moreLoading: false,
        })
      } else {
        this.setState({
          finished: true,
          moreLoading: false
        })
      }
    })
  }

  searchPage() {
    const { searchUser, searchKeyword, searchDate } = this.state
    
    const kwArr = []
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

    this.setState({
      keyword,
      isSearch,
      totalCount: 0,
      logs: [],
      loading: true,
      finished: false,
    }, () => {
      this.getSearchData()
    })
  }

  async getSearchData() {
    const { searchUser, searchKeyword, searchDate } = this.state
    const name = searchUser === '全部人员' ? '' : searchUser

    const res = await log.searchLogs({
      page: 0,
      keyword: searchKeyword,
      name,
      start: searchDate[0],
      end: searchDate[1],
    })
    
    if (res.items.length > 0) {
      let logs = res.items
      if (searchKeyword) {
        logs = await searchLogKeyword(searchKeyword, logs)
      }
      this.setState({
        logs,
        totalCount: res.total,
        finished: logs.length < SEARCH_DATA_PER_TIME,
        loading: false,
      })
    } else {
      this.setState({
        finished: true,
        loading: false,
      })
    }
  }

  onSearchChange(value) {
    this.setState({
      searchKeyword: value
    }, () => {
      this.searchPage()
    })
  }

  onDropdownChange(value) {
    this.setState({
      searchUser: value
    }, () => {
      this.searchPage()
    })
  }

  onPickerChange(value, valueStr) {
    let begin, end, range = []

    if (valueStr[0] !== '') {
      begin = valueStr[0] + ' 00:00:00'
      end = valueStr[1] + ' 23:59:59'
      range = [begin, end]
    }

    this.setState({
      searchDate: range
    }, () => {
      this.searchPage()
    })
  }
  
  render() {
    const {
      loading, isSearch, users, logs, keyword, totalCount, moreLoading, finished
    } = this.state
    const menu = (
      <Menu selectable>
        <Menu.Item style={{ paddingLeft: '17px' }}
          onClick={()=>this.onDropdownChange('全部人员')}
        >全部人员
        </Menu.Item>
        {users.map(item => (
          <Menu.Item key={item} style={{ paddingLeft: '17px' }}
            onClick={()=>this.onDropdownChange(item)}
          >
            <Icon type='user' style={{ marginRight: '6px' }} />
            {item}
          </Menu.Item>
        ))}
      </Menu>
    )
    return (
      <div className='log-container'>
        <StickyTop height={60}>
          <div className='log-header'>
            <div className='header-left'>
              <p className='title'>日志信息</p>
            </div>
            <div className='header-right'>
              <LinSearch ref={ref=>this.linSearch=ref}
                onChange={this.onSearchChange}
              />
              <Dropdown className='dropdown' placement='bottomCenter'
                overlay={menu}
              >
                <Button className='custom-antd'>
                  {this.state.searchUser}<Icon type='down' style={{ marginLeft: '10px' }} />
                </Button>
              </Dropdown>
              <DatePicker.RangePicker className='custom-antd date-picker' 
                ref={ref=>this.datePicker=ref}
                dropdownClassName='picker' separator='至'
                format='YYYY-MM-DD'
                renderExtraFooter={null}
                onChange={this.onPickerChange}
              />
            </div>
          </div>
        </StickyTop>
        <div className='search' style={{ display: isSearch ? 'flex' : 'none' }}>
          <p className='search-tip'>
            搜索 “<span className='search-keyword'>{keyword}</span>”，
            找到 <span className='search-num'>{totalCount}</span> 条日志信息</p>
          <button className='search-back' onClick={(ev)=>this.backInit(ev)}>返回全部日志</button>
        </div>
        <div className='content'>
          <article>
            {logs.map((item, index) => (
              <section key={item.time + index}>
                <span className='point-time'></span>
                <aside>
                  <p className='things' 
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  <p className='brief'>
                    <span className='text-yellow'>{item.user_name}</span>
                    {timeFormatter(item.time)}
                  </p>
                </aside>
              </section>
            ))}
          </article>
          
          {!loading ? <Divider style={{ height: '2px' }} /> : null}

          {
            loading ?
            <Spin className='loading' size='large' />
            :
            <div className='more'>
              {/* {moreLoading ? <i className='iconfont icon-loading'></i> : null} */}
              {moreLoading ? <Icon type='loading-3-quarters' className='more-loading-icon' /> : null}
              {
                !moreLoading && !finished ?
                <div onClick={()=>this.nextPage()}>
                  <span>查看更多</span>
                  {/* <i className='iconfont icon-gengduo' style={{ fontSize: '14px' }} /> */}
                  <Icon type='down-circle' className='down-circle-icon' />
                </div> : null
              }
              {
                finished ? 
                <div>
                  <span>{totalCount === 0 ? '暂无数据' : '没有更多数据了'}</span>
                </div> : null
              }
            </div>
          }
        </div>
      </div>
    )
  }
}

export default connectWrapper(Log)