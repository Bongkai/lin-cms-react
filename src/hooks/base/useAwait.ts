import { useEffect } from 'react'
import { useImmer } from 'use-immer'

interface Store {
  loading: boolean
  res: any
  err: any
}

interface Options {
  loading: boolean
  setLoading: (loading: boolean) => void
  err: any
  refresh: (...args: any) => void
}

/**
 * 执行异步请求方法
 *
 * @param request 需要执行的异步方法
 * @param initialValue 初始化的返回值，后续有参数且无默认值需写 undefined 占位
 * @param args 该方法的参数，以平铺方式写在最后
 */
export default function useAwait<T>(
  request: (...args: any) => Promise<T>,
  initialValue?: any,
  ...args: any[]
): [T, Options] {
  const [store, setStore] = useImmer<Store>({
    loading: true,
    res: initialValue,
    err: null,
  })
  const { loading, res, err } = store

  useEffect(() => {
    loading && getData(args)
  }, [loading, args]) // eslint-disable-line

  function getData(args: any[]) {
    const response = request(...args)
    response
      .then(res => {
        setStore(store => {
          store.res = res
          store.loading = false
          store.err = null
        })
      })
      .catch(e => {
        setStore(store => {
          store.loading = false
          store.err = e
        })
      })
  }

  function refresh(...args: any[]) {
    getData(args)
  }

  function setLoading(loading: boolean) {
    setStore(store => {
      store.loading = loading
    })
  }

  return [
    res,
    {
      loading,
      setLoading,
      err,
      refresh,
    },
  ]
}
