import { config } from './config'

import { StoreCreator } from 'dream-redux'
import { IStoreState, IAppState } from '@/types/store'

export const {
  store,
  persistor,
  useSelector,
  setReducer,
  commitMutation,
} = new StoreCreator(config)

// 快速获取 store.state.app
export function useAppSelector() {
  return useSelector<IStoreState, IAppState>(state => state.app)
}
