import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, PersistGate } from 'dream-redux'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { store, persistor } from '@/store'
import App from './App'

// 导入 dayjs 的汉化文件
import 'dayjs/locale/zh-cn'

// 设置热更新
if (module.hot) {
  module.hot.accept(err => {
    if (err) {
      console.log('Cannot apply HMR update.', err)
    }
  })
}

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConfigProvider locale={zhCN} autoInsertSpaceInButton={false}>
        <App />
      </ConfigProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('app'),
)
