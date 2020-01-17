import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import ReactCropper, { ReactCropperProps } from 'react-cropper'
import lrz from 'lrz'
import Utils from 'lin/utils/util'

import 'cropperjs/dist/cropper.css'

interface LrzResult {
  base64: string
  base64Len: number
  file: Blob
  fileLen: number
  formData: FormData
  origin: string
}

function Cropper({ src }: ReactCropperProps, ref: any) {
  const cropper = useRef<any>()

  // 对外暴露的方法
  useImperativeHandle(ref, () => ({
    submit,
  }))

  // 获取指定格式的截图数据
  function submit(type: string = 'file'): Promise<LrzResult | Blob | File> {
    return new Promise((resolve, reject) => {
      const croppedURL: string = cropper.current.getCroppedCanvas().toDataURL()
      if (typeof croppedURL === 'undefined') {
        reject('未成功获取截图')
      }
      lrz(croppedURL, { quality: 0.7 }).then((res: LrzResult) => {
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

  return (
    <ReactCropper
      ref={cropper as any}
      src={src}
      viewMode={1}
      zoomable={true}
      aspectRatio={1} // 设置比例的参数（1:1），如果要 16:9 则写成 16 / 9
      guides={true}
    />
  )
}

export default forwardRef(Cropper)
