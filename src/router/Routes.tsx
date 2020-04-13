import React from 'react'
import { useSelector } from 'react-redux'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { notification } from 'antd'
import AppConfig from '@/config/index'
import Utils from '@/lin/utils/util'
import { isLoginRequired } from './login-required'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { IHomeRouterItem } from './home-router'

import { IStoreState, IAppState } from '@/types/store'

const { defaultRoute } = AppConfig

let timer: number | null

interface RoutesProps {
  routes: IHomeRouterItem[]
  authPath?: string
  extraProps?: object
  switchProps?: object
}

interface RenderRoutesProps extends RoutesProps {
  location: any
}

export default function Routes(props: RoutesProps) {
  const location = useLocation()
  return (
    <TransitionGroup>
      <CSSTransition timeout={500} classNames={'fade'} key={location.pathname}>
        <RenderRoutes {...props} location={location} />
      </CSSTransition>
    </TransitionGroup>
  )
}

function RenderRoutes({
  routes,
  authPath = '/login',
  extraProps = {},
  switchProps = {},
  location,
}: RenderRoutesProps) {
  const { logined, permissions, user } = useSelector<IStoreState, IAppState>(
    state => state.app,
  )
  return (
    <Switch r-if={routes} location={location} {...switchProps}>
      <Redirect exact from='/' to={defaultRoute} />
      {routes.map(
        (route: IHomeRouterItem, index: number) =>
          route.path &&
          route.name && (
            <Route
              key={route.key || index}
              path={route.path}
              exact={route.exact}
              strict={route.strict}
              render={props => {
                if (!route.name) return

                // 登录验证
                if (isLoginRequired(route.name) && !logined) {
                  return (
                    <Redirect
                      to={{
                        pathname: authPath,
                        state: { from: props.location },
                      }}
                    />
                  )
                }

                // TODO: tab 模式重复点击验证

                // 权限验证
                if (
                  route.path !== defaultRoute &&
                  !Utils.hasPermission(permissions, route.meta, user)
                ) {
                  // 异步调用 notification 生成弹窗避免直接在 render 中修改 state 和 props
                  // 并配合 timer 解决同时弹出多个 notification 的问题
                  if (!timer) {
                    timer = window.setTimeout(() => {
                      notification.error({
                        message: '无权限',
                        description: (
                          <strong className='my-notify'>
                            您无此页面的权限哟
                          </strong>
                        ),
                      })
                    }, 0)
                  }
                  window.setTimeout(() => {
                    timer && clearTimeout(timer)
                    timer = null
                  }, 10)
                  return (
                    <Redirect
                      to={{
                        pathname: defaultRoute,
                        state: { from: props.location },
                      }}
                    />
                  )
                }

                // 合法路由
                if (logined || route.path === authPath) {
                  if (route.meta.title) {
                    document.title = route.meta.title
                  }
                  // 这里必须用 div 包裹住 route.component，使其能正常运行 enter 动画
                  return (
                    <div className='animated-base'>
                      <route.component {...props} {...extraProps} />
                    </div>
                  )
                }

                // 其他情况
                return (
                  <Redirect
                    to={{
                      pathname: authPath,
                      state: { from: props.location },
                    }}
                  />
                )
              }}
            />
          ),
      )}
      <Redirect to='/404' />
    </Switch>
  )
}
