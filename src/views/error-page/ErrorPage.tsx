import React from 'react'

import './error-page.scss'
import errorImg from '../../assets/img/error-page/404.png'
import logoImg from '../../assets/img/error-page/logo.png'

export default function ErrorPage() {
  return (
    <div className='error-page-container'>
      <img className='page-404' src={errorImg} alt='' />
      <img className='page-logo' src={logoImg} alt='' />
    </div>
  )
}
