import React, { useState, useEffect } from 'react'
import { Checkbox, Form } from 'antd'

import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { FormInstance } from 'antd/lib/form'

interface ILinCheckbox {
  /** Checkbox 的选项数据 */
  options: object[]
  /** CheckboxItem 的 value 和 key 对应的 option 字段 */
  itemValueKey: string
  /** CheckboxItem 的 name 对应的 option 字段 */
  itemNameKey: string
  /** 全选按钮的文字说明 */
  moduleName?: string
  /** Form.create() 得到的实例 */
  form?: FormInstance
  /** form fields 里的字段名 */
  name?: string
  /** 自定义 CheckAll 的类名 */
  checkAllClassName?: string
  /** 自定义 CheckGroup 的类名 */
  checkGroupClassName?: string
  /** 自定义 CheckItem 的类名 */
  checkItemClassName?: string
  /** 自定义 Checkbox.Group 的 onChange 方法，方法参数与 antd 相同 */
  onChange?: (value: (string | number)[]) => void
}

export default function LinCheckbox(props: ILinCheckbox) {
  const {
    form,
    name = '$default_checkbox',
    itemValueKey,
    itemNameKey,
    moduleName,
    onChange,
    checkAllClassName,
    checkGroupClassName,
    checkItemClassName,
  } = props
  const options = props.options || []

  // 是否全部选中
  const [checkAll, setCheckAll] = useState(false)
  // 是否部分选中
  const [indeterminate, setIndeterminate] = useState(false)

  // 最新的选中数据
  const newChecked: (string | number)[] =
    (form ? form.getFieldValue(name) : []) || []

  // 同步外部数据
  useEffect(() => {
    const checkAll = newChecked.length === options.length

    setCheckAll(newChecked.length ? checkAll : false)
    setIndeterminate(!checkAll && newChecked.length > 0)
  }, [newChecked]) // eslint-disable-line

  // 手动点击 CheckAll 时执行
  function onCheckAllChange(ev: CheckboxChangeEvent) {
    const { checked } = ev.target
    const newCheckedList = checked
      ? options.map(item => item[itemValueKey])
      : []
    form &&
      form.setFieldsValue({
        [name]: newCheckedList,
      })
    setCheckAll(checked)
    setIndeterminate(false)
    onChange && onChange(newCheckedList)
  }

  // 手动点击改变 CheckItem 的选中状态时执行
  function onValueChange(value: (string | number)[]) {
    form &&
      form.setFieldsValue({
        [name]: value,
      })
    const checkAll = value.length === options.length

    setCheckAll(checkAll)
    setIndeterminate(!checkAll && value.length > 0)
    onChange && onChange(value)
  }

  return (
    <div>
      <Checkbox
        className={checkAllClassName}
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
        r-if={moduleName}
      >
        {moduleName}
      </Checkbox>
      <Form.Item name={name} noStyle>
        <Checkbox.Group
          className={checkGroupClassName}
          onChange={onValueChange}
        >
          {options.map(item => (
            <Checkbox
              className={checkItemClassName}
              key={item[itemValueKey]}
              value={item[itemValueKey]}
            >
              {item[itemNameKey]}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Form.Item>
    </div>
  )
}
