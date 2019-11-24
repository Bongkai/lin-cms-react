import adminConfig from './admin'
import pluginsConfig from './plugins'
import Utils from '@/lin/utils/util'

// router 入口在 AppMain 组件中
// eslint-disable-next-line import/no-mutable-exports
let homeRouter = [
  {
    title: '林间有风',
    type: 'view',
    name: Symbol('about'),
    route: '/about',
    filePath: 'views/about/About',
    inNav: true,
    // icon: 'iconfont icon-iconset0103',
    icon: 'home',
    order: 0,
  },
  {
    title: '日志管理',
    type: 'view',
    name: Symbol('log'),
    route: '/log',
    filePath: 'views/log/Log',
    inNav: true,
    // icon: 'iconfont icon-rizhiguanli',
    // icon: 'unordered-list',
    icon: 'solution',
    order: 1,
    right: ['查询所有日志'],
  },
  {
    title: '404',
    type: 'view',
    name: Symbol('404'),
    route: '/404',
    filePath: 'views/error-page/ErrorPage',
    inNav: false,
    // icon: 'iconfont icon-rizhiguanli',
    icon: 'stop',
  },
  adminConfig,
]

const plugins = [...pluginsConfig]

// 筛除已经被添加的插件
function filterPlugin(data) {
  if (plugins.length === 0) {
    return
  }
  if (Array.isArray(data)) {
    data.forEach((item) => {
      filterPlugin(item)
    })
  } else {
    const findResult = plugins.findIndex(item => (data === item))
    if (findResult >= 0) {
      plugins.splice(findResult, 1)
    }
    if (data.children) {
      filterPlugin(data.children)
    }
  }
}

filterPlugin(homeRouter)

homeRouter = homeRouter.concat(plugins)

// 处理顺序
homeRouter = Utils.sortByOrder(homeRouter)

// // 使用 Symbol 处理 name 字段, 保证唯一性
const deepReduceName = (target) => {
  if (Array.isArray(target)) {
    target.forEach((item) => {
      if (typeof item !== 'object') {
        return
      }
      deepReduceName(item)
    })
    return
  }
  if (typeof target === 'object') {
    if (typeof target.name !== 'symbol') {
      // eslint-disable-next-line no-param-reassign
      target.name = target.name || Utils.getRandomStr()
      // eslint-disable-next-line no-param-reassign
      target.name = Symbol(target.name)
    }

    if (Array.isArray(target.children)) {
      target.children.forEach((item) => {
        if (typeof item !== 'object') {
          return
        }
        deepReduceName(item)
      })
    }
  }
}

deepReduceName(homeRouter)

export default homeRouter
