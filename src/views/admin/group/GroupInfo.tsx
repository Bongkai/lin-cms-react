import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import LinCheckbox from '@/components/base/lin-checkbox/LinCheckbox'
import LoadingWrapper from '@/components/base/loading-wrapper/LoadingWrapper'
import Admin from '@/lin/models/admin'
import { MAX_SUCCESS_CODE } from '@/config/global'

import {
  IGroupItem,
  IAllPermissions,
  IGroupItemWithPermissions,
  IPermissionItem,
  IResponseWithoutData,
} from '@/types/model'
import { WrappedFormUtils } from '@/types/antd/Form'

import './style/group-info.scss'

interface IProps {
  form: WrappedFormUtils
  pageType: string
  data?: IGroupItem
}

interface IPermissionModuleFormedIds {
  [propName: string]: number[]
}

const { Item } = Form

const layout_add = {
  labelCol: { xs: { span: 24 }, sm: { span: 3 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
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
  // 所有分组权限
  const [allPermissions, setAllPermissions] = useState<IAllPermissions>({})
  // 权限组 module name
  const [permission_module_name, setPermissionModuleName] = useState<string[]>(
    [],
  )
  // 权限组 集合 id（和 Vue 版结构有些不同）
  const [permission_module_ids, setPermissionModuleIds] = useState<
    IPermissionModuleFormedIds
  >({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isAuthsPage = pageType === 'permissions'
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
  } else if (pageType === 'permissions') {
    fieldNames = Object.keys(allPermissions)
    submitFunc = submitPermissions
  }

  // 获取
  useEffect(() => {
    async function getGroupAuths() {
      const allPermissions: IAllPermissions = await Admin.getAllPermissions()
      setPermissionModuleName(Object.keys(allPermissions))

      if (id || id === 0) {
        const groupInfo: IGroupItemWithPermissions = await Admin.getOneGroup(id)
        const formedIds = getFormedPermissionIds(groupInfo.permissions)
        setPermissionModuleIds(formedIds)
      }
      setAllPermissions(allPermissions)
      setLoading(false)
    }

    function getFormedPermissionIds(
      permissions: IPermissionItem[],
    ): IPermissionModuleFormedIds {
      const formedIds = {} as IPermissionModuleFormedIds
      permissions.forEach(item => {
        if (formedIds[item.module]) {
          formedIds[item.module].push(item.id)
        } else {
          formedIds[item.module] = [item.id]
        }
      })
      return formedIds
    }

    getGroupAuths()
  }, []) // eslint-disable-line

  // 对外暴露的方法
  useImperativeHandle(ref, () => ({
    onSubmit,
    onReset,
  }))

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
    const { name, info, ...permissionsObj } = fields
    let res: IResponseWithoutData
    try {
      const permissions = getPermissionsIds(permissionsObj)
      res = await Admin.createOneGroup(name, info, permissions)
    } catch (e) {
      console.log(e)
      setSubmitting(false)
      return false
    }

    const success = res ? res.code < MAX_SUCCESS_CODE : false
    if (success) {
      history.push('/admin/group/list')
      message.success(`${res.message}`)
    } else {
      res && message.error(`${res.message}`)
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
    const success = res.code < MAX_SUCCESS_CODE
    if (success) {
      message.success(`${res.message}`)
    }
    return success
  }

  async function submitPermissions(fields: any): Promise<boolean> {
    const { name, info, ...permissionsObj } = fields
    const permissions = getPermissionsIds(permissionsObj)
    const IOriginalAuths = getPermissionsIds(permission_module_ids)
    const { addPermissions, deletePermissions } = diffPermissions(
      IOriginalAuths,
      permissions,
    )
    let addRes = {} as IResponseWithoutData,
      delRes = {} as IResponseWithoutData
    if (addPermissions.length === 0 && deletePermissions.length === 0) {
      return true
    }
    if (addPermissions.length > 0) {
      addRes = await Admin.dispatchPermissions(id, addPermissions)
    }
    if (deletePermissions.length > 0) {
      delRes = await Admin.removePermissions(id, deletePermissions)
    }
    const success =
      addRes.code < MAX_SUCCESS_CODE || delRes.code < MAX_SUCCESS_CODE
    if (success) {
      message.success('权限修改成功')
    }
    return success
  }

  // 处理权限数据格式
  function getPermissionsIds(
    permissionsObj: IPermissionModuleFormedIds,
  ): number[] {
    const permissions: number[] = []
    for (const key in permissionsObj) {
      if (Array.isArray(permissionsObj[key])) {
        permissionsObj[key].forEach(item => {
          permissions.push(item)
        })
      }
    }
    return permissions
  }

  function diffPermissions(
    oldPermissions: number[],
    newPermissions: number[],
  ): {
    addPermissions: number[]
    deletePermissions: number[]
  } {
    const addPermissions: number[] = [],
      deletePermissions: number[] = []
    newPermissions.forEach(item => {
      const hit = oldPermissions.some(item2 => item === item2)
      if (!hit) {
        addPermissions.push(item)
      }
    })
    oldPermissions.forEach(item => {
      const hit = newPermissions.some(item2 => item === item2)
      if (!hit) {
        deletePermissions.push(item)
      }
    })
    return { addPermissions, deletePermissions }
  }

  const { getFieldDecorator } = form

  return (
    <div className='group-info-container'>
      <Form className='custom-antd' {...layout} colon={false}>
        <Item label='分组名称' required r-if={!isAuthsPage}>
          {getFieldDecorator('name', {
            validate: [
              {
                trigger: 'onBlur',
                rules: [{ required: true, message: '分组名称不能为空' }],
              },
            ],
            initialValue: isInfoPage ? data.name : null,
          })(<Input className='custom-antd' />)}
        </Item>

        <Item label='分组描述' r-if={!isAuthsPage}>
          {getFieldDecorator('info', {
            initialValue: isInfoPage ? data.info : null,
          })(<Input className='custom-antd' />)}
        </Item>

        <Item label={isAddPage ? '分配权限' : ''} r-if={!isInfoPage}>
          <LoadingWrapper loading={loading}>
            <div className='permissions-box'>
              {permission_module_name.map(name => (
                <LinCheckbox
                  key={name}
                  moduleName={name}
                  options={allPermissions[name]}
                  valueKey='id'
                  nameKey='name'
                  checkAllClassName='checkbox-all'
                  checkGroupClassName='checkbox-group'
                  checkItemClassName='checkbox-item'
                  form={form}
                  decoratorId={name}
                  decoratorOptions={{
                    initialValue: isAuthsPage
                      ? permission_module_ids[name] || []
                      : [],
                  }}
                />
              ))}
            </div>
          </LoadingWrapper>
        </Item>

        <Item className='submit' label=' ' r-if={isAddPage}>
          <Button
            type='primary'
            loading={submitting}
            onClick={() => onSubmit()}
          >
            确 定
          </Button>
          <Button onClick={onReset}>重 置</Button>
        </Item>
      </Form>
    </div>
  )
}

export default forwardRef(GroupInfo)
