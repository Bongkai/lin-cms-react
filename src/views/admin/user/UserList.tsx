import React, { useState, useEffect } from 'react'
import { Modal, Select, Pagination, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import LinHeader from '@/components/base/lin-header/LinHeader'
import LinTable, {
  ILinTableOperation,
  IColumnsItem,
} from '@/components/base/lin-table/LinTable'
import FormModal from './FormModal'
import Admin from '@/lin/models/admin'
import useAwait from '@/hooks/base/useAwait'
import { MAX_SUCCESS_CODE } from '@/config/global'

import {
  IAdminUserItem,
  IAdminUsers,
  IResponseWithoutData,
} from '@/types/model'

import './style/user-list.scss'

const PAGE_COUNT = 10 // 每页10条数据

// 设置表头信息
const tableColumn: IColumnsItem[] = [
  { dataIndex: 'username', title: '名称', ellipsis: true },
  { dataIndex: 'groupNames', title: '所属分组', ellipsis: true },
]

export default function UserList() {
  const [tableData, setTableData] = useState<IAdminUserItem[]>([]) // 表格数据
  const [total, setTotal] = useState(0) // 分组内的用户总数
  const [currentPage, setCurrentPage] = useState(1) // 默认获取第一页的数据
  const [modalFormVisible, setModalFormVisible] = useState(false) // 控制弹窗显示
  const [groupId, setGroupId] = useState<number | undefined>(undefined) // 选中分组的id
  const [editingRecord, setEditingRecord] = useState<IAdminUserItem>(
    {} as IAdminUserItem,
  )
  const [loading, setLoading] = useState(true)

  const operation: ILinTableOperation = [
    { name: '编辑', func: handleEdit, type: 'primary' },
    { name: '删除', func: handleDelete, type: 'danger' },
  ]

  // 获取所有分组
  const [groups] = useAwait(Admin.getAllGroups, [])

  // 用 useAwait 重写成上面的形式
  // useEffect(() => {
  //   async function getAllGroups() {
  //     try {
  //       const groups = await Admin.getAllGroups()
  //       setGroups(groups)
  //     } catch (e) {
  //       console.log(e)
  //     }
  //   }
  //   getAllGroups()
  // }, [])

  useEffect(() => {
    // 根据分组 刷新/获取分组内的用户
    async function getAdminUsers() {
      if (!loading) return
      let res: IAdminUsers
      const page = currentPage - 1
      try {
        setModalFormVisible(false) // 修改弹窗表单成功后关闭弹窗
        res = await Admin.getAdminUsers({
          page,
          group_id: groupId,
          count: PAGE_COUNT,
        })
        res.items.forEach(item => {
          item.group_ids = item.groups
          item.groupNames = item.group_ids.map(item => item.name).join(',')
          delete item.groups
        })
        setTableData(res.items)
        setTotal(res.total)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    getAdminUsers()
  }, [loading, currentPage, groupId])

  function onGroupChange(groupId: number) {
    setCurrentPage(1)
    setGroupId(groupId)
    setLoading(true)
  }

  function onPageChange(page: number) {
    setCurrentPage(page)
    setLoading(true)
  }

  function handleEdit(
    text: IAdminUserItem,
    record: IAdminUserItem,
    index: number,
  ) {
    setModalFormVisible(true)
    setEditingRecord(record)
  }

  function handleDelete(
    text: IAdminUserItem,
    record: IAdminUserItem,
    index: number,
  ) {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将永久删除该用户, 是否继续?',
      okText: '确定',
      centered: true,
      maskClosable: true,
      onOk: () => deleteItem(record),
    })
  }

  async function deleteItem(record: IAdminUserItem) {
    try {
      let res: IResponseWithoutData = await Admin.deleteOneUser(record.id)
      if (res.code < MAX_SUCCESS_CODE) {
        setLoading(true)
        message.success(`${res.message}`)
      } else {
        setLoading(false)
        message.error(`${res.message}`)
      }
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  }

  function refreshData() {
    setLoading(true)
  }

  function closeEditModal() {
    setModalFormVisible(false)
  }

  return (
    <div className='user-list-container'>
      <LinHeader title='用户列表' divider={false}>
        {/* 分组选择下拉框 */}
        <Select
          className='custom-antd group-select'
          allowClear
          placeholder='请选择分组'
          onChange={onGroupChange}
        >
          {groups.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </LinHeader>

      {/* 表格 */}
      <LinTable
        bordered
        stripe
        verticalDivider='none'
        horizonalDivider='none'
        columns={tableColumn}
        operation={operation}
        dataSource={tableData}
        // rowKey='id'
        rowKey='username'
        loading={loading}
        pagination={false}
      />

      {/* 分页 */}
      <div className='pagination'>
        <Pagination
          className='custom-antd'
          showQuickJumper
          current={currentPage}
          pageSize={PAGE_COUNT}
          total={total}
          onChange={onPageChange}
        />
      </div>

      {/* 弹窗 */}
      <FormModal
        visible={modalFormVisible}
        onCancel={closeEditModal}
        refreshData={refreshData}
        data={editingRecord}
      />
    </div>
  )
}
