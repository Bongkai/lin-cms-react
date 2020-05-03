import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import LinCheckbox from '@/components/base/lin-checkbox/LinCheckbox'
import LoadingWrapper from '@/components/base/loading-wrapper/LoadingWrapper'
import Admin from '@/lin/models/admin'
import useFirstMountState from '@/hooks/base/useFirstMountState'
import { MAX_SUCCESS_CODE } from '@/config/global'

import {
  IGroupItem,
  IAllPermissions,
  IGroupItemWithPermissions,
  IPermissionItem,
  IResponseWithoutData,
} from '@/types/model'

import './style/group-info.scss'

interface IProps {
  pageType: string
  data?: IGroupItem
}

interface IPermissionModuleFormedIds {
  [propName: string]: number[]
}

const addLayout = { labelCol: { span: 3 }, wrapperCol: { span: 16 } }
const infoLayout = { labelCol: { span: 4 }, wrapperCol: { span: 19 } }
const permissionsLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }

const buttonLayout = { wrapperCol: { offset: 3 } }

function GroupInfo({ pageType, data = {} as IGroupItem }: IProps, ref: any) {
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
  const [form] = Form.useForm()
  const history = useHistory()
  const isFirstMount = useFirstMountState()

  const isAddPage = pageType === 'add'
  const isInfoPage = pageType === 'info'
  const isPermissionsPage = pageType === 'permissions'

  const { id } = data

  // prettier-ignore
  const formLayout = isAddPage
    ? addLayout
    : (isPermissionsPage ? permissionsLayout : infoLayout)

  let fieldNames: string[], submitFunc: (fields: any) => Promise<boolean>

  if (pageType === 'add') {
    fieldNames = isFirstMount ? [] : Object.keys(form.getFieldsValue())
    submitFunc = submitAdd
  } else if (pageType === 'info') {
    fieldNames = ['name', 'info']
    submitFunc = submitInfo
  } else if (pageType === 'permissions') {
    fieldNames = Object.keys(allPermissions)
    submitFunc = submitPermissions
  }

  // 初始化时获取全部权限组
  useEffect(() => {
    async function getGroupAuths() {
      const allPermissions: IAllPermissions = await Admin.getAllPermissions()
      setPermissionModuleName(Object.keys(allPermissions))

      if (id || id === 0) {
        const groupInfo: IGroupItemWithPermissions = await Admin.getOneGroup(id)
        const formedIds = _getFormedPermissionIds(groupInfo.permissions)
        setPermissionModuleIds(formedIds)
      }
      setAllPermissions(allPermissions)
      setLoading(false)
    }

    function _getFormedPermissionIds(
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
  async function onSubmit(finalFunc?: (success?: boolean) => void) {
    form
      .validateFields(fieldNames)
      .then(async values => {
        console.log(values)
        setSubmitting(true)
        // 通知父组件提交后续操作的类型，返回 true 则关闭 Modal 并刷新数据
        const success = await submitFunc(values)
        finalFunc && finalFunc(success)
      })
      .catch(errorInfo => {
        const errMsg = isAddPage ? '请将信息填写完整' : '请填写正确的信息'
        message.error(errMsg)
        finalFunc && finalFunc(false)
      })
  }

  async function submitAdd(fields: any): Promise<boolean> {
    const { name, info, ...permissionsObj } = fields
    let res: IResponseWithoutData
    try {
      const permissions = _getPermissionsIds(permissionsObj)
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
    const permissions = _getPermissionsIds(permissionsObj)
    const IOriginalAuths = _getPermissionsIds(permission_module_ids)
    const { addPermissions, deletePermissions } = _diffPermissions(
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
  function _getPermissionsIds(
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

  function _diffPermissions(
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

  // 表单默认数据
  const initialValues = useMemo(
    () => {
      const infoValues = isPermissionsPage
        ? {}
        : {
            name: isInfoPage ? data.name : null,
            info: isInfoPage ? data.info : null,
          }

      const permissionsValues = {}
      !isInfoPage &&
        permission_module_name.forEach(name => {
          permissionsValues[name] = isPermissionsPage
            ? permission_module_ids[name] || []
            : []
        })

      return Object.assign(infoValues, permissionsValues)
    },
    [permission_module_ids], // eslint-disable-line
  )

  useEffect(() => {
    form.resetFields()
  }, [permission_module_ids]) // eslint-disable-line

  return (
    <div className='group-info-container'>
      <Form
        form={form}
        initialValues={initialValues}
        colon={false}
        {...formLayout}
      >
        <Form.Item
          name='name'
          label='分组名称'
          validateTrigger='onBlur'
          rules={[{ required: true, message: '分组名称不能为空' }]}
          required
          r-if={!isPermissionsPage}
        >
          <Input />
        </Form.Item>

        <Form.Item name='info' label='分组描述' r-if={!isPermissionsPage}>
          <Input />
        </Form.Item>

        <Form.Item label={isAddPage ? '分配权限' : ''} r-if={!isInfoPage}>
          <LoadingWrapper loading={loading} style={{ marginTop: 8 }}>
            {permission_module_name.map(name => (
              <Form.Item key={name} shouldUpdate noStyle>
                {/* 这里要使用一个返回 JSX 的方法来配合 shouldUpdate 实现重置时重渲染 */}
                {() => (
                  <LinCheckbox
                    name={name}
                    moduleName={name}
                    options={allPermissions[name]}
                    form={form}
                    itemValueKey='id' // 将 allPermissions[name].id 当作 CheckItem 的 value 和 key
                    itemNameKey='name' // 将 allPermissions[name].name 当作 CheckItem 的 name
                    checkAllClassName='checkbox-all'
                    checkGroupClassName='checkbox-group'
                    checkItemClassName='checkbox-item'
                  />
                )}
              </Form.Item>
            ))}
          </LoadingWrapper>
        </Form.Item>

        <Form.Item
          r-if={isAddPage}
          validateTrigger='onBlur'
          required
          {...buttonLayout}
        >
          <Button
            type='primary'
            loading={submitting}
            onClick={() => onSubmit()}
            style={{ marginRight: 10 }}
          >
            确 定
          </Button>
          <Button onClick={onReset}>重 置</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default forwardRef(GroupInfo)
