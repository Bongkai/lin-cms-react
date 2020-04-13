import React from 'react'
import { Form } from 'antd'
import { FormComponentProps } from '@/types/antd/Form'
import LinHeader from '@/components/base/lin-header/LinHeader'
import GroupInfo from './GroupInfo'

import './style/group-add.scss'

interface IProps extends FormComponentProps<any> {}

const formWrapper = Form.create<FormComponentProps<any>>({
  name: 'group_add',
})

function GroupAdd({ form }: IProps) {
  return (
    <div className='group-add-container'>
      <LinHeader title='新建分组信息' />
      <div className='content'>
        <GroupInfo pageType='add' form={form} />
      </div>
    </div>
  )
}

export default formWrapper(GroupAdd)
