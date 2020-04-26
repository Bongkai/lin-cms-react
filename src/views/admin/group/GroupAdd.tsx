import React from 'react'
import LinHeader from '@/components/base/lin-header/LinHeader'
import GroupInfo from './GroupInfo'

import './style/group-add.scss'

export default function GroupAdd() {
  return (
    <div className='group-add-container'>
      <LinHeader title='新建分组信息' />
      <div className='content'>
        <GroupInfo pageType='add' />
      </div>
    </div>
  )
}
