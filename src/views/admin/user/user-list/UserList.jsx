import React from 'react'
import { Modal, Select, Pagination, message } from 'antd'
import LinTable from 'components/base/lin-table/LinTable'
import FormModal from './FormModal'
import Admin from 'lin/models/admin'

import './user-list.scss'


export default class UserList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: 0, // 用户id
      // refreshPagination: true, // 页数增加的时候，因为缓存的缘故，需要刷新Pagination组件
      // editIndex: null, // 编辑的行
      tableData: [], // 表格数据
      total: 0, // 分组内的用户总数
      currentPage: 1, // 默认获取第一页的数据
      pageCount: 10, // 每页10条数据
      // tableColumn: [], // 表头数据
      // operate: [], // 表格按键操作区
      modalFormVisible: false, // 控制弹窗显示
      // selectGroup: '', // 选中的分组Id
      groups: [], // 所有分组
      groupId: undefined,
      // activeTab: '修改信息',
      editingRecord: {},
      loading: true,
    }
    // 设置表头信息
    this.tableColumn = [
      { dataIndex: 'username', title: '名称', ellipsis: true },
      { dataIndex: 'group_name', title: '所属分组', ellipsis: true },
    ]
    
    // 设置操作栏信息
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.operation = [
      { name: '编辑', func: this.handleEdit, type: 'primary' },
      { name: '删除', func: this.handleDelete, type: 'danger' }
    ]

    this.onGroupChange = this.onGroupChange.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
  }

  async componentDidMount() {
    await this.getAdminUsers()
    this.getAllGroups()
  }

  // 根据分组 刷新/获取分组内的用户
  async getAdminUsers() {
    let res
    const { currentPage, groupId, pageCount } = this.state
    const page = currentPage - 1
    try {
      this.setState({ 
        loading: true,
        // 修改弹窗表单成功后关闭弹窗
        modalFormVisible: false
      }, async () => {
        res = await Admin.getAdminUsers({
          page,
          group_id: groupId,
          count: pageCount,
        })
        this.setState({
          tableData: [...res.items],
          // 不知为啥 total 多了一条（super？）
          total: res.total > 1 ? res.total - 1 : res.total,
          loading: false
        })
      })
    } catch (e) {
      console.log(e)
      this.setState({ loading: false })
    }
  }

  async getAllGroups() {
    try {
      this.setState({ loading: true }, async () => {
        const groups = await Admin.getAllGroups()
        this.setState({
          groups,
          loading: false
        })
      })
    } catch (e) {
      this.setState({
        loading: false
      })
      console.log(e)
    }
  }

  onGroupChange(groupId) {
    this.setState({
      currentPage: 1,
      groupId: groupId
    }, () => {
      this.getAdminUsers()
    })
  }

  onPageChange(page) {
    this.setState({
      currentPage: page
    }, () => {
      this.getAdminUsers()
    })
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
      content: '此操作将永久删除该用户, 是否继续?',
      okText: '确定',
      centered: true,
      maskClosable: true,
      onOk: () => this.deleteItem(record)
    })
  }

  deleteItem(record) {
    this.setState({ loading: true }, async () => {
      try {
        let res = await Admin.deleteOneUser(record.id)
        if (res.error_code === 0) {
          message.success(`${res.msg}`)
          await this.getAdminUsers()
        } else {
          message.error(`${res.msg}`)
        }
      } catch (e) {
        this.setState({ loading: false })
        console.log(e)
      }
    })
  }

  closeEditModal() {
    this.setState({
      modalFormVisible: false
    })
  }

  resetForm() {
    this.formUserInfo.resetForm()
  }

  submitForm() {
    this.formUserInfo.onSubmit()
  }
  
  render() {
    const {
      loading, tableData, groups, total, pageCount, currentPage,
      modalFormVisible, editingRecord,
    } = this.state
    return (
      <div className='user-list-container'>
        <div className='header'>
          <div className='title'>用户列表</div>
          {/* 分组选择下拉框 */}
          <Select className='custom-antd group-select' allowClear 
            placeholder='请选择分组' onChange={this.onGroupChange}
          >
            {groups.map(item => (
              <Select.Option key={item.id}>{item.name}</Select.Option>
            ))}
          </Select>
        </div>

        {/* 表格 */}
        <LinTable bordered stripe verticalDivider='none' horizonalDivider='none'
          columns={this.tableColumn}
          operation={this.operation}
          dataSource={tableData}
          rowKey='id'
          loading={loading}
          pagination={false}
        />

        {/* 分页 */}
        <div className='pagination'>
          <Pagination className='custom-antd' showQuickJumper 
            current={currentPage}
            pageSize={pageCount}
            total={total}
            onChange={this.onPageChange}
          />
        </div>

        {/* 弹窗 */}
        <FormModal
          visible={modalFormVisible}
          onCancel={()=>this.closeEditModal()}
          refreshData={()=>this.getAdminUsers()}
          data={editingRecord}
        />
      </div>
    )
  }
}
