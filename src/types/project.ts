export interface IRouterItem {
  title: string
  type: string
  name: string | symbol | null
  route: string | null
  filePath: string
  inNav: boolean
  icon: string
  order?: number | null
  permission?: string[] | null
  children?: IRouterItem[]
}
