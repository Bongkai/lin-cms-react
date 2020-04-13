import { useState, useEffect } from 'react'

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
  ...args: any
): [T, Options] {
  const [store, setStore] = useState<Store>({
    loading: true,
    res: initialValue,
    err: null,
  })
  const { loading, res, err } = store

  useEffect(() => {
    loading && getData(args)
  }, [loading, args]) // eslint-disable-line

  function getData(args: any) {
    const response = request(...args)
    response
      .then(res => {
        setStore({ ...store, res, loading: false, err: null })
      })
      .catch(e => {
        setStore({ ...store, loading: false, err: e })
      })
  }

  function refresh(...args: any) {
    getData(args)
  }

  function setLoading(loading: boolean) {
    setStore({ ...store, loading })
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
