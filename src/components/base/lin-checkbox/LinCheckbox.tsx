import React, { useState, useEffect } from 'react'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import useFirstMountState from 'hooks/base/useFirstMountState'

interface ILinCheckbox {
  /** Checkbox 的选项数据 */
  options?: string[]
  /** 全选按钮的文字说明 */
  moduleName?: string
  /** Form.create() 得到的实例 */
  form?: WrappedFormUtils
  /** form.getFieldDecorator(id, options) 的第一个参数 */
  decoratorId?: string
  /** form.getFieldDecorator(id, options) 的第二个参数 */
  decoratorOptions?: object
  /** 选中的子选项 */
  checked?: string[]
  /** 自定义全选行的 class 名 */
  checkAllClassName?: string
  /** 自定义选项行的 class 名 */
  checkGroupClassName?: string
  /** 自定义 Checkbox.Group 的 onChange 方法，方法参数与原生相同 */
  onChange?: (value: string[]) => void
}

export default function LinCheckbox(props: ILinCheckbox) {
  const {
    form,
    decoratorId = 'checkbox',
    decoratorOptions = {},
    options = [],
    moduleName,
    checked,
    onChange,
    checkAllClassName = '',
    checkGroupClassName = '',
  } = props
  const [checkedList, setCheckedList] = useState<string[]>([])
  const isFirstMount = useFirstMountState()

  // 是否全部选中
  const checkAll = checkedList.length === options.length
  // 是否部分选中
  const indeterminate = !checkAll && checkedList.length > 0

  // 作为受控组件时同步外部数据
  useEffect(() => {
    // 不受 form 和 checked 控制时跳过
    if (!form && typeof checked === 'undefined') return

    const newChecked: string[] =
      (form ? form.getFieldValue(decoratorId) : checked) || []
    if (checkedList.length === newChecked.length) return

    setCheckedList(newChecked)
  }, [form, decoratorId, checked, checkedList, isFirstMount])

  // 手动点击全选按钮时执行
  function onCheckAllChange(ev: CheckboxChangeEvent) {
    const checked = ev.target.checked
    const newCheckedList = checked ? options : []
    form &&
      form.setFieldsValue({
        [decoratorId]: newCheckedList,
      })
    setCheckedList(newCheckedList)
    onChange && onChange(newCheckedList)
  }

  // 手动点击改变 checkbox group 的选中状态时执行
  function onValueChange(value: string[]) {
    setCheckedList(value)
    onChange && onChange(value)
  }

  let decorator = (f: any) => f,
    groupProps = {}
  if (form) {
    decorator = form.getFieldDecorator(decoratorId, decoratorOptions)
  } else if (typeof checked === 'undefined') {
    groupProps = {
      value: checkedList,
    }
  }

  return (
    <div>
      <Checkbox
        className={checkAllClassName}
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
      >
        {moduleName}
      </Checkbox>
      <br />
      {decorator(
        <Checkbox.Group
          className={checkGroupClassName}
          onChange={onValueChange}
          {...groupProps}
        >
          {options.map(item => (
            <Checkbox key={item} value={item}>
              {item}
            </Checkbox>
          ))}
        </Checkbox.Group>,
      )}
    </div>
  )
}
