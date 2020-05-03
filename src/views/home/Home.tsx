import React, { useState, useEffect } from 'react'
import { useAppSelector, useDispatch } from '@/hooks/project/useRedux'
import { useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import {
  NavBar,
  SideBar,
  AppMain,
  ReuseTab,
  // BackTop,
} from '@/components/layout'
import { updateRoute, clearRoute } from '@/store/actions/app.actions'

import './home.scss'

const { Header, Sider, Content } = Layout

/**
 * Home 首页
 */
export default function Home() {
  const [collapsed, setCollapsed] = useState(false)
  const reuseLength = useAppSelector().histories.length
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  useEffect(() => {
    // 组件卸载时清空 redux 中的路由信息，避免干扰后续数据的操作
    return () => {
      dispatch(clearRoute())
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    dispatch(updateRoute(pathname))
  }, [pathname, dispatch])

  function changeSidebarState() {
    setCollapsed(collapsed => !collapsed)
  }

  return (
    <div className='home-container'>
      <Layout className='layout-container'>
        <Sider
          className='aside'
          collapsed={collapsed}
          breakpoint='md'
          width={210}
          collapsedWidth={64}
        >
          <SideBar collapsed={collapsed} />
        </Sider>
        <Layout className='sub-container'>
          <Header className='header'>
            <div className='left'>
              <div
                className='operate'
                style={{ height: reuseLength > 1 ? '45px' : '86px' }}
              >
                <MenuUnfoldOutlined
                  r-if={collapsed}
                  className='fold-icon'
                  onClick={changeSidebarState}
                />
                <MenuFoldOutlined
                  r-else
                  className='fold-icon'
                  onClick={changeSidebarState}
                />
                <NavBar />
              </div>
              <div className='reuse-tab'>
                <ReuseTab />
              </div>
            </div>
          </Header>
          <Content className='content'>
            <AppMain />
          </Content>
          {/* <BackTop /> */}
        </Layout>
      </Layout>
    </div>
  )
}
