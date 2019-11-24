import React from 'react'
import PropTypes from 'prop-types'
import { Table, Input, Button, Icon } from 'antd'
import Highlighter from 'react-highlight-words'

import './lin-table.scss'


export default class LinTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchText: ''
    }
    this.columns = []
  }

  static propTypes = {
    /** Table 的 columns 属性，新增自定义字段 */
    columns: PropTypes.arrayOf(PropTypes.shape({
      search: PropTypes.bool, // 设为 true 开启列表头部的关键字搜索功能
    })),
    /** 自定义操作列 */
    operation: PropTypes.oneOfType([
      // 只有核心自定义数据
      PropTypes.arrayOf(PropTypes.shape({
        func: PropTypes.func,
        type: PropTypes.oneOf(['primary', 'danger']).isRequired,
      })),
      // 全部自定义数据
      PropTypes.shape({
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fixed: PropTypes.oneOf([true, false, 'left', 'right']),
        operation: PropTypes.arrayOf(PropTypes.shape({
          func: PropTypes.func,
          type: PropTypes.oneOf(['primary', 'danger']).isRequired,
        })),
      })
    ]),
    /** 设为 none 取消内部竖直分隔线 */
    verticalDivider: PropTypes.oneOf(['none']),
    /** 设为 none 取消内部水平分隔线 */
    horizonalDivider: PropTypes.oneOf(['none']),
    /** 生成斑马条纹背景（奇灰偶白） */
    stripe: PropTypes.bool,
    /** 生成反斑马条纹背景（奇白偶灰） */
    stripeReverse: PropTypes.bool,
    /** 自定义关键字搜索的执行方法（需设置 columns 中对应列的 search 字段） */
    searchFunc: PropTypes.func,
  }

  static defaultProps = {
    columns: [],
    operation: [],
    stripe: false,
    stripeReverse: false,
  }

  componentDidMount() {
    this.handleColumns()
  }

  handleColumns() {
    const { columns, operation } = this.props
    // this.props.operation 可能是包含 operation 的对象，也可能是 operation 本身
    const operationArr = operation.operation || operation
    if (Array.isArray(operationArr)) {
      columns.push({
        title: operation.title || '操作',
        width: operation.width || 175, 
        fixed: operation.fixed,
        render: (text, record, index) => (
          <div>
            {operationArr.map(item => (
              <Button className='custom-antd btn-plain' style={{ marginRight: 10 }}
                size='small' type={item.type} key={item.name}
                onClick={()=>{item.func && item.func(text, record, index)}}
              >{item.name}</Button>
            ))}
          </div>
        )
      })

      columns.forEach((item, index) => {
        if (item.search) {
          const searchProps = typeof item.search === 'string' 
            ? item.search : item.dataIndex
          
          columns[index] = {
            ...item,
            ...this.getColumnSearchProps(searchProps)
          }
        }
      })
    }

    this.columns = columns
  }

  // 列表头部的搜索功能（需设置 column 的 search 为 true）
  getColumnSearchProps(dataIndex) {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input ref={node => this.searchInput = node}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e=>setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={()=>this.handleSearch(selectedKeys, confirm)}
          />
          <Button type='primary' icon='search' size='small'
            style={{ width: 90, marginRight: 8 }}
            onClick={()=>this.handleSearch(selectedKeys, confirm)}
          >搜索</Button>
          <Button 
            size='small'
            style={{ width: 90 }}
            onClick={()=>this.handleReset(clearFilters)}
          >重置</Button>
        </div>
      ),
      filterIcon: filtered => (
        <Icon type='search' style={{ color: filtered ? '#3963bc' : undefined }} />
      ),
      onFilter: (value, record) => (
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      ),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => this.searchInput.select());
        }
      },
      render: text => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069' }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      )
    }
  }

  handleSearch(selectedKeys, confirm) {
    const { searchFunc } = this.props
    if (searchFunc) {
      searchFunc(selectedKeys, confirm)
    } else {
      confirm()
      this.setState({ searchText: selectedKeys[0] })
    }
  }

  handleReset(clearFilters) {
    clearFilters()
    this.setState({ searchText: '' })
  }

  render() {
    const {
      verticalDivider,    // 新增属性，值为 'none' 时取消内部垂直分隔线，默认为 undefined
      horizonalDivider,   // 新增属性，值为 'none' 时取消内部水平分隔线，默认为 undefined
      stripe,             // 新增属性，值为 true 时生成斑马条纹背景，默认为 undefined
      stripeReverse,      // 新增属性，值为 true 时生成反斑马条纹背景，默认为 undefined
      columns,
      ...restProps
    } = this.props

    const noVertDivider = verticalDivider === 'none' ? ' no-v-divider' : ''
    const noHoriDivider = horizonalDivider === 'none' ? ' no-h-divider' : ''
    const stripeType = stripe ? ' stripe' : (stripeReverse ? ' stripe-reverse' : '')

    const classes = `lin-table${noVertDivider}${noHoriDivider}${stripeType}`

    return (
      <Table className={classes}
        columns={this.columns}
        {...restProps}
      />
    )
  }
}