import React, { useState, useEffect } from 'react'
import { Checkbox } from 'antd'
import useFirstMountState from '@/hooks/base/useFirstMountState'

import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { WrappedFormUtils } from 'antd/lib/form/Form'

interface ILinCheckbox {
  /** Checkbox 的选项数据 */
  options: object[]
  /** CheckboxItem 的 value 和 key 对应的 option 字段 */
  valueKey: string
  /** CheckboxItem 的 name 对应的 option 字段 */
  nameKey: string
  /** 全选按钮的文字说明 */
  moduleName?: string
  /** Form.create() 得到的实例 */
  form?: WrappedFormUtils
  /** form.getFieldDecorator(id, options) 的第一个参数 */
  decoratorId?: string
  /** form.getFieldDecorator(id, options) 的第二个参数 */
  decoratorOptions?: object
  /** 自定义全选行的 class 名 */
  checkAllClassName?: string
  /** 自定义选项行的 class 名 */
  checkGroupClassName?: string
  /** 自定义选项子项的 class 名 */
  checkItemClassName?: string
  /** 自定义 Checkbox.Group 的 onChange 方法，方法参数与原生相同 */
  onChange?: (value: object[]) => void
}

export default function LinCheckbox(props: ILinCheckbox) {
  let {
    form,
    decoratorId = 'checkbox',
    decoratorOptions = {},
    options = [],
    valueKey,
    nameKey,
    moduleName,
    onChange,
    checkAllClassName = '',
    checkGroupClassName = '',
    checkItemClassName = '',
  } = props
  const [checkedList, setCheckedList] = useState<any[]>([])
  const isFirstMount = useFirstMountState()

  // options 为 null 时设为空数组
  options = options || []

  // 是否全部选中
  const checkAll = checkedList.length === options.length
  // 是否部分选中
  const indeterminate = !checkAll && checkedList.length > 0

  // 作为受控组件时同步外部数据
  useEffect(() => {
    // 不受 form 控制时跳过
    if (!form) return

    const newChecked: any[] = form ? form.getFieldValue(decoratorId) : []

    if (checkedList.length === newChecked.length) return

    setCheckedList(newChecked)
  }, [form, decoratorId, checkedList, isFirstMount])

  // 手动点击全选按钮时执行
  function onCheckAllChange(ev: CheckboxChangeEvent) {
    const { checked } = ev.target
    const newCheckedList = checked ? options.map(item => item[valueKey]) : []
    form &&
      form.setFieldsValue({
        [decoratorId]: newCheckedList,
      })
    setCheckedList(newCheckedList)
    onChange && onChange(newCheckedList)
  }

  // 手动点击改变 checkbox group 的选中状态时执行
  function onValueChange(value: any[]) {
    setCheckedList(value)
    onChange && onChange(value)
  }

  let decorator = (f: any) => f,
    groupProps = {}
  if (form) {
    decorator = form.getFieldDecorator(decoratorId, decoratorOptions)
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

      {decorator(
        <Checkbox.Group
          className={checkGroupClassName}
          onChange={onValueChange}
          {...groupProps}
        >
          {options.map(item => (
            <Checkbox
              className={checkItemClassName}
              key={item[valueKey]}
              value={item[valueKey]}
            >
              {item[nameKey]}
            </Checkbox>
          ))}
        </Checkbox.Group>,
      )}
    </div>
  )
}
