import React from 'react'
import { connect } from 'react-redux'
import Routes from '@/router/Routes'
import homeRouter from '@/router/home-router'
import { MenuTab } from '@/components/layout'

import './app-main.scss'


const connectWrapper = connect(
  state => state
)
class AppMain extends React.Component {
  render() {
    return (
      <section className='appmain-container'>
        <MenuTab />
        <div className='routes-wrapper'>
          <Routes routes={homeRouter} state={this.props.app} animated />
        </div>
      </section>
    )
  }
}

export default connectWrapper(AppMain)
