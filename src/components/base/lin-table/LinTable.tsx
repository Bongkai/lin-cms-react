import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Table, Input, Button, Icon } from 'antd'
import { TableProps, ColumnProps } from '@/types/antd/Table'
import Highlighter from 'react-highlight-words'

import './lin-table.scss'

export interface IColumnsItem extends ColumnProps<any> {
  search?: boolean // 设为 true 开启列表头部的关键字搜索功能
}

interface IOperationCoreItem {
  name: string
  type: 'primary' | 'danger'
  func?: (...args: any) => any
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
  const [searchText, setSearchText] = useState('')
  const searchInput = useRef<any>()

  const getColumnSearchProps = useCallback(
    (dataIndex: string = '') => {
      function handleSearch(
        selectedKeys: string[],
        confirm: (...args: any) => any,
      ) {
        if (searchFunc) {
          searchFunc(selectedKeys, confirm)
        } else {
          confirm()
          setSearchText(selectedKeys[0])
        }
      }

      function handleReset(clearFilters: any) {
        clearFilters()
        setSearchText('')
      }

      return {
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: '8px' }}>
            <Input
              ref={searchInput}
              style={{ width: '188px', marginBottom: '8px', display: 'block' }}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={ev =>
                setSelectedKeys(ev.target.value ? [ev.target.value] : [])
              }
              onPressEnter={() => handleSearch(selectedKeys, confirm)}
            />
            <Button
              type='primary'
              icon='search'
              size='small'
              style={{ width: '90px', marginRight: '8px' }}
              onClick={() => handleSearch(selectedKeys, confirm)}
            >
              搜索
            </Button>
            <Button
              size='small'
              style={{ width: '90px' }}
              onClick={() => handleReset(clearFilters)}
            >
              重置
            </Button>
          </div>
        ),
        filterIcon: (filtered: string) => (
          <Icon
            type='search'
            style={{ color: filtered ? '#3963bc' : undefined }}
          />
        ),
        onFilter: (value: string, record: any) =>
          record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible: boolean) => {
          if (visible) {
            setTimeout(() => searchInput.current.select())
          }
        },
        render: (text: string) => (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069' }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        ),
      }
    },
    [searchText], // eslint-disable-line
  )

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

        _columns.forEach((item, index) => {
          if (item.search) {
            const searchProps =
              typeof item.search === 'string' ? item.search : item.dataIndex

            _columns[index] = {
              ...item,
              ...getColumnSearchProps(searchProps),
            }
          }
        })
      }
      setColumns(_columns)
    }
    handleColumns()
  }, [getColumnSearchProps]) // eslint-disable-line

  const noVertDivider = verticalDivider === 'none' ? ' no-v-divider' : ''
  const noHoriDivider = horizonalDivider === 'none' ? ' no-h-divider' : ''
  const stripeType = stripe ? ' stripe' : stripeReverse ? ' stripe-reverse' : ''

  const classes = `lin-table${noVertDivider}${noHoriDivider}${stripeType}`

  return <Table className={classes} columns={columns} {...restProps} />
}
