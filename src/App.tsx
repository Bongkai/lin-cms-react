import React, { useEffect } from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import Home from '@/views/home/Home'
import Login from '@/views/login/Login'

import './app.scss'

export default function App() {
  useEffect(() => {
    const loader = document.getElementById('loader')
    if (loader) {
      loader.style.display = 'none'
    }
  }, [])

  return (
    <HashRouter>
      <Switch>
        <Route path='/login' exact component={Login} title='login'></Route>
        <Route component={Home} title='home'></Route>
      </Switch>
    </HashRouter>
  )
}
