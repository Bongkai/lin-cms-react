import React from 'react'
import { Input } from 'antd'
import Utils from '@/lin/utils/util'

import './lin-search.scss'

interface ILinSearch {
  onValueChange: (value: string) => void
}

export default function LinSearch({ onValueChange }: ILinSearch) {
  const onDebounceValueChange = Utils.debounce(
    value => onValueChange(value),
    1000,
  )

  return (
    <div className='lin-search-container'>
      <Input.Search
        className='lin-search'
        placeholder='请输入内容'
        onChange={ev => onDebounceValueChange(ev.target.value)}
        allowClear
        enterButton
      />
    </div>
  )
}
