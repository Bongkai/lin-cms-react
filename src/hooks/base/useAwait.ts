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

export default function useAwait<T>(
  request: (...args: any) => Promise<T>,
  ...args: any
): [T, Options] {
  const [store, setStore] = useState<Store>({
    loading: true,
    res: null,
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
