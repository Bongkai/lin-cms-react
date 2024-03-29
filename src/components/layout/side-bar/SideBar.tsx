import React, { useState, useEffect, memo } from 'react'
import { useImmer } from 'use-immer'
import { useSelector } from '@/store'
import { useHistory, NavLink } from 'react-router-dom'
import { Menu, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import DynamicIcon from '@/components/base/dynamic-icon/DynamicIcon'
import Utils from '@/lin/utils/util'
import { getSideBarList, deepTravel } from '@/store/getters/app.getters'

import { ISideBarListItem } from '@/types/store'

import './side-bar.scss'
import logoImg from '@/assets/img/logo.png'
import mobileLogoImg from '@/assets/img/mobile-logo.png'

const { SubMenu, Item } = Menu
const { Option } = Select

const name: unique symbol = Symbol()
interface IIdMap {
  [name]: string
}

interface IViewRouter {
  path: string
  title: string
  key: number
}

function SideBar({ collapsed }) {
  const [list, setList] = useState<ISideBarListItem[]>([])
  const [idMap, setIdMap] = useState<IIdMap>({} as IIdMap)
  const [openKeys, setOpenKeys] = useImmer<string[]>([])
  const [showSearchList, setShowSearchList] = useState(false)
  const [groups, setGroups] = useState<IViewRouter[]>([])
  const [selectedKey, setSelectedKey] = useState('')
  const stageInfo = useSelector(state => state.app.currentRoute.treePath)
  const history = useHistory()

  useEffect(() => {
    function createIdMap(list: ISideBarListItem[]) {
      const mapData = {} as IIdMap
      deepTravel<ISideBarListItem>(list, item => {
        if (item.name) {
          mapData[item.name] = Utils.getRandomStr()
        }
      })
      return mapData
    }
    const list = getSideBarList()
    const idMap = createIdMap(list)
    setList(list)
    setIdMap(idMap)
  }, []) // eslint-disable-line

  useEffect(() => {
    // 根据当前路由设置激活侧边栏
    function getSeletedKey(): string {
      if (!stageInfo) {
        return ''
      }
      for (let i = stageInfo.length - 1; i >= 0; i -= 1) {
        const { name } = stageInfo[i]
        if (name && idMap[name]) {
          return idMap[name]
        }
      }
      return ''
    }
    const selected = getSeletedKey()
    setSelectedKey(selected)
  }, [stageInfo, idMap])

  // 路由切换时同步 Menu 的展开情况
  useEffect(() => {
    // 其他组件切换路由时同步侧边栏的展开情况
    function syncOpenKeys() {
      setOpenKeys(openKeys => {
        stageInfo.forEach(item => {
          if (item.type === 'folder') {
            if (!item.name) return true
            const openKey = idMap[item.name]
            if (!openKeys.some(item => item === openKey)) {
              openKeys.push(openKey)
            }
          }
        })
      })
    }
    syncOpenKeys()
  }, [stageInfo, idMap, setOpenKeys])

  function onOpenChange(openKeys: string[]) {
    setOpenKeys(() => openKeys)
  }

  // search 相关

  function switchToSearch() {
    setShowSearchList(true)
  }

  function search(val: string) {
    if (val) {
      const groups: IViewRouter[] = []
      deepTravel<ISideBarListItem>(list, viewConfig => {
        // 构造舞台view路由
        if (viewConfig.title.includes(val)) {
          let viewRouter: IViewRouter
          if (viewConfig.path) {
            viewRouter = {
              path: viewConfig.path,
              title: viewConfig.title,
              key: Math.random(),
            }
            groups.push(viewRouter)
          }
        }
      })
      setGroups(groups)
    } else {
      setGroups([])
    }
  }

  function handleSearchChange(path: string) {
    setGroups([])
    setShowSearchList(false)
    path && history.push(path)
  }

  function handleSearchBlur() {
    setGroups([])
    setShowSearchList(false)
  }

  // 遍历渲染 Menu 列表
  const menuRecursion = (list: ISideBarListItem[]) => {
    return list.map((item, index) => {
      const { name, path } = item
      const key = name ? idMap[name] : index
      // 判断 key 值存在后再渲染，避免出现 unique key 报错
      return key && path ? (
        item.children ? (
          <SubMenu
            className='sub-menu-content'
            key={key}
            title={
              <>
                <DynamicIcon type={item.icon} style={{ fontSize: '16px' }} />
                <span>{Utils.cutString(item.title, 12)}</span>
              </>
            }
          >
            {menuRecursion(item.children)}
          </SubMenu>
        ) : (
          <Item key={key}>
            <NavLink to={path}>
              <DynamicIcon type={item.icon} style={{ fontSize: '16px' }} />
              <span title={item.title}>{Utils.cutString(item.title, 12)}</span>
            </NavLink>
          </Item>
        )
      ) : null
    })
  }

  // Menu 在 collapsed 状态时不设置 openKeys 的值，避免出 bug
  const menuProps = collapsed ? {} : { openKeys }

  return (
    <div className='app-sidebar'>
      <div className='logo' r-if={!collapsed}>
        <img src={logoImg} alt='' />
      </div>
      <div className='mobile-logo' r-else>
        <img src={mobileLogoImg} alt='' />
      </div>

      <div style={{ marginTop: '15px' }} r-if={!collapsed}>
        <Select
          className='search'
          showSearch
          // defaultOpen
          dropdownMatchSelectWidth={false}
          defaultActiveFirstOption={false}
          placeholder='请输入关键字'
          onSearch={search}
          onChange={handleSearchChange}
          onBlur={handleSearchBlur}
          filterOption={false}
          r-if={showSearchList}
        >
          {groups.map(item => (
            <Option key={item.key} value={item.path}>
              {item.title}
            </Option>
          ))}
        </Select>
        <div className='search-display' onClick={switchToSearch} r-else>
          <SearchOutlined style={{ color: 'rgb(185, 190, 195)' }} />
        </div>
      </div>

      <Menu
        className='custom-antd menu-content'
        theme='dark'
        mode='inline'
        inlineIndent={24}
        defaultOpenKeys={openKeys}
        selectedKeys={[selectedKey]}
        onOpenChange={onOpenChange}
        {...menuProps}
      >
        {menuRecursion(list)}
      </Menu>
    </div>
  )
}

export default memo(SideBar)
