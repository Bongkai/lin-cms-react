import appConfig from '@/config/index'

// 判断是否需要登录访问, 配置位于 config 文件夹
let isLoginRequired = (routeName: string | symbol): boolean => {
  // 首次执行时缓存配置
  let notLoginRoute = appConfig.notLoginRoute as string[] | null
  const notLoginMark = {}

  // 构建标记对象
  if (Array.isArray(notLoginRoute)) {
    for (let i = 0; i < notLoginRoute.length; i += 1) {
      notLoginMark[notLoginRoute[i].toString()] = true
    }
  }

  notLoginRoute = null // 释放内存

  // 重写初始化函数
  isLoginRequired = name => {
    if (!name) {
      return true
    }
    if (typeof name === 'string' && name.indexOf('/') === 0) {
      name = name.substring(1)
    }
    // 处理 Symbol 类型
    // TODO: 处理 name 的类型
    const target = typeof name === 'symbol' ? (name as any).description : name
    return !notLoginMark[target]
  }

  return isLoginRequired(routeName)
}

export { isLoginRequired }
