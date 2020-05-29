import { config } from './config'

import { StoreCreator } from 'dream-redux'
import { IStoreState } from '@/types/store'

export const {
  store,
  persistor,
  useSelector: useDefaultSelector,
  commitMutation,
} = new StoreCreator(config)

// 封装 useSelector，省略指定泛型步骤
export function useSelector<T>(selector: (state: IStoreState) => T) {
  return useDefaultSelector(selector)
}
