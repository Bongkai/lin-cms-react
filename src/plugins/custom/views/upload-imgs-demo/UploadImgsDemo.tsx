import React, { RefObject } from 'react'
import { Form, Button, Radio, message } from 'antd'
import UploadImgs from '@/components/base/upload-imgs/UploadImgs'

import './upload-imgs-demo.scss'

const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 19 } }

/** 生成随机字符串 */
function createId() {
  return Math.random()
    .toString(36)
    .substring(2)
}

export default class UploadImgsDemo extends React.Component {
  readonly state = {
    remoteFuncName: 'remoteFuncAsync',
    fit: 'cover',
    rules: {
      minWidth: 100,
      minHeight: 100,
      maxSize: 5,
    },
    rules2: {
      minWidth: 100,
      maxWidth: 2000,
      allowAnimated: 1,
    },
    initData: [
      {
        id: '123',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/MAGE__EX1_559_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/MAGE__EX1_559_zhCN_.png',
        imgId: '12381900',
      },
      {
        id: '12d3',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/PALADIN__EX1_383_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/PALADIN__EX1_383_zhCN_.png',
        imgId: '238287',
      },
      {
        id: 'hahah',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/NEUTRAL__NEW1_030_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/NEUTRAL__NEW1_030_zhCN_.png',
        imgId: '1232323',
      },
    ],
    initData1: [
      {
        id: '123',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/MAGE__EX1_559_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/MAGE__EX1_559_zhCN_.png',
        imgId: '12381900',
      },
      {
        id: '12d3',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/PALADIN__EX1_383_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/PALADIN__EX1_383_zhCN_.png',
        imgId: '238287',
      },
      {
        id: 'hahah',
        display:
          'http://hearthstone.nos.netease.com/1/hscards/NEUTRAL__NEW1_030_zhCN_.png',
        src:
          'http://hearthstone.nos.netease.com/1/hscards/NEUTRAL__NEW1_030_zhCN_.png',
        imgId: '1232323',
      },
    ],
  }

  changeData(name: string) {
    this[name].reset()
  }

  doClear(name: string) {
    this[name].clear()
  }

  async getValue(name: string) {
    const result = await this[name].getValue()
    console.log(result)
    if (result) {
      alert('已获取数据, 打印在控制台中')
    }
  }

  remoteFuncAsync() {
    return Promise.resolve(false)
  }

  remoteFunc(file: File, cb: Function) {
    setTimeout(() => {
      cb(false)
    }, 3000)
  }

  remoteFuncSuccessAsync() {
    return Promise.resolve({
      id: createId,
      url:
        'http://dev.koa.7yue.pro/assets/2019/06/30/abc823a9-5ef4-48e1-bdf6-dd4f0ab92482.jpg',
    })
  }

  remoteFuncSuccess(file: File, cb: Function) {
    setTimeout(() => {
      cb({
        id: createId,
        url:
          'http://dev.koa.7yue.pro/assets/2019/06/30/abc823a9-5ef4-48e1-bdf6-dd4f0ab92482.jpg',
      })
    }, 3000)
  }

  async beforeFunc() {
    message.error('进入自定义校验函数, 并返回false终止上传')
    return false
  }

  changeState(key: string, value: string) {
    this.setState({
      [key]: value,
    })
  }

  render() {
    const {
      rules,
      rules2,
      initData,
      initData1,
      remoteFuncName,
      fit,
    } = this.state
    return (
      <div className='lin-container animated-base'>
        <div className='lin-title'>图片上传演示</div>
        <div className='lin-wrap'>
          <Form
            className='upload-imgs-demo-form'
            colon={false}
            {...formItemLayout}
          >
            <Form.Item label='普通示例'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle3'] = ref)}
                rules={rules}
                multiple
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle3')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='禁用'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle4'] = ref)}
                multiple
                disabled
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle4')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='动图检测示例'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) =>
                  (this['uploadEle32'] = ref)
                }
                rules={rules2}
                multiple
                animatedCheck
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle32')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='禁用+初始化'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle5'] = ref)}
                value={initData}
                rules={rules}
                multiple
                disabled
                animatedCheck
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle5')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='带初始化, 限制4至7张'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle1'] = ref)}
                value={initData}
                rules={rules}
                multiple
                minNum={4}
                maxNum={7}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle1')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='初始化, 可多选, 不立即上传'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle2'] = ref)}
                value={initData}
                rules={rules}
                multiple
                autoUpload={false}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle2')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='禁用+初始化+不预览'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle7'] = ref)}
                value={initData}
                rules={rules}
                multiple
                disabled
                preview={false}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle7')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='排序+固定数量'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle8'] = ref)}
                rules={rules}
                multiple
                sortable
                minNum={3}
                maxNum={3}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle8')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='仅最大数量'>
              <UploadImgs rules={rules} multiple maxNum={3} />
            </Form.Item>
            <Form.Item label='定制宽高+排序'>
              <UploadImgs
                value={initData}
                rules={rules}
                sortable
                width={200}
                height={150}
              />
            </Form.Item>
            <Form.Item label='重新初始化'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) => (this['uploadEle9'] = ref)}
                value={initData1}
                rules={rules}
                sortable
                width={200}
                height={150}
              />
              <div>
                <Button
                  style={{ marginRight: '10px' }}
                  onClick={() => this.changeData('uploadEle9')}
                >
                  重新初始化
                </Button>
                <Button
                  style={{ marginRight: '10px' }}
                  onClick={() => this.doClear('uploadEle9')}
                >
                  清空
                </Button>
                <Button
                  style={{ marginRight: '10px' }}
                  onClick={() => this.getValue('uploadEle9')}
                >
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='远程方法'>
              <Radio.Group
                value={remoteFuncName}
                onChange={ev =>
                  this.changeState('remoteFuncName', ev.target.value)
                }
              >
                <Radio value='remoteFuncAsync'>失败promise</Radio>
                <Radio value='remoteFunc'>失败回调</Radio>
                <Radio value='remoteFuncSuccessAsync'>成功promise</Radio>
                <Radio value='remoteFuncSuccess'>成功回调</Radio>
              </Radio.Group>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) =>
                  (this['uploadEle13'] = ref)
                }
                rules={rules}
                multiple
                customRequest={this[remoteFuncName]}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle13')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='图像缩略图展示模式'>
              <Radio.Group
                value={fit}
                onChange={ev => this.changeState('fit', ev.target.value)}
              >
                <Radio value='fill'>fill</Radio>
                <Radio value='contain'>contain</Radio>
                <Radio value='cover'>cover</Radio>
                <Radio value='none'>none</Radio>
                <Radio value='scale-down'>scale-down</Radio>
              </Radio.Group>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) =>
                  (this['uploadEle13'] = ref)
                }
                value={initData}
                rules={rules}
                multiple
                width={200}
                height={150}
                fit={fit}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle13')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
            <Form.Item label='自定义校验函数'>
              <UploadImgs
                ref={(ref: RefObject<UploadImgs>) =>
                  (this['uploadEle33'] = ref)
                }
                rules={rules}
                multiple
                beforeUpload={this.beforeFunc}
              />
              <div>
                <Button onClick={() => this.getValue('uploadEle33')}>
                  获取当前图像数据
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    )
  }
}
