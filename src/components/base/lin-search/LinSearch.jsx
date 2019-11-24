import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'
import Utils from 'lin/utils/util'

import './lin-search.scss'


export default class LinSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: ''
    }
    this.onValueChange = this.onValueChange.bind(this)
    this.lastChange = this.lastChange.bind(this)

    this.debounceChange = Utils.debounce(this.lastChange, 1000)
  }

  static propTypes = {
    onChange: PropTypes.func,
  }

  onValueChange(ev) {
    this.setState({
      value: ev.target.value
    })
    this.debounceChange(ev.target.value)
  }

  lastChange(value) {
    this.props.onChange && this.props.onChange(value)
  }

  // 在外部通过 ref 调用，可以直接修改 value 值
  setSearchData(value = '') {
    if (typeof value === 'number') {
      value = value.toString()
    }
    if (typeof value === 'string') {
      this.setState({ value })
    }
  }
  
  render() {
    return (
      <Input.Search className='custom-antd lin-search'
        value={this.state.value}
        placeholder='请输入内容'
        onChange={this.onValueChange}
        allowClear
        enterButton
      />
    )
  }
}