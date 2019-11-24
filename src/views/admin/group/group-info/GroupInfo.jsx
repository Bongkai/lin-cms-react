import React from 'react'
import { Form, Input, Button, Spin, message } from 'antd'
import LinCheckbox from 'components/base/lin-checkbox/LinCheckbox'
import Admin from 'lin/models/admin'

import './group-info.scss'

const { Item } = Form

const formItemLayout_add = {
  labelCol: { xs: { span: 24 }, sm: { span: 3 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 21 } }
}
const formItemLayout_info = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 19 } }
}
const formItemLayout_auths = {
  wrapperCol: { xs: { span: 24 }, sm: { span: 24 } }
}


export default class GroupInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      allAuths: {},       // 全部 Checkbox 列表的原始数据
      allPlainAuths: [],  // 全部用于渲染 Checkbox 的权限数据
      plainAuths: {}      // 该分组具有的用于渲染 Checkbox 的权限数据
    }
    this.isAddPage = this.props.pageType === 'add'
    this.isInfoPage = this.props.pageType === 'info'
    this.isAuthsPage = this.props.pageType === 'auths'

    this.id = this.props.data ? this.props.data.id : undefined

    this.layout = this.isAddPage ? formItemLayout_add
      : (this.isAuthsPage ? formItemLayout_auths : formItemLayout_info)

    this.onSubmit = this.onSubmit.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }

  componentDidMount() {
    this.getGroupAuths()
  }

  async getGroupAuths() {
    const allAuths = await Admin.getAllAuths()
    const allPlainAuths = this.getAllPlainAuths(allAuths)
    const { data } = this.props
    let plainAuths = {}
    if (data && data.id) {
      const groupInfo = await Admin.getOneGroup(data.id)
      groupInfo.auths.forEach(item => {
        const itemAuths = []
        const key = Object.keys(item)[0]
        item[key].forEach(_item => {
          itemAuths.push(_item.auth)
        })
        plainAuths[key] = itemAuths
      })
    }
    this.setState({
      allPlainAuths,
      plainAuths,
      loading: false
    })
  }

  getAllPlainAuths(allAuths) {
    const allPlainAuths = []
    for (const key in allAuths) {
      allPlainAuths.push({
        module: key,
        auths: Object.keys(allAuths[key])
      })
    }
    return allPlainAuths
  }

  resetForm() {
    this.props.form.resetFields()
  }

  /**
   * 适用不同场景的提交方法
   * @param {*} submitType 添加分组/修改信息/配置权限
   * @param {*} finalFunc 处理提交后执行的函数，传入 true 时为提交成功或无修改，传入 false 为提交失败
   */
  async onSubmit(submitType, finalFunc) {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        const errMsg = this.isAddPage ? '请将信息填写完整' : '请填写正确的信息'
        message.error(errMsg)
        finalFunc && finalFunc(false)
        return
      }
      
      let success
      if (submitType === '添加分组') {
        success = await this.submitAdd(values)
      } else if (submitType === '修改信息') {
        success = await this.submitInfo(values)
      } else if (submitType === '配置权限') {
        success = await this.submitAuths(values)
      }
      finalFunc && finalFunc(success)
    })
  }

  async submitAdd(fields) {
    // const fields = this.props.form.getFieldsValue()
    const { name, info, ...authsObj } = fields
    let res
    try {
      const auths = this._getAuthsValues(authsObj)
      res = await Admin.createOneGroup(name, info, auths, this.id)
    } catch (e) {
      console.log(e)
    }
    
    if (res.error_code === 0) {
      this.props.history.push('/admin/group/list')
      message.success(`${res.msg}`)
    } else {
      this.setState({ loading: false })
      message.error(`${res.msg}`)
    }
  }

  async submitInfo(fields) {
    // const fields = this.props.form.getFieldsValue()
    const { name, info } = fields
    const { data = {} } = this.props
    if (name === data.name && info === data.info) {
      return true
    }
    const res = await Admin.updateOneGroup(name, info, this.id)
    const success = (res.error_code === 0)
    if (success) {
      message.success(`${res.msg}`)
    }
    return success
  }

  async submitAuths(fields) {
    // const fields = this.props.form.getFieldsValue()
    const { name, info, ...authsObj } = fields
    const auths = this._getAuthsValues(authsObj)
    const originalAuths = this._getAuthsValues(this.state.plainAuths)
    const { addAuths, deleteAuths } = this._diffAuths(originalAuths, auths)
    let addRes = {}, delRes = {}
    if (addAuths.length === 0 && deleteAuths.length === 0) {
      return true
    }
    if (addAuths.length > 0) {
      addRes = await Admin.dispatchAuths(this.id, addAuths)
    }
    if (deleteAuths.length > 0) {
      delRes = await Admin.removeAuths(this.id, deleteAuths)
    }
    const success = (addRes.error_code === 0 || delRes.error_code === 0)
    if (success) {
      message.success('权限修改成功')
    }
    return success
  }

  // 处理权限数据格式
  _getAuthsValues(authsObj) {
    const auths = []
    for (const key in authsObj) {
      if (Array.isArray(authsObj[key])) {
        authsObj[key].forEach(item => {
          auths.push(item)
        })
      }
    }
    return auths
  }

  _diffAuths(oldAuths, newAuths) {
    const addAuths = [], deleteAuths = []
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

  render() {
    const { form, form: { getFieldDecorator }, data = {} } = this.props
    const { allPlainAuths, plainAuths, loading } = this.state
    const { isAddPage, isInfoPage, isAuthsPage } = this
    return (
      <div className='group-info-container'>
        <Form className='custom-antd' {...this.layout} colon={false}>
          {!isAuthsPage ? (<>
            <Item label='分组名称' required>
              {getFieldDecorator('name', {
                validate: [{
                  trigger: 'onBlur',
                  rules: [{ required: true, message: '分组名称不能为空' }],
                }],
                initialValue: isInfoPage ? data.name : null
              })(
                <Input className='custom-antd' />
              )}
            </Item>
            <Item label='分组描述'>
              {getFieldDecorator('info', {
                initialValue: isInfoPage ? data.info : null
              })(
                <Input className='custom-antd' />
              )}
            </Item>
          </>): null}
          
          {!isInfoPage ? (
            <Item className='auths-item' label={isAddPage ? '分配权限' : ''}>
              {
                loading ? 
                <Spin className='loading' size='large' />
                :
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
                        initialValue: isAuthsPage ? plainAuths[item.module] : []
                      }}
                    />
                  ))}
                </div>
              }
            </Item>
          ) : null}

          {isAddPage ? (
            <Item className='submit' label=' '>
              <Button type='primary' onClick={()=>this.onSubmit('添加分组')}>确 定</Button>
              <Button onClick={()=>this.resetForm()}>重 置</Button>
            </Item>
          ) : null}
        </Form>
      </div>
    )
  }
}
