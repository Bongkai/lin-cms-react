import stageConfig from '@/config/stage' // 引入舞台配置
import loadable, { LoadableComponent } from '@loadable/component'

import { IRouterItem } from '@/types/project'

export interface IHomeRouterItem {
  path: string | null
  name: symbol | string | null
  component: LoadableComponent<any>
  meta: IHomeRouterItemMeta
}

export interface IHomeRouterItemMeta {
  title: string
  icon: string
  permission?: string[]
  type: string
}

// 深度遍历配置树, 摘取叶子节点作为路由部分
function deepTravel<T extends { children?: T[] }>(
  config: T | T[],
  fuc: (obj: T) => void,
): void {
  if (Array.isArray(config)) {
    config.forEach(subConfig => {
      deepTravel(subConfig, fuc)
    })
  } else if (config.children) {
    config.children.forEach((subConfig: T) => {
      deepTravel(subConfig, fuc)
    })
  } else {
    fuc(config)
  }
}

const homeRouter: IHomeRouterItem[] = []

deepTravel<IRouterItem>(stageConfig, viewConfig => {
  // 构造舞台view路由
  const viewRouter = {} as IHomeRouterItem
  viewRouter.path = viewConfig.route
  viewRouter.name = viewConfig.name

  // 动态加载细化到 views 和 plugins 文件夹，使 src 的其余文件夹可以正常 Tree Shaking
  const filePath = viewConfig.filePath.match(/^(\w+\/)(.+)$/)?.[2]
  if (filePath) {
    viewRouter.component = viewConfig.filePath.startsWith('views/')
      ? loadable(() => import(`@/views/${filePath}`))
      : loadable(() => import(`@/plugins/${filePath}`))
  }
  // viewRouter.component = loadable(() => import(`@/${viewConfig.filePath}`))

  viewRouter.meta = {
    title: viewConfig.title,
    icon: viewConfig.icon,
    permission: viewConfig.permission,
    type: viewConfig.type,
  }
  homeRouter.push(viewRouter)
})

export default homeRouter
