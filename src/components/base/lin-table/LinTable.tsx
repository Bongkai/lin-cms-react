import React, { useEffect } from 'react'
import { useImmer } from 'use-immer'
import { Table, Button } from 'antd'
import { checkPermission } from '@/lin/directives/authorize'

import { TableProps } from 'antd/lib/table/Table'
import { ColumnType } from 'antd/lib/table/interface'

import './lin-table.scss'

export interface IColumnsItem extends ColumnType<any> {}

interface IOperationCore {
  name: string
  type: 'primary' | 'danger'
  func?: (...args: any) => any
  permission?: string | string[]
}

interface IOperation extends ColumnType<any> {
  operation: IOperationCore[]
}

export type ILinTableOperation = IOperation | IOperationCore[]

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
    ...restProps
  } = props
  const [columns, setColumns] = useImmer<IColumnsItem[]>(originColumns)

  // 初始化时加载 operationColumn
  useEffect(() => {
    function handleColumns() {
      // props.operation 可能是包含 operationCore 的对象，也可能是 operationCore 本身
      const operationArr =
        (operation as IOperation).operation || (operation as IOperationCore[])

      if (typeof operationArr === 'undefined') return

      const operationColumn = {
        title: (operation as IOperation).title || '操作',
        width: (operation as IOperation).width || 175,
        fixed: (operation as IOperation).fixed,
        render: (text: any, record: any, index: number) => (
          <div>
            {operationArr.map((item: IOperationCore) => (
              <Button
                className='custom-antd btn-plain'
                style={{ marginRight: 10 }}
                size='small'
                type={item.type}
                key={item.name}
                disabled={
                  !checkPermission({
                    permission: item.permission ? item.permission : '',
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
      }

      setColumns(columns => {
        columns.push(operationColumn)
      })
    }
    handleColumns()
  }, []) // eslint-disable-line

  return (
    <Table
      className='lin-table'
      r-class={{
        'no-v-divider': verticalDivider === 'none',
        'no-h-divider': horizonalDivider === 'none',
        stripe: stripe,
        'stripe-reverse': stripeReverse && !stripe,
      }}
      columns={columns}
      {...restProps}
    />
  )
}
