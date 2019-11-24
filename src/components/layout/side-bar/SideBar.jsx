import React from 'react'
import { connect } from 'react-redux'
import { withRouter, NavLink } from 'react-router-dom'
import { Menu, Select, Icon } from 'antd'
import Utils from '@/lin/utils/util'
import { sideBarList } from '@/store/getters/app.getters'

import './side-bar.scss'
const logoImg = require('../../../assets/img/logo.png')
const mobileLogoImg = require('../../../assets/img/mobile-logo.png')

const { SubMenu, Item } = Menu
const { Option } = Select


const connectWrapper = connect(
  state => state
)
class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sideBarList: [],
      idMap: {},
      openKeys: [],
      // showSidebarSearch: true,
      showSearchList: false,
      groups: [],
    }
    this.onOpenChange = this.onOpenChange.bind(this)
    this.search = this.search.bind(this)
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchBlur = this.handleSearchBlur.bind(this)
  }

  componentDidMount() {
    const list = sideBarList(this.props.app)
    this.setState({
      sideBarList: list,
      idMap: this.createIdMap(list)
    }, () => {
      this.syncOpenKeys()
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.syncOpenKeys()
    }
  }

  syncOpenKeys() {
    const treePath = this.props.app.currentRoute.treePath
    const openKeys = [...this.state.openKeys]
    treePath.forEach(item => {
      if (item.type === 'folder') {
        const openKey = this.state.idMap[item.name]
        if (openKeys.filter(item => item === openKey).length === 0) {
          openKeys.push(openKey)
        }
      }
    })
    this.setState({ openKeys })
  }

  menuRecursion = (list) => (
    list.map((item) => {
      // key 不这么写会出现 unique key 报错
      const key = this.state.idMap[item.name]
      return (
        item.children
        ?
        <SubMenu className='sub-menu-content' key={key}
          title={<>
            {/* <Icon 
              component={()=>(
                <i className={item.icon || 'iconfont icon-erjizhibiao'} />
              )} 
            /> */}
            <Icon type={item.icon} style={{ fontSize: '16px' }} />
            <span>{Utils.cutString(item.title, 12)}</span>
          </>}
        >
          {this.menuRecursion(item.children)}
        </SubMenu>
        :
        <Item key={key}>
          <NavLink to={item.path}>
            {/* <Icon 
              component={()=>(
                <i className={item.icon || 'iconfont icon-jian1'} />
              )} 
            /> */}
            <Icon type={item.icon} style={{ fontSize: '16px' }} />
            <span title={item.title}>{Utils.cutString(item.title, 12)}</span>
          </NavLink>
        </Item>
      )
    })
  )

  createIdMap(list) {
    const mapData = {}
    const deepTravel = (obj, fuc) => {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          deepTravel(item, fuc)
        })
        return
      }
      if (obj && obj.children) {
        fuc(obj)
        deepTravel(obj.children, fuc)
        return
      }
      if (obj.name) {
        fuc(obj)
      }
    }
    deepTravel(list, (item) => {
      mapData[item.name] = Utils.getRandomStr()
    })
    return mapData
  }

  // 根据当前路由设置激活侧边栏
  defaultActive() {
    const stageInfo = this.props.app.currentRoute.treePath
    if (!stageInfo) {
      return ''
    }
    for (let i = (stageInfo.length - 1); i >= 0; i -= 1) {
      if (this.state.idMap[stageInfo[i].name]) {
        return this.state.idMap[stageInfo[i].name]
      }
    }
    return ''
  }

  onOpenChange(openKeys) {
    this.setState({ openKeys })
  }

  toSearch() {
    this.setState({
      showSearchList: true
    })
  }

  search(val) {
    // 深度遍历配置树, 摘取叶子节点作为路由部分
    function deepTravel(config, fuc) {
      if (Array.isArray(config)) {
        config.forEach((subConfig) => {
          deepTravel(subConfig, fuc)
        })
      } else if (config.children) {
        config.children.forEach((subConfig) => {
          deepTravel(subConfig, fuc)
        })
      } else {
        fuc(config)
      }
    }

    if (val) {
      const _groups = []
      deepTravel(this.state.sideBarList, (viewConfig) => {
        // 构造舞台view路由
        if (viewConfig.title.includes(val)) {
          const viewRouter = {}
          viewRouter.path = viewConfig.path
          viewRouter.title = viewConfig.title
          viewRouter.key = Math.random()
          _groups.push(viewRouter)
        }
      })
      this.setState({
        groups: _groups
      })
    } else {
      this.setState({
        groups: []
      })
    }
  }

  handleSearchChange(val) {
    this.setState({
      groups: [],
      showSearchList: false,
    })
    val && this.props.history.push(val)
  }

  handleSearchBlur() {
    this.setState({
      groups: [],
      showSearchList: false,
    })
  }
  
  render() {
    const { showSearchList, groups, sideBarList, openKeys } = this.state
    const { collapsed } = this.props
    const selectedKeys = this.defaultActive()
    
    // menu 在 collapsed 状态时不设置 openKeys 的值
    const menuProps = collapsed ? {} : { openKeys }
    return (
      <div className='app-sidebar'>
        {
          !collapsed
          ?
          <div className='logo'>
            <img src={logoImg} alt='' />
          </div>
          :
          <div className='mobile-logo'>
            <img src={mobileLogoImg} alt='' />
          </div>
        }
        <div>
          {
            !collapsed ?
            <div style={{ marginTop: '15px' }}>
              {
                showSearchList
                ?
                <Select className='search' ref={ref=>this.searchInput=ref} id='searchInput'
                  showSearch
                  dropdownMatchSelectWidth={false}
                  defaultActiveFirstOption={false}
                  placeholder='请输入关键字'
                  onSearch={this.search}
                  onChange={this.handleSearchChange}
                  onBlur={this.handleSearchBlur}
                  filterOption={false}
                >
                  {groups.map(item => (
                    <Option key={item.key} value={item.path}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
                :
                <div className='search-display' onClick={()=>this.toSearch()}>
                  <Icon type='search' style={{ color: 'rgb(185, 190, 195)' }} />
                </div>
              }
            </div> : null
          }
        </div>
        <div>
          <Menu className='custom-antd menu-content' 
            theme='dark' mode='inline' inlineIndent={24}
            defaultOpenKeys={openKeys}
            selectedKeys={[selectedKeys]}
            onOpenChange={this.onOpenChange}
            {...menuProps}
          >
            {this.menuRecursion(sideBarList)}
          </Menu>
        </div>
      </div>
    )
  }
}

export default withRouter(connectWrapper(SideBar))
