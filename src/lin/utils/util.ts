import { cloneDeep, throttle, debounce } from 'lodash'
import { IUserType } from '@/store/redux/app.redux'
import { IRouterItem } from '@/config/stage'
import { IHomeRouterItemMeta } from '@/router/home-router'

interface IUtils {
  cutString: (str: string, len: number) => string
  getIntersect: (a: any[], b: any[]) => any[] | null
  debounce: (func: (...args: any[]) => any, wait?: number) => any
  throttle: (func: () => any, wait?: number) => any
  getRandomStr: (n?: number) => string
  getTypeOf: (obj: any) => string
  // TODO: 改成泛型
  insertItem: (item: any, arr: any[]) => void
  // TODO: 改成泛型
  sortByOrder: (source: any[]) => any[]
  deepClone: <T = any>(data: T) => T
  hasPermission: (
    auths: string[],
    route: IRouterItem | IHomeRouterItemMeta,
    user: IUserType,
  ) => boolean
  getScrollBarSize: (fresh: boolean) => number

  // 以下为 React 版新增
  shallowEqual: (obj_1: object, obj_2: object) => boolean
  dataURLToBlob: (base64: string) => Blob
}

/* eslint-disable */
const Utils = {} as IUtils

/** 参数说明：
 * 根据长度截取先使用字符串，超长部分追加…
 * str 对象字符串
 * len 目标字节长度
 * 返回值： 处理结果字符串
 */
Utils.cutString = (str: string, len: number): string => {
  if (str.length * 2 <= len) {
    return str
  }
  let strlen = 0
  let s = ''
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-line
    s += str.charAt(i)
    if (str.charCodeAt(i) > 128) {
      strlen += 2
      if (strlen >= len) {
        return `${s.substring(0, s.length - 1)}...`
      }
    } else {
      strlen += 1
      if (strlen >= len) {
        return `${s.substring(0, s.length - 2)}...`
      }
    }
  }
  return s
}

/**
 * 简单数组的交集
 * @param {Array} a
 * @param {Array} b
 */
Utils.getIntersect = (a: any[], b: any[]): any[] | null => {
  if (a.constructor === Array && b.constructor === Array) {
    const set1 = new Set<any[]>(a)
    const set2 = new Set<any[]>(b)
    return Array.from(new Set([...set1].filter(x => set2.has(x))))
  }
  return null
}

/**
 * 防抖函数
 * @param {*} func 函数体
 * @param {*} wait 延时
 */
Utils.debounce = (func: (...args: any) => any, wait: number = 50): any =>
  debounce(func, wait)

/**
 * 节流函数
 * @param {*} func 函数体
 * @param {*} wait 延时
 */
Utils.throttle = (func: (...args: any) => any, wait: number = 50): any =>
  throttle(func, wait)

/**
 * 返回 n 位的随机字符串
 * @param {Number} n
 */
Utils.getRandomStr = (n: number = 6): string => {
  let str = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < n; i += 1) {
    str += chars.charAt(Math.floor(Math.random() * 62))
  }
  return str
}

function getTypeOf(obj: any): string {
  const { toString } = Object.prototype
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
    '[object Symbol]': 'symbol',
  }
  return map[toString.call(obj)]
}

function insertItem(item: any, arr: any[]) {
  const { order } = item
  if (typeof arr[order] !== 'number') {
    arr[order] = item
    return
  }
  let moveBegin: number = 0
  let moveEnd: number = 0
  let pos: number = 0
  let i: number = order + 1

  while (arr[i]) {
    if (arr[i].order > order) {
      if (!moveBegin) {
        moveBegin = i
        pos = i
      }
    }
    i += 1
  }

  if (moveBegin) {
    moveEnd = i
  } else {
    pos = i
  }

  if (!moveEnd) {
    arr[pos] = item
    return
  }

  // 需要移动
  for (let i = moveEnd; i >= moveBegin; i -= 1) {
    arr[i + 1] = arr[i]
  }
  arr[pos] = item
}

/**
 * 根据数组的 order 字段排序
 * @param {Array} source
 */
Utils.sortByOrder = (source: any[] = []): any[] => {
  if (!Array.isArray(source)) {
    console.error('sortByOrder 传入参数不符合要求, 应为数组', source)
    return source
  }
  const tmp: any[] = []
  let target: any[] = []

  // 将带排序的子项添加进临时数组 tmp
  for (let i = 0; i < source.length; i += 1) {
    if (typeof source[i].order !== 'number') {
      continue
    }
    let { order } = source[i]
    // 支持设置倒数顺序
    if (order < 0) {
      order = source.length + order
      if (order < 0) {
        order = 0
      }
    }

    // 确保整数
    source[i].order = Math.floor(order)

    // 插入临时数组
    insertItem(source[i], tmp)
  }

  // 合并临时数组和原数组
  for (let i = 0, j = 0; i < source.length; i += 1) {
    if (typeof source[i].order === 'number') {
      continue
    }
    // 找需要填的坑
    while (tmp[j]) {
      j += 1
    }
    tmp[j] = source[i]
  }
  // 筛除空隙
  target = tmp.filter(item => !!item)
  return target
}

/**
 * 深度遍历，深拷贝
 * @param {*} data
 */
Utils.deepClone = <T = any>(data: T): T => cloneDeep(data)

/**
 * 判断权限
 */
Utils.hasPermission = (
  auths: string[],
  route: IRouterItem | IHomeRouterItemMeta,
  user: IUserType,
): boolean => {
  if (user && user.isSuper) {
    return true
  }
  const { right } = route
  if (right) {
    return auths.some((auth: string) => right.indexOf(auth) > -1)
  }
  return true
}

let cached: number
/**
 * 获取窗口滚动条大小, From: https://github.com/react-component/util/blob/master/src/getScrollBarSize.js
 * @param {boolean} fresh 强制重新计算
 * @returns {number}
 */
export function getScrollBarSize(fresh: boolean): number {
  if (fresh || cached === undefined) {
    const inner = document.createElement('div')
    inner.style.width = '100%'
    inner.style.height = '200px'

    const outer = document.createElement('div')
    const outerStyle = outer.style

    outerStyle.position = 'absolute'
    outerStyle.top = '0px'
    outerStyle.left = '0px'
    outerStyle.pointerEvents = 'none'
    outerStyle.visibility = 'hidden'
    outerStyle.width = '200px'
    outerStyle.height = '150px'
    outerStyle.overflow = 'hidden'

    outer.appendChild(inner)

    document.body.appendChild(outer)

    const widthContained = inner.offsetWidth
    outer.style.overflow = 'scroll'
    let widthScroll = inner.offsetWidth

    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth
    }

    document.body.removeChild(outer)

    cached = widthContained - widthScroll
  }
  return cached
}

// 以下为 React 版新增：

/**
 * plain object 的浅比较
 */
Utils.shallowEqual = (obj_1: object, obj_2: object): boolean => {
  if (getTypeOf(obj_1) !== 'object' || getTypeOf(obj_2) !== 'object') {
    return false
  }

  const keys_1 = Object.keys(obj_1)
  const keys_2 = Object.keys(obj_2)
  if (keys_1.length !== keys_2.length) {
    return false
  }

  const isKeyValueEqual = (arr: string[]) =>
    arr.every(item => obj_1[item] === obj_2[item])
  return isKeyValueEqual(keys_1) && isKeyValueEqual(keys_2)
}

/**
 * dataURL 转 Blob
 */
Utils.dataURLToBlob = (base64: string): Blob => {
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

export default Utils
