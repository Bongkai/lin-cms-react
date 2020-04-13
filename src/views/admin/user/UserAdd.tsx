import React from 'react'
import { Form } from 'antd'
import LinHeader from '@/components/base/lin-header/LinHeader'
import UserInfo from './UserInfo'
import { FormComponentProps } from '@/types/antd/Form'

import './style/user-add.scss'

interface IProps extends FormComponentProps<any> {}

const formWrapper = Form.create<FormComponentProps<any>>({
  name: 'user_add',
})

function UserAdd({ form }: IProps) {
  return (
    <div className='user-add-container'>
      <LinHeader title='新建用户' />
      <div className='content'>
        <UserInfo pageType='add' form={form} />
      </div>
    </div>
  )
}

export default formWrapper(UserAdd)
