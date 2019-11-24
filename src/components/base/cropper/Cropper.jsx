import React from 'react'
import ReactCropper from 'react-cropper'
import lrz from 'lrz'
import Utils from 'lin/utils/util'

import 'cropperjs/dist/cropper.css'


export default class Cropper extends React.Component {
  constructor(props) {
    super(props)
    this.submit = this.submit.bind(this)
  }

  submit(type = 'file') {
    return new Promise((resolve, reject) => {
      const croppedURL = this.cropper.getCroppedCanvas().toDataURL()
      if (typeof croppedURL === 'undefined') {
        reject('未成功获取截图')
      }
      lrz(croppedURL, { quality: 0.7 }).then(res => {
        if (type === 'dataurl') {
          resolve(res)
        }
        const blob = Utils.dataURLToBlob(res.base64)
        if (type === 'blob') {
          resolve(blob)
        }
        // 构造为文件对象
        const file = new File([blob], 'avatar.jpg', {
          type: 'image/jpeg',
        })
        resolve(file)
      })
    })
  }

  render() {
    return (
      <ReactCropper ref={ref => this.cropper = ref}
        src={this.props.src}
        viewMode={1}
        zoomable={true}
        aspectRatio={1}  // 设置比例的参数（1:1），如果要 16:9 则写成 16 / 9
        guides={true}
      />
    )
  }
}