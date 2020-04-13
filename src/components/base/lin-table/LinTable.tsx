import React, { useState, useEffect } from 'react'
import { Table, Button } from 'antd'
import { checkPermission } from '@/lin/directives/authorize'

import { TableProps, ColumnProps } from '@/types/antd/Table'

import './lin-table.scss'

export interface IColumnsItem extends ColumnProps<any> {}

interface IOperationCoreItem {
  name: string
  type: 'primary' | 'danger'
  func?: (...args: any) => any
  permission?: string | string[]
}

interface IOperation extends ColumnProps<any> {
  operation: IOperationCoreItem[]
}

export type ILinTableOperation = IOperation | IOperationCoreItem[]

interface ILinTable extends TableProps<any> {
  /** Table 的 columns 属性，新增自定义字段 */
  columns: IColumnsItem[]
  /** 自定义操作列 */
  operation?: ILinTableOperation
  /** 设为 none 取消内部竖直分隔线 */
  verticalDivider?: 'none'
  /** 设为 none 取消内部水平分隔线 */
  horizonalDivider?: 'none'
  /** 生成斑马条纹背景（奇灰偶白） */
  stripe?: boolean
  /** 生成反斑马条纹背景（奇白偶灰） */
  stripeReverse?: boolean
  /** 自定义关键字搜索的执行方法（需设置 columns 中对应列的 search 字段） */
  searchFunc?: (...args: any) => any
}

LinTable.defaultProps = {
  columns: [],
  operation: [],
  stripe: false,
  stripeReverse: false,
}

export default function LinTable(props: ILinTable) {
  const {
    verticalDivider,
    horizonalDivider,
    stripe,
    stripeReverse,
    columns: originColumns,
    operation,
    searchFunc,
    ...restProps
  } = props
  const [columns, setColumns] = useState<IColumnsItem[]>([])

  useEffect(() => {
    function handleColumns() {
      // props.operation 可能是包含 operationCore 的对象，也可能是 operationCore 本身
      const operationArr =
        (operation as IOperation).operation ||
        (operation as IOperationCoreItem[])
      const _columns = [...originColumns]
      if (Array.isArray(operationArr)) {
        _columns.push({
          title: (operation as IOperation).title || '操作',
          width: (operation as IOperation).width || 175,
          fixed: (operation as IOperation).fixed,
          render: (text: any, record: any, index: number) => (
            <div>
              {operationArr.map((item: IOperationCoreItem) => (
                <Button
                  className='custom-antd btn-plain'
                  style={{ marginRight: 10 }}
                  size='small'
                  type={item.type}
                  key={item.name}
                  disabled={
                    !checkPermission({
                      permission: item.permission ? item.permission : '',
                      // type: 'disabled',
                    })
                  }
                  onClick={() => {
                    item.func && item.func(text, record, index)
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          ),
        })
      }
      setColumns(_columns)
    }
    handleColumns()
  }, []) // eslint-disable-line

  const noVDivider = verticalDivider === 'none' ? 'no-v-divider' : ''
  const noHDivider = horizonalDivider === 'none' ? 'no-h-divider' : ''
  const stripeType = stripe ? 'stripe' : stripeReverse ? 'stripe-reverse' : ''

  const classes = `lin-table ${noVDivider} ${noHDivider} ${stripeType}`

  return <Table className={classes} columns={columns} {...restProps} />
}
