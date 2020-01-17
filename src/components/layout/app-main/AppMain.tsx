import React from 'react'
import Routes from '@/router/Routes'
import homeRouter from '@/router/home-router'
import { MenuTab } from '@/components/layout'

import './app-main.scss'

export default function AppMain() {
  return (
    <section className='appmain-container'>
      <MenuTab />
      <div className='routes-wrapper'>
        <Routes routes={homeRouter} />
      </div>
    </section>
  )
}
