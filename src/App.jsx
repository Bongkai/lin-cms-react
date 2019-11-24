import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import Home from 'views/home/Home'
import Login from 'views/login/Login'

import './app.scss'


export default class App extends React.Component {
  
  componentDidMount() {
    document.getElementById('loader').style.display = 'none'
  }
  
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path='/login' exact component={Login} title='login'></Route>
          <Route component={Home} title='home'></Route>
        </Switch>
      </HashRouter>
    )
  }
}
