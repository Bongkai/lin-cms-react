import { store } from '@/store'
import Util from '@/lin/utils/util'
import { IAppState, IUserType, ISideBarListItem } from '@/types/store'
import { IRouterItem } from '@/types/project'

const name: unique symbol = Symbol()
interface IStageMap {
  [name]: IRouterItem
}

interface DeepTravelDefault<T> {
  children?: T[]
  name?: symbol | string | null
}

// 深度遍历配置树, 摘取叶子节点作为路由部分
export function deepTravel<T extends DeepTravelDefault<T>>(
  obj: T | T[],
  fuc: (obj: T) => void,
): void {
  if (Array.isArray(obj)) {
    obj.forEach(item => {
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

let stageMap = {} as IStageMap

function IterationDelateMenuChildren(arr: IRouterItem[]): IRouterItem[] {
  if (arr.length) {
    for (const i in arr) {
      const children = arr[i].children
      if (children && !children.length) {
        delete arr[i]
      } else if (children && children.length) {
        IterationDelateMenuChildren(children)
      }
    }
  }
  return arr
}

function permissionShaking(
  stageConfig: IRouterItem[],
  permissions: string[],
  user: IUserType,
): IRouterItem[] {
  const shookConfig = stageConfig.filter(route => {
    if (Util.hasPermission(permissions, route, user)) {
      if (route.children && route.children.length) {
        route.children = permissionShaking(route.children, permissions, user)
      }
      return true
    }
    return false
  })
  return IterationDelateMenuChildren(shookConfig)
}

// 获取有权限的舞台配置
export const permissionStageConfig = (): IRouterItem[] => {
  const { stageConfig, permissions, user } = store.getState().app
  const tempStageConfig = Util.deepClone(stageConfig)
  const shookConfig = permissionShaking(tempStageConfig, permissions, user)

  // 设置舞台缓存
  const list = {} as IStageMap
  deepTravel<IRouterItem>(shookConfig, item => {
    if (item.name) {
      list[item.name] = item
    }
  })
  stageMap = list
  return shookConfig
}

// 获取侧边栏配置
export const getSideBarList = (): ISideBarListItem[] => {
  const { sideBarLevel } = store.getState().app

  // TODO: 优化函数返回值的类型
  function deepGetSideBar(
    target: IRouterItem | IRouterItem[],
    level: number = 3,
  ): any {
    // 集合节点处理
    if (Array.isArray(target)) {
      const acc: ISideBarListItem[] = target.map(item =>
        deepGetSideBar(item, level - 1),
      )
      return acc.filter(item => item !== null)
    }

    // 检测是否需要在导航中显示
    if (!target.inNav) {
      return null
    }

    // 处理 folder 模式
    if (target.type === 'folder' && level !== 0) {
      const sideConfig = {} as ISideBarListItem
      sideConfig.name = target.name
      sideConfig.title = target.title
      sideConfig.icon = target.icon
      sideConfig.path = target.route || Util.getRandomStr(6)
      const { children } = target
      if (children) {
        sideConfig.children = children.map(item =>
          deepGetSideBar(item, level - 1),
        )
        sideConfig.children = sideConfig.children.filter(item => item !== null)
      }
      return sideConfig
    }

    // 处理一级就是 view 的情况
    if (target.type === 'view') {
      const sideConfig = {} as ISideBarListItem
      sideConfig.name = target.name
      sideConfig.title = target.title
      sideConfig.icon = target.icon
      sideConfig.path = target.route
      return sideConfig
    }

    // 处理 appTab 情况
    if (target.type === 'tab') {
      const sideConfig = {} as ISideBarListItem
      sideConfig.name = target.name
      sideConfig.title = target.title
      sideConfig.icon = target.icon
      sideConfig.type = target.type
      sideConfig.path = target.route
      // 如果 Tab 没有设置默认打开的路由, 则设置为第一个子节点路由
      if (!sideConfig.path) {
        if (
          target.children &&
          target.children.length > 0 &&
          target.children[0].route
        ) {
          sideConfig.path = target.children[0].route
        }
      }
      return sideConfig
    }

    // 最后一层, 都当做子节点处理
    if (level <= 0) {
      const sideConfig = {} as ISideBarListItem
      sideConfig.name = target.name
      sideConfig.title = target.title
      sideConfig.icon = target.icon
      sideConfig.path = Util.getRandomStr(6)
      const { children } = target
      if (children && children.length > 0 && children[0].route) {
        sideConfig.path = children[0].route
      }
      return sideConfig
    }

    return null
  }

  const sideBar: ISideBarListItem[] = deepGetSideBar(
    permissionStageConfig(),
    sideBarLevel,
  )
  return sideBar
}

// 获取有权限的所有节点配置对象
export const getStageByName = (name: symbol | string): IRouterItem => {
  const target: IRouterItem = stageMap[name]
  return target
}

// 获取有权限的所有节点配置对象
export const getStageByRoute = (path: string | null): IRouterItem => {
  const result =
    Object.getOwnPropertySymbols(stageMap).find(
      key => stageMap[key].route === path,
    ) || Symbol('__no_result_flag__')
  const target: IRouterItem = stageMap[result]
  return target
}

export const getStageList = () => stageMap

export const getStageInfo = (
  state: IAppState,
): ((name: string) => IRouterItem[]) => {
  const { stageConfig } = state
  const cache = {} as IRouterItem[]
  const findStage = (
    stages: IRouterItem | IRouterItem[],
    name: String,
  ): IRouterItem[] | null => {
    let result: IRouterItem[] | null = []
    if (Array.isArray(stages)) {
      for (let i = 0; i < stages.length; i += 1) {
        result = findStage(stages[i], name)
        if (result) {
          // return result
          break
        }
      }
      return result
    }

    if (stages.children) {
      result = findStage(stages.children, name)
      if (result) {
        result.unshift(stages)
      }
      return result
    }

    if (stages.route === name) {
      return [stages]
    }
    // return false
    return null
  }
  return (name: string) => {
    if (cache[name]) {
      return cache[name]
    }
    let stageInfo = findStage(stageConfig, name)
    if (stageInfo) {
      cache[name] = stageInfo
    } else {
      stageInfo = []
    }
    return stageInfo
  }
}
