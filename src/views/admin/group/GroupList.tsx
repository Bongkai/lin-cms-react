import React, { useState, useEffect } from 'react'
import { Modal, message } from 'antd'
import LinHeader from '@/components/base/lin-header/LinHeader'
import LinTable, {
  ILinTableOperation,
  IColumnsItem,
} from '@/components/base/lin-table/LinTable'
import FormModal from './FormModal'
import Admin from '@/lin/models/admin'
import { MAX_SUCCESS_CODE } from '@/config/global'

import { IGroupItem, IResponseWithoutData } from '@/types/model'

import './style/group-list.scss'

// 设置表头信息
const tableColumn: IColumnsItem[] = [
  { dataIndex: 'name', title: '名称', ellipsis: true },
  { dataIndex: 'info', title: '信息', ellipsis: true },
]

export default function GroupList() {
  const [tableData, setTableData] = useState<IGroupItem[]>([])
  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<IGroupItem>(
    {} as IGroupItem,
  )
  const [loading, setLoading] = useState(true)

  const operation: ILinTableOperation = [
    { name: '编辑', func: handleEdit, type: 'primary' },
    { name: '删除', func: handleDelete, type: 'danger' },
  ]

  useEffect(() => {
    getAllGroups()
  }, [])

  async function getAllGroups() {
    try {
      // 修改弹窗表单成功后关闭弹窗
      setModalFormVisible(false)
      const tableData: IGroupItem[] = await Admin.getAllGroups()
      setTableData(tableData)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(text: IGroupItem, record: IGroupItem, index: number) {
    setModalFormVisible(true)
    setEditingRecord(record)
  }

  function handleDelete(text: IGroupItem, record: IGroupItem, index: number) {
    Modal.confirm({
      title: '提示',
      icon: 'exclamation-circle',
      content: '此操作将永久删除该分组, 是否继续?',
      okText: '确定',
      centered: true,
      maskClosable: true,
      onOk: () => deleteItem(record),
    })
  }

  async function deleteItem(record: IGroupItem) {
    try {
      setLoading(true)
      let res: IResponseWithoutData = await Admin.deleteOneGroup(record.id)
      if (res.code < MAX_SUCCESS_CODE) {
        message.success(`${res.message}`)
        await getAllGroups()
      } else {
        message.error(`${res.message}`)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  function closeEditModal() {
    setModalFormVisible(false)
  }

  return (
    <div className='group-list-container'>
      <LinHeader title='分组列表信息' divider={false} />

      {/* 表格 */}
      <LinTable
        bordered
        stripe
        verticalDivider='none'
        horizonalDivider='none'
        columns={tableColumn}
        operation={operation}
        dataSource={tableData}
        rowKey='id'
        loading={loading}
        pagination={false}
      />

      {/* 弹窗 */}
      <FormModal
        visible={modalFormVisible}
        onCancel={closeEditModal}
        refreshData={getAllGroups}
        data={editingRecord}
      />
    </div>
  )
}
