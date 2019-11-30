import React from 'react'
import { connect } from 'react-redux'
import { Layout, Icon } from 'antd'
import {
  NavBar,
  SideBar,
  AppMain,
  ReuseTab,
  // MenuTab,
  BackTop,
} from '@/components/layout'
import { updateRoute, clearRoute } from '@/store/actions/app.actions'

import './home.scss'

// const navBarHeight = 66 // header高度
// const reuseTabHeight = 70 // 历史记录栏高度
// const marginHeight = 20 // 历史记录栏与舞台的间距
// const totalHeight = navBarHeight + reuseTabHeight + marginHeight

const { Header, Sider, Content } = Layout


const connectWrapper = connect(
  state => state,
  { updateRoute, clearRoute }
)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isCollapsed: false, // 左侧菜单栏是否折叠
      foldState: false,   // 控制左侧菜单栏按键
    }
    this.changeSlidebarState = this.changeSlidebarState.bind(this)
  }

  // TODO: 修改成不使用 componentWillMount 的写法
  
  UNSAFE_componentWillMount() {
    this.props.updateRoute(this.props.location.pathname)
  }

  componentDidMount() {
    // 开发环境下热更新后保持 store 的 currentRoute 数据正常
    // 使 SideBar 组件的 Menu 的 active 状态正常显示
    if (process.env.NODE_ENV === 'development') {
      this.props.updateRoute(this.props.location.pathname)
    }
  }

  // TODO: 修改成不使用 componentWillReceiveProps 的写法
  // 在 componentWillReceiveProps 生命周期中执行以保证 store 的
  // currentRoute 在 Home 的子组件更新时已是最新数据
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.props.updateRoute(nextProps.location.pathname)
    }
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location.pathname !== prevProps.location.pathname) {
  //     this.props.updateRoute(this.props.location.pathname)
  //   }
  // }

  componentWillUnmount() {
    this.props.clearRoute()
  }
  
  changeSlidebarState() {
    this.setState({
      isCollapsed: !this.state.isCollapsed
    })
  }
  
  render() {
    const { isCollapsed } = this.state
    const reuseLength = this.props.app.histories.length
    return (
      <div className='home-container'>
        <Layout className='layout-container'>
          <Sider className='aside' collapsed={isCollapsed}
            breakpoint='md' width={190} collapsedWidth={64}
          >
            <SideBar collapsed={isCollapsed} />
          </Sider>
          <Layout className='sub-container'>
            <Header className='header'>
              <div className='left'>
                <div className='operate'
                  style={{height: reuseLength > 1 ? '46px' : '72px'}}
                >
                  <Icon type={isCollapsed ? 'menu-unfold' : 'menu-fold'} className='fold-icon'
                    onClick={this.changeSlidebarState}
                  />
                  <NavBar />
                </div>
                <div className='reuse-tab'>
                  <ReuseTab />
                </div>
              </div>
            </Header>
            <Content className='content'>
              {/* <MenuTab /> */}
              <AppMain />
            </Content>
            <BackTop />
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default connectWrapper(Home)
