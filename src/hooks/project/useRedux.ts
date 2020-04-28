import { useSelector, useDispatch } from 'react-redux'
import { store } from '@/store'

import { IStoreState, IAppState, IAction } from '@/types/store'

// 原版 API
export { useSelector, useDispatch }

// store.state
export function useStateSelector() {
  return useSelector<IStoreState, IStoreState>(state => state)
}

// store.state.app
export function useAppSelector() {
  return useSelector<IStoreState, IAppState>(state => state.app)
}

/**
 * promisic dispatch
 *
 * 使用方法：
 * const dispatch = usePromisicDispatch()
 * dispatch(action).then(state => { // 此处的 state 为更新后的 store.state })
 *
 * 注意事项：
 * 不保证在任何场景下都能使用，如有出现异常的场景请在 GitHub 提 Issue
 *
 */
export function usePromisicDispatch() {
  const dispatch = useDispatch()

  return (action: IAction) => {
    dispatch(action)
    return new Promise((resolve: (state: IStoreState) => void) => {
      const state = store.getState()
      resolve(state)
    })
  }
}
