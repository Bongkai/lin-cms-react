/**
 * Component: UploadImgs
 * Describe: 多图片上传组件, 附有预览, 排序, 验证等功能
 *
 * todo: 使用中间件模式优化信息装载和验证功能
 * todo: 文件判断使用 serveWorker 优化性能
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Spin, message } from 'antd'
import axios from '@/lin/plugins/axios'
import { PhotoSwipe } from 'react-photoswipe'
import { getFileType, checkIsAnimated, isEmptyObj, createId } from './utils'

import './upload-imgs.scss'
import 'react-photoswipe/lib/photoswipe.css'
import Utils from '../../../lin/utils/util'

/**
 * 本地图像通过验证后构造的信息对象
 * @typedef {Object<string, number, any>} LocalFileInfo
 * @property {string} localSrc 本地图像预览地址
 * @property {File} file 本地图像文件
 * @property {number} width 宽
 * @property {number} height 高
 * @property {string} name 文件名
 * @property {number} size 文件大小
 * @property {string} type 文件的媒体类型 (MIME)
 * @property {Date} lastModified 文件最后修改时间
 * @property {boolean} isAnimated 是否是动态图, 如果不进行检测则为 null
 */

/**
 * 返回数据对象
 * 初始化的图片如果没有传入字段, 则值为空 null
 * @typedef {Object<string, number>} ReturnItem
 * @property {number|string} id 初始化数据的 id
 * @property {number|string} imgId 图像资源 id
 * @property {string} src 文件相对路径
 * @property {string} display 图像完整地址
 * @property {number} height 高
 * @property {number} width 宽
 * @property {string} fileName 文件名
 * @property {string} fileType 文件的媒体类型 (MIME), 针对部分文件类型做了检测
 * @property {boolean} isAnimated 是否是动态图, 如果不进行检测则为 null
 */

/**
 * 返回数据对象
 * @typedef {Object} ValidateRule
 * @property {array|number} ratio 比例 [宽，高], 或者 宽/高 的数值
 * @property {number} width 宽度必需等于
 * @property {number} height 高度必需等于
 * @property {number} minWidth 最小宽
 * @property {number} minHeight 最小高
 * @property {number} minSize 最小 size（Mb)
 * @property {number} maxSize 最大 size（Mb)
 * @property {number} allowAnimated 是否允许上传动图, 0 不检测, 1 不允许动图, 2 只允许动图. 要检查此项, 需设置属性 animated-check 为 true
 */

const ONE_KB = 1024
const ONE_MB = ONE_KB * 1024

/**
 * 创建项, 如不传入参数则创建空项
 * status 状态转换说明:
 *  - 如果不传入参数, 创建上传空项, status: input
 *  - 如果只传入 data, 不传入 oldData
 *    - data 是本地数据(数据中是否携带id), status: new
 *    - data 不是本地数据(来源可能是初始化或是其他), status 与原状态保持一致, 如果没有原状态就是 init
 *  - data 与 oldData 都传入
 *    - data 为本地数据, oldData 是 input/new, status: new
 *    - data 为本地数据, oldData 是 init/edit, status: edit
 *    - data 不是本地数据, status 与原状态保持一致, 如果没有原状态就是 init
 * @returns {Item}
 */
