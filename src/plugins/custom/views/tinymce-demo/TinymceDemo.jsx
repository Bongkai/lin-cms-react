import React, { lazy, Suspense } from 'react'
import { Spin } from 'antd'

import './tinymce-demo.scss'

const Tinymce = lazy(() => import('components/base/tinymce/Tinymce'))


export default class TinymceDemo extends React.Component {
  constructor(props) {
    super(props)
    this.handleEditorChange = this.handleEditorChange.bind(this)
  }

  handleEditorChange(content) {
    // console.log('Content was updated:', content)
  }
  
  render() {
    return (
      <div className='lin-container animated-base'>
        <div className='lin-title'>富文本舞台页面</div>
        <div className='lin-wrap tinymce-demo-wrap'>
          <Suspense fallback={
            <Spin className='loading' size='large' />
          }>
            <Tinymce
              initialValue={'This is default content'}
              uploadUrl='http://dev.lin.colorful3.com/cms/file/'
              onEditorChange={this.handleEditorChange}
            />
          </Suspense>
        </div>
      </div>
    )
  }
}