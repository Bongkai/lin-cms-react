import React from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router-dom'
import { notification } from 'antd'
import Util from '@/lin/utils/util'
import { isLoginRequired } from './login-required'
import { TransitionGroup, CSSTransition } from 'react-transition-group'


let timer

const Routes = ({
  routes, state, authPath, permissionPath, extraProps, switchProps, location, animated 
}) => ( 
  animated
  ?
  <TransitionGroup>
    <CSSTransition
      timeout={500}
      classNames={'fade'}
      key={location.pathname}
    >
      {renderRoutes(
        routes, state, authPath, permissionPath, extraProps, switchProps, location
      )}
    </CSSTransition>
  </TransitionGroup>
  :
  renderRoutes(
    routes, state, authPath, permissionPath, extraProps, switchProps, location
  )
)

function renderRoutes(
  routes,
  state,
  authPath = '/login',
  permissionPath = '/about',
  extraProps = {},
  switchProps = {},
  location
) {
  const { logined, auths, user } = state
  return routes && (
    <Switch location={location} {...switchProps}>
      <Redirect exact from='/' to={permissionPath} />
      {routes.map((route, index) => (
        <Route
          key={route.key || index}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          render={props => {
            // 登录验证
            if (isLoginRequired(route.name) && !logined) {
              return <Redirect to={{ pathname: authPath, state: { from: props.location } }} />
            }

            // TODO: tab 模式重复点击验证

            // 权限验证
            if (
              route.path !== permissionPath &&
              !Util.hasPermission(auths, route.meta, user)
            ) {
              // 异步调用 notification 生成弹窗避免直接在 render 中修改 state 和 props
              // 并配合 timer 解决同时弹出多个 notification 的问题
              if (!timer) {
                timer = setTimeout(() => {
                  notification.error({
                    message: '无权限',
                    description: <strong className='my-notify'>您无此页面的权限哟</strong>
                  })
                }, 0)
              }
              setTimeout(() => {
                clearTimeout(timer)
                timer = null
              }, 10)
              return <Redirect to={{ pathname: permissionPath, state: { from: props.location } }} />
            }

            // 合法路由
            if (logined || route.path === authPath) {
              if (route.meta.title) {
                document.title = route.meta.title
              }
              // 这里必须用 div 包裹住 route.component，使其能正常运行 enter 动画
              return <div className='animated-base'><route.component {...props} {...extraProps} /></div>
            }

            // 其他情况
            return (
              <Redirect to={{ pathname: authPath, state: { from: props.location } }} />
            )
          }}
        />
      ))}
      <Redirect to='/404' />
    </Switch>
  )
}

export default withRouter(Routes)
