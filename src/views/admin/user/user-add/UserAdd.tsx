import React from 'react'
import { Form } from 'antd'
import LinHeader from 'components/base/lin-header/LinHeader'
import UserInfo from '../user-info/UserInfo'
import { FormComponentProps } from '@/types/antd/Form'

import './user-add.scss'

interface IProps extends FormComponentProps {}

const formWrapper = Form.create<IProps>({
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
