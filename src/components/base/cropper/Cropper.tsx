import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import ReactCropper, { ReactCropperProps } from 'react-cropper'
import lrz from 'lrz'

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
        const blob = dataURLToBlob(res.base64)
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

  function dataURLToBlob(base64: string): Blob {
    const block = base64.split(';')
    const contentType = block[0].split(':')[1]
    const b64Data = block[1].split(',')[1]
    const sliceSize = 512
    const byteCharacters = atob(b64Data)
    const byteArrays: Uint8Array[] = []
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    const blob = new Blob(byteArrays, { type: contentType })
    return blob
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
