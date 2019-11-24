import React from 'react'
import stageConfig from './config/stage' // 引入舞台配置

export default class Stage extends React.Component {
  // constructor(props) {
  //   super(props)
  // }

  // 深度遍历配置树, 摘取叶子节点作为路由部分
  deepTravel(config, fuc) {
    if (Array.isArray(config)) {
      config.forEach((subConfig) => {
        this.deepTravel(subConfig, fuc)
      })
    } else if (config.children) {
      config.children.forEach((subConfig) => {
        this.deepTravel(subConfig, fuc)
      })
    } else {
      fuc(config)
    }
  }
  
  render() {
    const homeConfig = []
    const homeRouter = []

    this.deepTravel(stageConfig, (viewConfig) => {
      // 构造舞台view路由
      const viewRouter = {}
      viewRouter.path = viewConfig.route
      viewRouter.name = viewConfig.name
      // viewRouter.component = () => import(`@/${viewConfig.filePath}`)
      viewRouter.component = `[Component ${viewConfig.route}]`
      viewRouter.meta = {
        title: viewConfig.title,
        icon: viewConfig.icon,
        right: viewConfig.right,
        type: viewConfig.type,
        blueBaseColor: viewConfig.blueBaseColor ? 'viewConfig.blueBaseColor' : '',
      }
      homeRouter.push(viewRouter)
      homeConfig.push(viewRouter)
    })

    console.log('homeConfig', homeConfig)
    console.log('homeRouter', homeRouter)
    
    return (
      <div>Stage</div>
    )
  }
}