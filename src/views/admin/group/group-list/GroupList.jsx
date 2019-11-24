import React from 'react'
import { Modal, message } from 'antd'
import LinTable from 'components/base/lin-table/LinTable'
import FormModal from './FormModal'
import Admin from 'lin/models/admin'

import './group-list.scss'


export default class GroupList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      modalFormVisible: false, // 控制弹窗显示
      editingRecord: {},
      loading: true,
    }

    // 设置表头信息
    this.tableColumn = [
      { dataIndex: 'name', title: '名称', ellipsis: true },
      { dataIndex: 'info', title: '信息', ellipsis: true },
    ]
    
    // 设置操作栏信息
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.operation = [
      { name: '编辑', func: this.handleEdit, type: 'primary' },
      { name: '删除', func: this.handleDelete, type: 'danger' }
    ]
  }

  async componentDidMount() {
    await this.getAllGroups()
  }

  async getAllGroups() {
    try {
      this.setState({
        loading: true,
        // 修改弹窗表单成功后关闭弹窗
        modalFormVisible: false
      }, async () => {
        const tableData = await Admin.getAllGroups()
        this.setState({
          tableData,
          totalNums: tableData.length,
          loading: false
        })
      })
    } catch (e) {
      console.log(e)
      this.setState({ loading: false })
    }
  }

  handleEdit(text, record, index) {
    this.setState({
      modalFormVisible: true,
      editingRecord: record
    })
  }

  handleDelete(text, record, index) {
    Modal.confirm({
      title: '提示',
      icon: 'exclamation-circle',
      content: '此操作将永久删除该分组, 是否继续?',
      okText: '确定',
      centered: true,
      maskClosable: true,
      onOk: () => this.deleteItem(record)
    })
  }

  deleteItem(record) {
    this.setState({ loading: true }, async () => {
      try {
        let res = await Admin.deleteOneGroup(record.id)
        if (res.error_code === 0) {
          message.success(`${res.msg}`)
          await this.getAllGroups()
        } else {
          message.error(`${res.msg}`)
        }
      } catch (e) {
        console.log(e)
        this.setState({ loading: false })
      }
    })
  }

  closeEditModal() {
    this.setState({
      modalFormVisible: false
    })
  }

  render() {
    const {
      loading, tableData,
      modalFormVisible, editingRecord,
    } = this.state
    return (
      <div className='group-list-container'>
        <div className='header'>
          <div className='title'>分组列表信息</div>
        </div>

        {/* 表格 */}
        <LinTable
          bordered stripe verticalDivider='none' horizonalDivider='none'
          columns={this.tableColumn}
          operation={this.operation}
          dataSource={tableData}
          rowKey='id'
          loading={loading}
          pagination={false}
        />

        {/* 弹窗 */}
        <FormModal
          visible={modalFormVisible}
          onCancel={()=>this.closeEditModal()}
          refreshData={()=>this.getAllGroups()}
          data={editingRecord}
        />
      </div>
    )
  }
}