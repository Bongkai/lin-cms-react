import { IRouterItem } from '@/types/project'

const centerRouter: IRouterItem = {
  route: null,
  name: null,
  title: '个人',
  type: 'view', // 类型: folder, tab, view
  icon: 'home',
  filePath: 'views/center/', // 文件路径
  order: null,
  inNav: true,
}

export default centerRouter
