import React from 'react'
import axios from 'lin/plugins/axios'
// eslint-disable-next-line
import tinymce from 'tinymce/tinymce'
import { Editor } from '@tinymce/tinymce-react'

import 'tinymce/themes/silver/theme'
import './importAll'


export default class Tinymce extends React.Component {
  constructor(props) {
    super(props)
    this.imagesUploadHandler = this.imagesUploadHandler.bind(this)
  }

  imagesUploadHandler(blobInfo, success, failure) {
    const file = new File([blobInfo.blob()], blobInfo.filename(), {
      type: 'image/*',
    })
    axios({
      method: 'post',
      url: '/cms/file',
      data: {
        file,
      },
    }).then((res) => {
      if (res[0] && res[0].url) {
        success(res[0].url)
      }
    }).catch(err => failure(err))
  }
  
  render() {
    return (
      <Editor
        init={{
          skin_url: '/tinymce/skins/ui/oxide',
          language_url: '/tinymce/langs/zh_CN.js',
          language: 'zh_CN',
          height: 500,
          width: undefined,
          browser_spellcheck: true, // 拼写检查
          branding: false, // 去水印
          elementpath: false, // 禁用编辑器底部的状态栏
          statusbar: false, // 隐藏编辑器底部的状态栏
          paste_data_images: true, // 允许粘贴图像
          menubar: true, // 隐藏最上方menu
          plugins: 'print fullpage searchreplace autolink directionality visualblocks visualchars template codesample charmap hr pagebreak nonbreaking anchor toc insertdatetime wordcount textpattern help advlist table lists paste preview fullscreen image imagetools code link',
          toolbar: ' undo redo |formatselect | bold italic strikethrough forecolor backcolor formatpainter | link image | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat | preview fullscreen code',
          images_upload_handler: this.imagesUploadHandler,
        }}
        {...this.props}
      />
    )
  }
}