function createItem(data = null, oldData = {}) {
  let item = {
    loading: false,
    id: createId(),
    status: 'input', // new/edit/del/init/input
    src: '', // 图像相对地址
    display: '', // 图像完整地址, 用于显示
    imgId: '', // 图像资源 id
  }
  // 未传入data, 说明是单纯新建, 单纯新建的值是输入框状态
  if (!data) {
    return item
  }
  // 判断是否是本地图片
  if (data.file && !data.id) {
    if (!isEmptyObj(oldData)) {
      // 如果旧数据状态是输入框, 则为新图片
      if (oldData.status === 'input' || oldData.status === 'new') {
        item.status = 'new'
      }
      // 如果旧数据状态是初始化 init, 则为修改
      if (oldData.status === 'init' || oldData.status === 'edit') {
        item.status = 'edit'
      }
    } else {
      item.status = 'new'
    }

    // 本地数据初始化
    item.id = oldData.id || item.id
    item.src = ''
    item.imgId = ''
    item.display = data.localSrc || item.display
    item = Object.assign({}, data, item)
    return item
  }

  // 存在id, 说明是传入已存在数据
  if (data.display) {
    let image = new Image()
    image.src = data.display
    item.width = image.width
    item.height = image.height
    image = null
  }
  item.id = data.id
  item.imgId = data.imgId || item.imgId
  item.src = data.src || item.src
  item.display = data.display || item.display
  item.status = data.status || 'init'
  item = Object.assign({}, data, item)
  return item

  // item (this.state.itemList[i]) 结构示例：
  //
  // {
  //   display: 'blob:http://localhost:3000/96b8c7f2-4c78-43f0-805c-785f1eedefd9'
  //   file: File {name: '1.jpg.jpg', lastModified: 1461407065011, lastModifiedDate: Sat Apr 23 2016 18:24:25 GMT+0800 (中国标准时间), webkitRelativePath: ', size: 254809, …}
  //   height: 1080
  //   id: 'hru75qvjgsh'
  //   imgId: '
  //   isAnimated: null
  //   lastModified: 1461407065011
  //   loading: false
  //   localSrc: 'blob:http://localhost:3000/96b8c7f2-4c78-43f0-805c-785f1eedefd9'
  //   name: '1.jpg.jpg'
  //   size: 254809
  //   src: '
  //   status: 'new'
  //   type: 'image/jpeg'
  //   width: 1980
  // }
}

/**
 * 获取范围类型限制的提示文本
 * @param {String} prx 提示前缀
 * @param {Number} min 范围下限
 * @param {Number} max 范围上限
 * @param {String} unit 单位
 */
function getRangeTip(prx, min, max, unit = '') {
  let str = prx
  if (min && max) {
    // 有范围限制
    str += ` ${min}${unit}~${max}${unit}`
  } else if (min) {
    // 只有最小范围
    str += ` ≥ ${min}${unit}`
  } else if (max) {
    // 只有最大范围
    str += ` ≤ ${max}${unit}`
  } else {
    // 无限制
    str += '无限制'
  }
  return str
}

/** for originUpload: 一次请求最多的文件数量 */
const uploadLimit = 10
/** for originUpload: 文件对象缓存 */
let catchData = []
/** for originUpload: 计时器缓存 */
let time

