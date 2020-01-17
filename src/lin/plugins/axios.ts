// ajax 封装插件, 使用 axios
import React from 'react'
import axios, { Method } from 'axios'
import { message as antdMessage, notification } from 'antd'
import Config from '@/config'
import ErrorCode from '@/config/error-code'
import { store } from '@/store'
import { loginOut } from '@/store/actions/app.actions'
import { getToken, saveAccessToken } from '@/lin/utils/token'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || ''
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

const config = {
  baseURL: Config.baseURL || process.env.apiUrl || '',
  timeout: 10 * 1000, // 请求超时时间设置
  crossDomain: true,
  // withCredentials: true, // Check cross-site Access-Control
  // 定义可获得的http响应状态码
  // return true、设置为null或者undefined，promise将resolved,否则将rejected
  validateStatus(status: number) {
    return status >= 200 && status < 500
  },
}

// const retryTime = 2 // 请求失败重试次数
// const retryDelay = 1500 // 请求失败重试间隔

// 创建请求实例
const _axios = axios.create(config)

_axios.interceptors.request.use(
  originConfig => {
    // TODO: 有 API 请求重新计时

    const reqConfig = { ...originConfig }

    // step1: 容错处理
    if (!reqConfig.url) {
      /* eslint-disable-next-line */
      console.error('request need url')
      throw new Error({
        source: 'axiosInterceptors',
        message: 'request need url',
      } as any)
    }

    if (!reqConfig.method) {
      // 默认使用 get 请求
      reqConfig.method = 'get'
    }
    // 大小写容错
    reqConfig.method = reqConfig.method.toLowerCase() as Method

    // 参数容错
    if (reqConfig.method === 'get') {
      if (!reqConfig.params) {
        // 防止字段用错
        reqConfig.params = reqConfig.data || {}
      }
    } else if (reqConfig.method === 'post') {
      if (!reqConfig.data) {
        // 防止字段用错
        reqConfig.data = reqConfig.params || {}
      }

      // 检测是否包含文件类型, 若包含则进行 formData 封装
      let hasFile = false
      Object.keys(reqConfig.data).forEach(key => {
        if (typeof reqConfig.data[key] === 'object') {
          const item = reqConfig.data[key]
          if (
            item instanceof FileList ||
            item instanceof File ||
            item instanceof Blob
          ) {
            hasFile = true
          }
        }
      })

      // 检测到存在文件使用 FormData 提交数据
      if (hasFile) {
        const formData = new FormData()
        Object.keys(reqConfig.data).forEach(key => {
          formData.append(key, reqConfig.data[key])
        })
        reqConfig.data = formData
      }
    } else {
      // TODO: 其他类型请求数据格式处理
      /* eslint-disable-next-line */
      console.warn(`其他请求类型: ${reqConfig.method}, 暂无自动处理`)
    }

    // step2: auth 处理
    if (reqConfig.url === 'cms/user/refresh') {
      const refreshToken: string | null = getToken('refresh_token')
      if (refreshToken) {
        // eslint-disable-next-line no-param-reassign
        reqConfig.headers.Authorization = refreshToken
      }
    } else {
      // 有access_token
      const accessToken = getToken('access_token')
      if (accessToken) {
        // eslint-disable-next-line no-param-reassign
        reqConfig.headers.Authorization = accessToken
      }
    }
    return reqConfig
  },
  (error: Error) => {
    Promise.reject(error)
  },
)

// Add a response interceptor
_axios.interceptors.response.use(
  async res => {
    let {
      error_code,
      msg,
    }: {
      error_code: number
      msg: string
    } = res.data // eslint-disable-line
    let message = '' // 错误提示

    // 请求成功
    if (res.status.toString().charAt(0) === '2') {
      return res.data
    }

    return new Promise(async (resolve, reject) => {
      const { params, url } = res.config

      // refresh_token 异常，直接登出
      if (error_code === 10000 || error_code === 10100) {
        setTimeout(() => {
          store.dispatch(loginOut())
          const { origin } = window.location
          window.location.href = origin
        }, 1500)
        resolve(null)
        return
      }

      // 令牌相关，刷新令牌
      if (error_code === 10040 || error_code === 10050) {
        const cache = {} as any
        if (cache.url !== url) {
          cache.url = url
          const refreshResult = await _axios('cms/user/refresh')
          saveAccessToken((refreshResult as any).access_token)
          // 将上次失败请求重发
          const result = await _axios(res.config)
          resolve(result)
          return
        }
      }

      // 本次请求添加 params 参数：handleError 为 true，用户自己try catch，框架不做处理
      if (params && params.handleError) {
        reject(res)
        return
      }

      // 本次请求添加 params 参数：showBackend 为 true, 弹出后端返回错误信息
      if (params && params.showBackend) {
        // message = msg[0]
        ;[message] = msg
      } else {
        // 弹出前端自定义错误信息
        const errorArr = Object.entries(ErrorCode).filter(
          v => v[0] === error_code.toString(),
        )
        // 匹配到前端自定义的错误码
        if (errorArr.length > 0) {
          if (errorArr[0][1] !== '') {
            message = errorArr[0][1] // eslint-disable-line
          } else {
            message = ErrorCode['777']
          }
        }
      }

      antdMessage.error(message)
      reject()
    })
  },
  (error: any) => {
    if (!(error as any).response) {
      notification.error({
        message: 'Network Error',
        description: React.createElement(
          'strong',
          { className: 'my-notify' },
          '请检查 API 是否异常',
        ),
      })
      console.log('error', error)
    }

    // 判断请求超时
    if (
      (error as any).code === 'ECONNABORTED' &&
      error.message.indexOf('timeout') !== -1
    ) {
      antdMessage.warning('请求超时')
    }
    return Promise.reject(error)
  },
)

// 导出常用函数

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function post(
  url: string,
  data: any = {},
  params: any = {},
): Promise<any> {
  return _axios({
    method: 'post',
    url,
    data,
    params,
  })
}

/**
 * @param {string} url
 * @param {object} params
 */
export function get(url: string, params: any = {}): Promise<any> {
  return _axios({
    method: 'get',
    url,
    params,
  })
}

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function put(
  url: string,
  data: any = {},
  params: any = {},
): Promise<any> {
  return _axios({
    method: 'put',
    url,
    params,
    data,
  })
}

/**
 * @param {string} url
 * @param {object} params
 */
export function _delete(url: string, params: any = {}): Promise<any> {
  return _axios({
    method: 'delete',
    url,
    params,
  })
}

export default _axios
