import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'antd'


export default class LinCheckbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      plainOptions: [],
      checkedList: [],
      indeterminate: false,
      checkAll: false,
    }
    this.onValueChange = this.onValueChange.bind(this)
    this.onCheckAllChange = this.onCheckAllChange.bind(this)
  }

  static propTypes = {
    /** Checkbox 的选项数据 */
    options: PropTypes.array,
    /** 全选按钮的文字说明 */
    moduleName: PropTypes.string,
    /** Form.create() 得到的实例 */
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
      setFieldsValue: PropTypes.func,
    }),
    /** form.getFieldDecorator(id, options) 的第一个参数 */
    decoratorId: PropTypes.string,
    /** form.getFieldDecorator(id, options) 的第二个参数 */
    decoratorOptions: PropTypes.object,
    /** 自定义全选行的 class 名 */
    checkAllClassName: PropTypes.string,
    /** 自定义选项行的 class 名 */
    checkGroupClassName: PropTypes.string,
    /** 自定义 Checkbox.Group 的 onChange 方法，方法参数与原生相同 */
    onChange: PropTypes.func,
  }

  static defaultProps = {
    options: [],
    decoratorId: 'checkbox',
    decoratorOptions: {},
  }

  componentDidMount() {
    this.setState({
      plainOptions: this.props.options
    })
  }

  componentDidUpdate() {
    const currentCheckedList = this.group.props.value || []
    const isEqual = this._isEqualPlainArr(this.state.checkedList, currentCheckedList)
    if (!isEqual) {
      this.setState({
        checkedList: currentCheckedList
      }, () => {
        this._handleModule(this.state.checkedList, this.state.plainOptions)
      })
    }
  }

  onCheckAllChange(ev) {
    const { form, decoratorId } = this.props
    form.setFieldsValue({
      [decoratorId]: ev.target.checked ? this.state.plainOptions : []
    })

    this.setState({
      checkAll: ev.target.checked,
      indeterminate: false
    })
  }

  onValueChange(value) {
    this._handleModule(value, this.state.plainOptions)
    this.setState({
      checkedList: value
    }, () => {
      this.props.onChange && this.props.onChange(value)
    })
  }

  _isEqualPlainArr(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return false
    }
    for (let i = 0; i < arrA.length; i++) {
      if (arrA[i] !== arrB[i]) {
        return false
      }
    }
    return true
  }

  _handleModule(newValue, allValue) {
    if (newValue.length === allValue.length) {
      this.setState({ indeterminate: false, checkAll: true })
    } else if (newValue.length > 0) {
      this.setState({ indeterminate: true, checkAll: false })
    } else {
      this.setState({ indeterminate: false, checkAll: false })
    }
  }

  render() {
    const { 
      form, decoratorId, decoratorOptions = {},
      moduleName,
      checkAllClassName, checkGroupClassName,
    } = this.props
    const { indeterminate, checkAll, plainOptions } = this.state
    
    let decorator = f => f
    if (form) {
      decorator = form.getFieldDecorator(decoratorId, decoratorOptions)
    }

    return (
      <div>
        <Checkbox className={checkAllClassName}
          indeterminate={indeterminate}
          onChange={this.onCheckAllChange}
          checked={checkAll}
        >
          {moduleName}
        </Checkbox>
        <br />
        {decorator(
          <Checkbox.Group className={checkGroupClassName}
            ref={ref => this.group = ref}
            onChange={this.onValueChange}
          >
            {plainOptions.map(item => {
              const value = item.value || item
              return (
                <Checkbox key={value} value={value}>{value}</Checkbox>
              )
            })}
          </Checkbox.Group>
        )}
      </div>
    )
  }
}