import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  ChangeEvent,
} from 'react'
import { Input } from 'antd'
import Utils from '@/lin/utils/util'

import './lin-search.scss'

interface ILinSearch {
  onChange: (value: string) => void
}

function LinSearch({ onChange }: ILinSearch, ref: any) {
  const [value, setValue] = useState('')

  const debounceChange = Utils.debounce(lastChange, 1000)

  useImperativeHandle(ref, () => ({
    // 在外部直接修改 value 值
    setSearchData,
  }))

  function onValueChange(ev: ChangeEvent<HTMLInputElement>) {
    setValue(ev.target.value)
    debounceChange(ev.target.value)
  }

  function lastChange(value: string) {
    onChange && onChange(value)
  }

  function setSearchData(value: string | number = '') {
    if (typeof value === 'number') {
      value = value.toString()
    }
    if (typeof value === 'string') {
      setValue(value)
    }
  }

  return (
    <Input.Search
      className='custom-antd lin-search'
      value={value}
      placeholder='请输入内容'
      onChange={onValueChange}
      allowClear
      enterButton
    />
  )
}

export default forwardRef(LinSearch)