export default class UploadImgs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemList: this.props.value,
      boxStyle: {},
      rulesTip: [],
      currentId: null,
      min: 0,
      max: 0,
      isStable: false,
      disabled: this.props.disabled,
      loading: false,
      previewing: false,
      previewData: [],
      previewIndex: 0,
    }
  }

  static propTypes = {
    /** 每一项宽度 */
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** 每一项高度 */
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** 是否开启自动上传 */
    autoUpload: PropTypes.bool,
    /** 初始化数据 */
    value: PropTypes.array,
    /** 接受的文件类型 */
    accept: PropTypes.string,
    /** 最少图片数量 */
    minNum: PropTypes.number,
    /** 最多图片数量, 0 表示无限制 */
    maxNum: PropTypes.number,
    /** 是否可排序 */
    sortable: PropTypes.bool,
    /** 是否可预览 */
    preview: PropTypes.bool,
    /** 是否可以一次多选 */
    multiple: PropTypes.bool,
    /** 图像验证规则 */
    rules: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /** 是否禁用, 禁用后只可展示 不可进行编辑操作, 包括: 新增, 修改, 删除, 改变顺序 */
    disabled: PropTypes.bool,
    /** 上传前插入方法, 属于高级用法 */
    beforeUpload: PropTypes.func,
    /** 重写上传方法, 如果重写则覆盖组件内上传方法 (remoteFunc) */
    customRequest: PropTypes.func,
    /** 图像显示模式 */
    fit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
    /** 检测是否是动图 */
    animatedCheck: PropTypes.bool,
  }

  static defaultProps = {
    width: 160,
    height: 160,
    autoUpload: true,
    value: [],
    accept: 'image/*',
    minNum: 0,
    maxNum: 0,
    sortable: false,
    preview: true,
    multiple: false,
    rules: { maxSize: 2 },
    disabled: false,
    fit: 'contain',
  }

  componentDidMount() {
    this.initItemList(this.props.value)
    this.initState()
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.initItemList(this.props.value)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.minNum !== prevState.min ||
      nextProps.maxNum !== prevState.max
    ) {
      let { minNum, maxNum } = nextProps
      minNum = minNum < 0 ? 0 : parseInt(minNum, 10)
      maxNum = maxNum < minNum ? minNum : parseInt(maxNum, 10)
      return {
        min: minNum,
        max: maxNum,
        isStable: maxNum !== 0 && minNum === maxNum,
      }
    }

    if (
      nextProps.width !== prevState.boxStyle.width ||
      nextProps.height !== prevState.boxStyle.height ||
      nextProps.disabled !== prevState.disabled
    ) {
      return {
        boxStyle: UploadImgs.setBoxStyle(nextProps),
        disabled: nextProps.disabled,
      }
    }

    if (!Utils.shallowEqual(nextProps.rules, prevState.rules)) {
      return {
        rulesTip: UploadImgs.setRulesTip(nextProps),
      }
    }

    return null
  }

  initState() {
    this.setState({
      boxStyle: UploadImgs.setBoxStyle(this.props),
      rulesTip: UploadImgs.setRulesTip(this.props),
    })
  }

  /** 每项容器样式 */
  static setBoxStyle(props) {
    const style = {}
    style.width = props.width
    style.height = props.height
    style.textAlign = 'center'
    style.position = 'relative'
    style.display = 'flex'
    style.alignItems = 'center'
    style.justifyContent = 'center'
    style.overflow = 'hidden'
    style.lineHeight = '1.3'
    style.flexDirection = 'column'
    style.cursor = props.disabled ? 'not-allowed' : 'pointer'

    return style
  }

  /** 构造图像规范提示 */
  static setRulesTip(props) {
    const { rules } = props
    const tips = []

    /** 图像验证规则 */
    let basicRule
    // 针对动态规则模式, 获取输入为空时的规则
    // 动态规则 rule 为函数, 当选择图片后根据选择的图片生成校验规则
    if (typeof rules === 'function') {
      try {
        basicRule = rules()
      } catch (err) {
        basicRule = {}
      }
    } else {
      basicRule = rules || {}
    }

    // 宽高限制提示语
    if (basicRule.width && basicRule.height) {
      // 固定宽高限制
      tips.push(`宽高 ${basicRule.width}x${basicRule.height}`)
    } else if (basicRule.width) {
      // 固定宽限制
      tips.push(`宽度 ${basicRule.width}`)
      tips.push(
        `${getRangeTip('高度', basicRule.minHeight, basicRule.maxHeight)}`,
      )
    } else if (basicRule.height) {
      // 固定高限制
      tips.push(`高度 ${basicRule.height}`)
      tips.push(
        `${getRangeTip('宽度', basicRule.minWidth, basicRule.maxWidth)}`,
      )
    } else {
      // 宽高都不固定
      tips.push(
        `${getRangeTip('宽度', basicRule.minWidth, basicRule.maxWidth)}`,
      )
      tips.push(
        `${getRangeTip('高度', basicRule.minHeight, basicRule.maxHeight)}`,
      )
    }

    // 宽高比限制提示语
    if (basicRule.ratio) {
      if (Array.isArray(basicRule.ratio)) {
        tips.push(`宽高比 ${basicRule.ratio.join(':')}`)
      } else {
        tips.push(`宽高比 ${basicRule.ratio}`)
      }
    }

    // 文件大小
    if (basicRule.minSize || basicRule.maxSize) {
      tips.push(
        getRangeTip('文件大小', basicRule.minSize, basicRule.maxSize, 'Mb'),
      )
    }

    // 是否动态图
    if (basicRule.allowAnimated && basicRule.allowAnimated > 0) {
      if (basicRule.allowAnimated === 1) {
        tips.push('不允许上传动图')
      } else if (basicRule.allowAnimated !== 1) {
        tips.push('只允许上传动图')
      }
    }

    return tips
  }

  /**
   * 上传缓存中的图片
   * @param {Array} uploadList 需要上传的缓存集合, 集合中包含回调函数
   */
  uploadCatch(uploadList) {
    const data = {}
    uploadList.forEach((item, index) => {
      data[`file_${index}`] = item.img.file
    })
    // data 结构示例：
    // {
    //   file_0: File {name: '1.jpg.jpg', lastModified: 1461407065011, lastModifiedDate: Sat Apr 23 2016 18:24:25 GMT+0800 (中国标准时间), webkitRelativePath: ', size: 254809, …}
    // }
    return axios({
      method: 'post',
      url: '/cms/file',
      data,
    })
      .then(res => {
        // res 结构示例：
        // [
        //   {
        //     id: 599
        //     key: 'file_0'
        //     path: '2019/10/28/3c647cee-f955-11e9-bce1-00163e1cb574.jpg'
        //     url: 'http://demo.lin.colorful3.com/assets/2019/10/28/3c647cee-f955-11e9-bce1-00163e1cb574.jpg'
        //   }
        // ]
        if (!Array.isArray(res) || res.length === 0) {
          throw new Error('图像上传失败')
        }

        const resObj = res.reduce((acc, item) => {
          acc[item.key] = item
          return acc
        }, {})

        uploadList.forEach((item, index) => {
          const remoteData = resObj[`file_${index}`]
          item.cb(remoteData)
        })
      })
      .catch(err => {
        uploadList.forEach(item => {
          item.cb(false)
        })
        let msg = '图像上传失败, 请重试'
        if (err.message) {
          // eslint-disable-next-line
          msg = err.message
        }
        console.error(err)
        message.error(msg)
      })
  }

  /**
   * 内置上传文件方法, 使用 debounce 优化提交效率
   * 此处只能使用回调模式, 因为涉及 debounce 处理, promise 不可在外部改变其状态
   * @param {Object} img 需要上传的数据项
   * @param {Function} cb 回调函数
   */
  originUpload(img, cb) {
    // 一次最多上传文件数量设为可配置
    // 添加缓存
    catchData.push({
      img,
      cb,
    })

    // 等于上限, 立即上传
    if (catchData.length === uploadLimit) {
      const data = [...catchData]
      catchData = []
      clearTimeout(time)
      time = null
      return this.uploadCatch(data)
    }

    // 清除上一次的定时器
    if (time && catchData.length < uploadLimit) {
      clearTimeout(time)
      // 此时修改上一个 promise 状态为reslove
    }

    // 等待100ms
    time = setTimeout(() => {
      this.uploadCatch([...catchData])
      catchData = []
      time = null
    }, 50)
  }

  /**
   * 上传图像文件
   * @param {Object} 需要上传的项, 包含文化和其它信息
   */
  async uploadImg(item) {
    const { beforeUpload, customRequest } = this.props

    // 远程结果处理
    const reduceResult = (imgItem, res) => {
      imgItem.loading = false
      if (!res) {
        return
      }
      imgItem.display = res.url
      imgItem.src = res.path
      imgItem.imgId = res.id
      imgItem.file = null
      window.URL.revokeObjectURL(imgItem.display)
    }

    if (item.status === 'input' || !item.file) {
      return
    }
    item.loading = true
    // 处理上传文件之前的钩子函数
    if (beforeUpload && typeof beforeUpload === 'function') {
      const result = await new Promise(resolve => {
        let beforeUploadResult
        try {
          beforeUploadResult = beforeUpload(item, data => {
            resolve(!!data)
          })
        } catch (err) {
          resolve(false)
        }
        // promise 模式
        if (
          beforeUploadResult != null &&
          typeof beforeUploadResult.then === 'function'
        ) {
          beforeUploadResult
            .then(remoteData => {
              resolve(!!remoteData)
            })
            .catch(() => {
              resolve(false)
            })
        }
      })
      if (!result) {
        reduceResult(item, false)
        return false
      }
    }

    // 如果是用户自定义方法
    // 出于简化 api 的考虑, 只允许单个文件上传, 不进行代理
    if (customRequest && typeof customRequest === 'function') {
      const result = await new Promise(resolve => {
        let customRequestResult
        try {
          customRequestResult = customRequest(item.file, remoteData => {
            resolve(remoteData || false)
          })
        } catch (err) {
          message.error('执行自定义上传出错')
          resolve(false)
        }
        // promise 模式
        if (
          customRequestResult != null &&
          typeof customRequestResult.then === 'function'
        ) {
          customRequestResult
            .then(remoteData => {
              resolve(remoteData || false)
            })
            .catch(() => {
              resolve(false)
            })
        }
      })
      reduceResult(item, result)
      if (!result) {
        return false
      }
      return item
    }

    // 使用内置上传
    return new Promise(resolve => {
      this.originUpload(item, data => {
        reduceResult(item, data)
        if (!data) {
          resolve(false)
        } else {
          resolve(item)
        }
      })
    })
  }

  /**
   * 获取当前组件数据
   */
  async getValue() {
    const { itemList, isStable, min } = this.state

    // 检查是否有不符合要求的空项
    const l = isStable ? itemList.length : itemList.length - 1
    for (let i = 0; i < l; i += 1) {
      if (itemList[i].status === 'input') {
        message.error('当前存在未选择图片, 请全部选择')
        return false
      }
    }
    if (l < min) {
      message.error(`至少选择${min}张图片`)
      return false
    }
    // 提取需要上传文件
    const asyncList = []

    for (let i = 0; i < itemList.length; i += 1) {
      // 跳过上传组件
      if (itemList[i].status !== 'input') {
        if (!itemList[i].file) {
          asyncList.push(Promise.resolve(itemList[i]))
        } else {
          // 上传文件后获取对应key值
          asyncList.push(this.uploadImg(itemList[i]))
        }
      }
    }

    const imgInfoList = await Promise.all(asyncList)
    console.log('imgInfoList', imgInfoList)

    // 检查是否有上传失败的图像
    // 如果有失败的上传, 则返回错误
    if (imgInfoList.some(item => !item)) {
      return false
    }

    // 如无错误, 表示图像都以上传, 开始构造数据
    /**
     * @type {array<ReturnItem>}
     */
    const result = imgInfoList.map(item => {
      /** @type {ReturnItem} */
      const val = {
        id: item.status === 'new' ? '' : item.id,
        imgId: item.imgId || null,
        src: item.src || null,
        display: item.display,
        width: item.width || null,
        height: item.height || null,
        fileSize: item.size || null,
        fileName: item.name || null,
        fileType: item.type || null,
        isAnimated: item.isAnimated || null,
      }
      return val
    })
    // 获取数据成功后发出
    return result
  }

  /**
   * 删除某项
   * @param {Number|String} id 删除项 id
   */
  delItem(id) {
    const { itemList, isStable } = this.state
    // 根据id找到对应项
    const index = itemList.findIndex(item => item.id === id)
    const blobUrl = itemList[index].display
    if (isStable) {
      // 固定数量图片, 删除后留下空项
      itemList[index] = createItem()
    } else {
      itemList.splice(index, 1)
    }
    // 释放内存
    window.URL.revokeObjectURL(blobUrl)
    this.initItemList(itemList)
  }

  /**
   * 开启/关闭预览图像
   * @param {Number} index 索引序号
   */
  async handlePreview(index) {
    const asyncPreviewData = await this.getPreviewData()
    const previewData = await Promise.all(asyncPreviewData)
    this.setState({
      previewData,
      previewing: true,
      previewIndex: index,
    })
  }

  closePreview() {
    this.setState({
      previewing: false,
      previewData: [],
      previewIndex: 0,
    })
  }

  /**
   * 获取预览图像的数据
   */
  async getPreviewData() {
    const { itemList } = this.state
    if (itemList.length > 0 && itemList[0].display) {
      const imgList = itemList.filter(item => item.status !== 'input')
      return imgList.map(async (item, index) => {
        // 对于不包含宽高的图像数据，获取其宽高值
        if (!item.width || !item.height) {
          const getInfo = () => {
            return new Promise((resolve, reject) => {
              let image = new Image()
              image.src = item.display
              image.onload = () => {
                const info = {
                  width: image.width,
                  height: image.height,
                }
                resolve(info)
                image = null
              }
            })
          }
          const info = await getInfo()
          return {
            src: item.display,
            w: info.width,
            h: info.height,
          }
        }

        // 包含宽高的图像数据，直接输出
        return {
          src: item.display,
          w: item.width,
          h: item.height,
        }
      })
    } else {
      return [{ src: '', w: 0, h: 0 }]
    }
  }

  /**
   * 移动图像位置
   * @param {Number|String} id 操作项的 id
   * @param {Number} step 移动的偏移量
   */
  move(id, step) {
    const { itemList, isStable } = this.state
    // 找到操作的元素
    const index = itemList.findIndex(item => item.id === id)
    // 边界检测
    if (index + step < 0 || index + step >= itemList.length) return
    // 非固定项时, 不可和最后一项输入换位置
    if (!isStable && index + step === itemList.length - 1) {
      if (itemList[itemList.length - 1].status === 'input') return
    }
    const i = itemList[index]
    const j = itemList[index + step]
    itemList[index] = j
    itemList[index + step] = i
    this.setState({
      itemList: [...itemList],
    })
  }

  /**
   * 验证上传的图像是否符合要求
   * @param {LocalFileInfo} imgInfo 图像信息, 包括文件名, 宽高
   */
  async validateImg(imgInfo) {
    const { rules } = this.props
    /** @type ValidateRule */
    let rule
    // 针对动态规则模式, 获取输入为空时的规则
    // 动态规则 rule 为函数, 当选择图片后根据选择的图片生成校验规则
    if (typeof rules === 'function') {
      try {
        rule = rules(imgInfo)
      } catch (err) {
        rule = {}
      }
    } else {
      rule = rules
    }

    if (rule.allowAnimated && rule.allowAnimated > 0) {
      if (imgInfo.isAnimated === null) {
        message.error('要进行是否动图验证需要配置 "animatedCheck" 属性为 true')
      } else {
        if (rule.allowAnimated === 1 && imgInfo.isAnimated) {
          throw new Error(`"${imgInfo.name}"为动态图, 不允许上传`)
        }
        if (rule.allowAnimated === 2 && !imgInfo.isAnimated) {
          throw new Error(`"${imgInfo.name}"为静态图, 只允许上传动态图`)
        }
      }
    }

    // 宽高限制
    if (rule.width) {
      if (imgInfo.width !== rule.width) {
        throw new Error(`"${imgInfo.name}"图像宽不符合要求, 需为${rule.width}`)
      }
    } else {
      if (rule.minWidth && imgInfo.width < rule.minWidth) {
        throw new Error(
          `"${imgInfo.name}"图像宽不符合要求, 至少为${rule.minWidth}`,
        )
      }
      if (rule.maxWidth && imgInfo.width > rule.maxWidth) {
        throw new Error(
          `"${imgInfo.name}"图像宽不符合要求, 至多为${rule.maxWidth}`,
        )
      }
    }
    if (rule.height) {
      if (imgInfo.height !== rule.height) {
        throw new Error(`"${imgInfo.name}"图像高不符合要求, 需为${rule.height}`)
      }
    } else {
      if (rule.minHeight && imgInfo.height < rule.minHeight) {
        throw new Error(
          `"${imgInfo.name}"图像高不符合要求, 至少为${rule.minHeight}`,
        )
      }
      if (rule.maxHeight && imgInfo.height > rule.maxHeight) {
        throw new Error(
          `"${imgInfo.name}"图像高不符合要求, 至多为${rule.maxHeight}`,
        )
      }
    }

    // 宽高比限制提示语
    if (rule.ratio) {
      let ratio
      if (Array.isArray(rule.ratio)) {
        ratio = rule.ratio[0] / rule.ratio[1]
      } else {
        // eslint-disable-next-line
        ratio = rule.ratio
      }
      ratio = ratio.toFixed(2)
      if ((imgInfo.width / imgInfo.height).toFixed(2) !== ratio) {
        throw new Error(`"${imgInfo.name}"图像宽高比不符合要求, 需为${ratio}`)
      }
    }

    // 文件大小
    if (rule.minSize && imgInfo.size < rule.minSize * ONE_MB) {
      throw new Error(
        `"${imgInfo.name}"图像文件大小比不符合要求, 至少为${rule.minSize}Mb`,
      )
    }
    if (rule.maxSize && imgInfo.size > rule.maxSize * ONE_MB) {
      throw new Error(
        `"${imgInfo.name}"图像文件大小比不符合要求, 至多为${rule.maxSize}Mb`,
      )
    }

    return true
  }

  /**
   * 选择图像文件后处理, 包括获取图像信息, 验证图像等
   * @param {Event} ev input change 事件对象
   */
  async handleChange(ev) {
    const { currentId } = this.state
    const { autoUpload } = this.props
    const { files } = ev.target
    let imgInfoList

    if (!files) return
    // 中间步骤缓存, 在出错时用于释放 createObjectURL 的内存
    let cache = []

    /**
     * 处理单个图片, 返回处理成功的图片数据
     * @param {File} file 图片文件
     */
    const handleImg = async file => {
      try {
        // 获取图像信息 localFileInfo
        const info = await this.getImgInfo(file)
        cache.push(info)
        // 验证图像信息
        await this.validateImg(info)
        return info
      } catch (err) {
        // throw err
        console.log(err)
      }
    }

    const asyncList = []
    for (let i = 0; i < files.length; i += 1) {
      asyncList.push(handleImg(files[i]))
    }
    try {
      imgInfoList = await Promise.all(asyncList)
      // 设置图片信息
      this.setImgInfo(imgInfoList, currentId)
      // 开启自动上传
      if (autoUpload) {
        this.state.itemList.forEach(ele => {
          this.uploadImg(ele)
        })
      }
    } catch (err) {
      // 清空缓存
      cache.forEach(item => {
        window.URL.revokeObjectURL(item.localSrc)
      })
      cache = null
      console.error(err)
      message.error(err.message)
    }
  }

  /**
   * 根据信息列表设置图像信息
   * 用户选择图片, 图片通过验证后可获取到图像信息数组
   * 将这一组图像信息数据设置在 itemList 中
   * @param {Array<LocalFileInfo>} imgInfoList 需要设置的图像数组
   * @param {Number|String} currentId 操作项的 id
   */
  setImgInfo(imgInfoList = [], currentId) {
    const { itemList, max, isStable } = this.state
    // 找到特定图像位置
    const index = itemList.findIndex(item => item.id === currentId)
    // 释放内存
    window.URL.revokeObjectURL(itemList[index].display)
    // 替换图片
    itemList[index] = createItem(imgInfoList[0], itemList[index])

    // 如果需要设置的图像数量大于1, 需要执行追加图片逻辑
    if (imgInfoList.length > 1) {
      // 最大图片数量限制
      let l = imgInfoList.length
      if (isStable) {
        // 固定数量模式, 按次序插入空项
        for (let i = 0, k = 1; i < max && k < l; i += 1) {
          if (itemList[i].status === 'input') {
            this.itemList[i] = createItem(imgInfoList[k])
            k += 1
          }
        }
      } else {
        const empty = max - itemList.length
        if (max && l > empty) {
          l = empty
        }
        if (itemList[itemList.length - 1].status === 'input') {
          itemList.pop()
        }
        for (let i = 1; i <= l; i += 1) {
          itemList.push(createItem(imgInfoList[i]))
        }
      }
    }

    this.setState(
      {
        itemList,
      },
      () => {
        // 初始化图片
        this.initItemList(this.state.itemList)
      },
    )
  }

  /**
   * 处理点击事件, 并转移到文件上传元素
   * 并记录当前操作元素 id
   * @param {Number|String} id 操作项的 id
   */
  handleClick(id) {
    if (!this.props.disabled) {
      this.setState({
        currentId: id || '',
      })
      this.input.value = null
      this.input.click()
    }
  }

  /**
   * 初始化 itemList
   * @param {Array} val 初始化的数据数组
   */
  initItemList(val) {
    const { disabled } = this.props
    const { max, isStable } = this.state
    const result = []

    // 初始值不存在情况
    // 包括初始值不合法
    if (!val || !Array.isArray(val) || val.length === 0) {
      // 固定数量图像上传, 直接初始化固定数量的上传控件
      if (isStable) {
        for (let i = 0; i < max; i += 1) {
          result.push(createItem())
        }
        this.setState({
          itemList: result,
        })
        return
      }
      // 如果不是固定上传数量, 则仅创建一个空项
      result.push(createItem())
      this.setState({
        itemList: result,
      })
      return
    }

    // 存在初始值
    for (let i = 0; i < val.length; i += 1) {
      result.push(createItem(val[i]))
    }
    // 初始项小于最大数量限制, 并且处于可编辑状态, 并且最后一项不是input
    if (
      (max === 0 || val.length < max) &&
      !disabled &&
      val[val.length - 1].status !== 'input'
    ) {
      // 后面添加空项
      result.push(createItem())
    }
    this.setState({
      itemList: result,
    })
  }

  /**
   * 获取图像信息
   * @param {File} file 文件对象
   * @returns {LocalFileInfo} 信息对象
   */
  async getImgInfo(file) {
    const { animatedCheck } = this.props
    const localSrc = window.URL.createObjectURL(file)
    // 严格检测文件类型
    const fileType = await getFileType(file)
    // 检测是否是动图
    let isAnimated = null
    if (animatedCheck) {
      isAnimated = await checkIsAnimated({ file, fileType, fileUrl: localSrc })
    }
    return new Promise((resolve, reject) => {
      let image = new Image()
      image.src = localSrc
      image.onload = () => {
        /**
         * @type {LocalFileInfo}
         */
        const localFileInfo = {
          localSrc,
          file,
          width: image.width,
          height: image.height,
          name: file.name,
          size: file.size,
          type: fileType === 'unknow' ? file.type : fileType,
          lastModified: file.lastModified,
          isAnimated,
        }
        resolve(localFileInfo)
        image = null
      }
    })
  }

  /** 清空全部图片 */
  clear() {
    this.initItemList([])
    // this.getValue()
  }

  /** 重置图片数据传入属性 */
  reset() {
    this.initItemList(this.props.value)
  }

  render() {
    const { sortable, preview, multiple, disabled, fit } = this.props
    const {
      itemList,
      boxStyle,
      rulesTip,
      accept,
      loading,
      previewing,
      previewData,
      previewIndex,
    } = this.state
    return (
      <div className='upload-imgs-container'>
        {itemList.map((item, index) =>
          item.display ? (
            // 已加载图片
            <div className='thumb-item' key={item.id} style={boxStyle}>
              <img
                className='thumb-item-img'
                alt=''
                style={{ width: '100%', height: '100%', objectFit: fit }}
                src={item.display}
              />
              <div className='info'>
                {item.file && (
                  <Icon type='cloud-upload' className='wait-upload' />
                )}
              </div>
              <div className='control'>
                {!disabled && (
                  <>
                    <Icon
                      type='close'
                      className='del'
                      onClick={() => this.delItem(item.id)}
                    />
                    <div
                      className='preview'
                      title='更换图片'
                      onClick={() => this.handleClick(item.id)}
                    >
                      <Icon type='edit' />
                    </div>
                  </>
                )}
                {(sortable || preview) && (
                  <div className='control-bottom'>
                    {sortable && !disabled && (
                      <Icon
                        type='arrow-left'
                        title='前移'
                        className={`control-bottom-btn${
                          index === 0 ? ' disabled' : ''
                        }`}
                        onClick={() => this.move(item.id, -1)}
                      />
                    )}
                    {preview && (
                      <Icon
                        type='eye'
                        title='预览'
                        className='control-bottom-btn'
                        onClick={() => this.handlePreview(index)}
                      />
                    )}
                    {sortable && !disabled && (
                      <Icon
                        type='arrow-right'
                        title='后移'
                        className={`control-bottom-btn${
                          index === itemList.length - 1 ? ' disabled' : ''
                        }`}
                        onClick={() => this.move(item.id, 1)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 未加载图片
            <div
              className='upload-item'
              key={item.id}
              style={boxStyle}
              onClick={() => this.handleClick(item.id)}
            >
              {loading ? (
                <Spin
                  indicator={
                    <Icon type='loading' style={{ fontSize: '32px' }} />
                  }
                />
              ) : (
                <Icon type='plus' style={{ fontSize: '2.5em' }} />
              )}
              <div style={{ marginTop: '1em', fontSize: '0.75em' }}>
                {rulesTip.map((item, index) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
            </div>
          ),
        )}
        <input
          type='file'
          className='upload-imgs__input'
          style={{ display: 'none' }}
          ref={ref => (this.input = ref)}
          multiple={multiple}
          accept={accept}
          onChange={ev => this.handleChange(ev)}
        />
        <PhotoSwipe
          isOpen={previewing}
          items={previewData}
          options={{ index: previewIndex }}
          onClose={() => this.closePreview()}
        />
      </div>
    )
  }
}
