import stageConfig from '@/config/stage' // 引入舞台配置
import loadable, { LoadableComponent } from '@loadable/component'

import { IRouterItem } from '@/types/project'

export interface IHomeRouterItem {
  path: string | null
  name: symbol | string | null
  component: LoadableComponent<any>
  meta: IHomeRouterItemMeta
  // TODO: 确定下面字段的类型
  key?: any
  exact?: any
  strict?: any
  permission?: any
}

export interface IHomeRouterItemMeta {
  title: string
  icon: string
  permission: string[] | null | undefined
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
  // viewRouter.component = viewConfig.component
  viewRouter.component = loadable(() => import(`@/${viewConfig.filePath}`))
  viewRouter.meta = {
    title: viewConfig.title,
    icon: viewConfig.icon,
    permission: viewConfig.permission,
    type: viewConfig.type,
    // blueBaseColor: viewConfig.blueBaseColor ? 'viewConfig.blueBaseColor' : '',
  }
  homeRouter.push(viewRouter)
})

export default homeRouter
