import { combineReducers } from 'redux'
import { persistReducer, WebStorage } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { app } from './redux/app.redux'

interface IPersistConfig {
  key: string
  storage: WebStorage
  whitelist?: string[]
}

const appPersistConfig: IPersistConfig = {
  key: 'app',
  storage,
  whitelist: ['logined', 'user', 'permissions'],
}

// 合并所有 reducer 并且返回
export default combineReducers({
  app: persistReducer(appPersistConfig, app),
})
