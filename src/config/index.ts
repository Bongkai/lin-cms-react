interface AppConfigType {
  baseURL: string
  stagnateTime: number
  openAutoJumpOut: boolean
  notLoginRoute: string[]
  sideBarLevel: number
  defaultRoute: string
}

const Config: AppConfigType = {
  baseURL: 'http://demo.lin.colorful3.com',
  stagnateTime: 1 * 60 * 60 * 1000, // 无操作停滞时间  默认1小时
  openAutoJumpOut: false, // 是否开启无操作跳出
  notLoginRoute: ['login'], // 无需登录即可访问的路由 name,
  sideBarLevel: 3, // 侧边栏层级限制, 3表示三级, 可设置 2 和 3
  defaultRoute: '/about', // 默认打开的路由
}

export default Config