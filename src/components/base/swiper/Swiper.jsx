import React from 'react'
// import OriginSwiper from 'swiper/dist/js/swiper'
import OriginSwiper from 'swiper/js/swiper'

// import 'swiper/dist/css/swiper.min.css'
import 'swiper/css/swiper.min.css'
import './swiper.scss'


export default class Swiper extends React.Component {

  componentDidMount() {
    new OriginSwiper(this.swiper, this.props.parameters)
  }

  render() {
    return (
      <div className='swiper-container' ref={swiper=>this.swiper=swiper}>
        <div className='swiper-wrapper'>
          {this.props.children}
        </div>
      </div>
    )
  }
}
