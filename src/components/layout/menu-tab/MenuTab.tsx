import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/store'
import { NavLink } from 'react-router-dom'
import DynamicIcon from '@/components/base/dynamic-icon/DynamicIcon'
import Utils from '@/lin/utils/util'

import { IRouterItem } from '@/types/project'

import './menu-tab.scss'

export default function MenuTab() {
  const [visible, setVisible] = useState(false)
  const [tabArr, setTabArr] = useState<IRouterItem[]>([])
  const { currentRoute, sideBarLevel } = useAppSelector()
  const stageInfo = currentRoute.treePath

  useEffect(() => {
    let _tabArr: IRouterItem[] = [],
      _visible = false
    const len = stageInfo.length
    const secondToLast = stageInfo[len - 2]
    if (
      len > sideBarLevel ||
      (len >= sideBarLevel && secondToLast?.type === 'tab')
    ) {
      if (secondToLast.children) {
        _tabArr = secondToLast.children
      }
      _visible = true
    }
    setVisible(_visible)
    setTabArr(_tabArr)
  }, [stageInfo, sideBarLevel])

  // prettier-ignore
  return (
    <ul className='menu-tab' r-if={visible}>
      {tabArr.map(item => (
        item.route && (
          <NavLink to={item.route} key={item.route}>
            <li className='menu-li'>
              <div>
                <DynamicIcon type={item.icon} style={{ fontSize: '16px' }} />
                <span className='title'>
                  {Utils.cutString(item.title, 8)}
                </span>
              </div>
            </li>
          </NavLink>
        )
      ))}
    </ul>
  )
}
