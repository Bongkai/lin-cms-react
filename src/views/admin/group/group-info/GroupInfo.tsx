import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import LinCheckbox from 'components/base/lin-checkbox/LinCheckbox'
import LoadingWrapper from 'components/base/loading-wrapper/LoadingWrapper'
import Admin, {
  IAllAuths,
  IGroupItem,
  IGroupItemWithAuths,
  IResponseWithoutData,
} from 'lin/models/admin'

import './group-info.scss'
import { WrappedFormUtils } from '@/types/antd/Form'

interface IProps {
  form: WrappedFormUtils
  pageType: string
  data?: IGroupItem
}

interface IAllPlainAuthsItem {
  auths: string[]
  module: string
}

interface IPlainAuths {
  [propName: string]: string[]
}

const { Item } = Form

const layout_add = {
  labelCol: { xs: { span: 24 }, sm: { span: 3 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 21 } },
}
const layout_info = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 19 } },
}
const layout_auths = {
  wrapperCol: { xs: { span: 24 }, sm: { span: 24 } },
}

function GroupInfo(
  { form, pageType, data = {} as IGroupItem }: IProps,
  ref: any,
) {
  // 全部用于渲染 Checkbox 的权限数据
  const [allPlainAuths, setAllPlainAuths] = useState<IAllPlainAuthsItem[]>([])
  // 该分组具有的用于渲染 Checkbox 的权限数据
  const [plainAuths, setPlainAuths] = useState<IPlainAuths>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isAuthsPage = pageType === 'auths'
  const { id } = data
  // prettier-ignore
  const layout = isAddPage ? layout_add : (isAuthsPage ? layout_auths : layout_info)
  const history = useHistory()

  let fieldNames: string[], submitFunc: (fields: any) => Promise<boolean>

  if (pageType === 'add') {
    fieldNames = Object.keys(form.getFieldsValue())
    submitFunc = submitAdd
  } else if (pageType === 'info') {
    fieldNames = ['name', 'info']
    submitFunc = submitInfo
  } else if (pageType === 'auths') {
    fieldNames = allPlainAuths.map(item => item.module)
    submitFunc = submitAuths
  }

  // 获取
  useEffect(() => {
    async function getGroupAuths() {
      const allAuths: IAllAuths = await Admin.getAllAuths()
      const allPlainAuths: IAllPlainAuthsItem[] = getAllPlainAuths(allAuths)
      let plainAuths = {} as IPlainAuths
      if (id || id === 0) {
        const groupInfo: IGroupItemWithAuths = await Admin.getOneGroup(id)
        groupInfo.auths.forEach(item => {
          const itemAuths: string[] = []
          const key = Object.keys(item)[0]
          item[key].forEach(_item => {
            itemAuths.push(_item.auth)
          })
          plainAuths[key] = itemAuths
        })
      }
      setAllPlainAuths(allPlainAuths)
      setPlainAuths(plainAuths)
      setLoading(false)
    }
    getGroupAuths()
  }, []) // eslint-disable-line

  // 对外暴露的方法
  useImperativeHandle(ref, () => ({
    onSubmit,
    onReset,
  }))

  // 把 API 获取的数据转成组件需要的结构
  function getAllPlainAuths(allAuths: IAllAuths): IAllPlainAuthsItem[] {
    const allPlainAuths: IAllPlainAuthsItem[] = []
    for (const key in allAuths) {
      allPlainAuths.push({
        module: key,
        auths: Object.keys(allAuths[key]),
      })
    }
    return allPlainAuths
  }

  /**
   * 适用不同场景的重置方法
   */
  function onReset() {
    if (fieldNames === null) {
      form.resetFields()
    } else {
      form.resetFields(fieldNames)
    }
  }

  /**
   * 适用不同场景的提交方法
   * @param {*} submitType 添加分组/修改信息/配置权限
   * @param {*} finalFunc 处理提交后执行的函数，传入 true 时为提交成功或无修改，传入 false 为提交失败
   */
  async function onSubmit(finalFunc?: (success: boolean | null) => void) {
    form.validateFields(
      fieldNames,
      async (errors: object | null, values: any) => {
        if (errors) {
          const errMsg = isAddPage ? '请将信息填写完整' : '请填写正确的信息'
          message.error(errMsg)
          finalFunc && finalFunc(false)
          return
        }

        setSubmitting(true)
        // 通知父组件提交后续操作的类型，返回 true 则关闭 Modal 并刷新数据
        const success = await submitFunc(values)
        finalFunc && finalFunc(success)
      },
    )
  }

  async function submitAdd(fields: any): Promise<boolean> {
    const { name, info, ...authsObj } = fields
    let res: IResponseWithoutData
    try {
      const auths = getAuthsValues(authsObj)
      // res = await Admin.createOneGroup(name, info, auths, id)
      res = await Admin.createOneGroup(name, info, auths)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res ? res.error_code === 0 : false
    if (success) {
      history.push('/admin/group/list')
      message.success(`${res.msg}`)
    } else {
      res && message.error(`${res.msg}`)
    }
    setSubmitting(false)
    return success
  }

  async function submitInfo(fields: any): Promise<boolean> {
    const { name, info } = fields
    if (name === data.name && info === data.info) {
      return true
    }
    const res: IResponseWithoutData = await Admin.updateOneGroup(name, info, id)
    const success = res.error_code === 0
    if (success) {
      message.success(`${res.msg}`)
    }
    return success
  }

  async function submitAuths(fields: any): Promise<boolean> {
    const { name, info, ...authsObj } = fields
    const auths = getAuthsValues(authsObj)
    const IOriginalAuths = getAuthsValues(plainAuths)
    const { addAuths, deleteAuths } = diffAuths(IOriginalAuths, auths)
    let addRes = {} as IResponseWithoutData,
      delRes = {} as IResponseWithoutData
    if (addAuths.length === 0 && deleteAuths.length === 0) {
      return true
    }
    if (addAuths.length > 0) {
      addRes = await Admin.dispatchAuths(id, addAuths)
    }
    if (deleteAuths.length > 0) {
      delRes = await Admin.removeAuths(id, deleteAuths)
    }
    const success = addRes.error_code === 0 || delRes.error_code === 0
    if (success) {
      message.success('权限修改成功')
    }
    return success
  }

  // 处理权限数据格式
  function getAuthsValues(authsObj: IPlainAuths): string[] {
    const auths: string[] = []
    for (const key in authsObj) {
      if (Array.isArray(authsObj[key])) {
        authsObj[key].forEach(item => {
          auths.push(item)
        })
      }
    }
    return auths
  }

  function diffAuths(
    oldAuths: string[],
    newAuths: string[],
  ): {
    addAuths: string[]
    deleteAuths: string[]
  } {
    const addAuths: string[] = [],
      deleteAuths: string[] = []
    newAuths.forEach(item => {
      const hit = oldAuths.some(item2 => item === item2)
      if (!hit) {
        addAuths.push(item)
      }
    })
    oldAuths.forEach(item => {
      const hit = newAuths.some(item2 => item === item2)
      if (!hit) {
        deleteAuths.push(item)
      }
    })
    return { addAuths, deleteAuths }
  }

  const { getFieldDecorator } = form

  return (
    <div className='group-info-container'>
      <Form className='custom-antd' {...layout} colon={false}>
        {!isAuthsPage && (
          <>
            <Item label='分组名称' required>
              {getFieldDecorator('name', {
                validate: [
                  {
                    trigger: 'onBlur',
                    rules: [{ required: true, message: '分组名称不能为空' }],
                  },
                ],
                initialValue: isInfoPage ? (data as any).name : null,
              })(<Input className='custom-antd' />)}
            </Item>
            <Item label='分组描述'>
              {getFieldDecorator('info', {
                initialValue: isInfoPage ? (data as any).info : null,
              })(<Input className='custom-antd' />)}
            </Item>
          </>
        )}

        {!isInfoPage && (
          <Item className='auths-item' label={isAddPage ? '分配权限' : ''}>
            <LoadingWrapper loading={loading}>
              <div className='permissions-box'>
                {allPlainAuths.map(item => (
                  <LinCheckbox
                    key={item.module}
                    moduleName={item.module}
                    options={item.auths}
                    checkAllClassName='checkbox-all'
                    checkGroupClassName='checkbox-group'
                    form={form}
                    decoratorId={item.module}
                    decoratorOptions={{
                      initialValue: isAuthsPage ? plainAuths[item.module] : [],
                    }}
                  />
                ))}
              </div>
            </LoadingWrapper>
          </Item>
        )}

        {isAddPage && (
          <Item className='submit' label=' '>
            <Button
              type='primary'
              loading={submitting}
              onClick={() => onSubmit()}
            >
              确 定
            </Button>
            <Button onClick={onReset}>重 置</Button>
          </Item>
        )}
      </Form>
    </div>
  )
}

export default forwardRef(GroupInfo)
