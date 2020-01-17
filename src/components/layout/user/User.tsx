import React, { useState, useRef, ChangeEvent } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { post, put } from 'lin/plugins/axios'
import { Dropdown, Modal, message } from 'antd'
import UserBox from './UserBox'
import Cropper from 'components/base/cropper/Cropper'
import UserModal from 'lin/models/user'
import PwdModal from './PwdModal'
import { setUserAndState } from '@/store/actions/app.actions'
import { IStoreState } from '@/store'
import { IUserType } from '@/store/redux/app.redux'
import { IResponseWithoutData } from '@/lin/models/admin'

import './user.scss'
import defaultAvatar from '@/assets/img/user/user.png'

interface IPostFileResponse {
  id: number
  key: string
  path: string
  url: string
}

export default function User() {
  const [cropVisible, setCropVisible] = useState(false)
  const [pwdVisible, setPwdVisible] = useState(false)
  const [cropImg, setCropImg] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const avatar = useSelector<IStoreState, string | null>(
    state => state.app.user.avatar,
  )
  const dispatch = useDispatch()
  const cropper = useRef<any>()

  // 读取本地图片并进入截图界面
  function onFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const { files } = ev.target
    if (!files) {
      return
    }
    if (files && files.length !== 1) {
      return
    }
    const imgFile: File = files[0]
    // 验证文件大小是否符合要求, 不大于 5M
    if (imgFile.size > 1024 * 1024 * 5) {
      message.error('文件过大超过5M')
      return
    }
    // 验证图像是否符合要求
    const imgSrc = window.URL.createObjectURL(imgFile)
    const image = new Image()
    image.src = imgSrc
    image.onload = () => {
      const { width, height } = image
      if (width < 50) {
        message.error('图像宽度过小, 请选择大于50px的图像')
        return
      }
      if (height < 50) {
        message.error('图像高度过小, 请选择大于50px的图像')
        return
      }
      // 验证通过, 打开裁剪框
      setCropImg(imgSrc)
      setCropVisible(true)
    }
    image.onerror = () => {
      message.error('获取本地图片出现错误, 请重试')
    }
  }

  // 生成截取的图片并修改头像
  async function handleCrop() {
    const file: File = await cropper.current.submit()
    setSubmitting(true)

    // 上传 avatar 图片
    post('/cms/file', {
      file,
    }).then((res: IPostFileResponse) => {
      if (!Array.isArray(res) || res.length !== 1) {
        setSubmitting(false)
        message.error('头像上传失败, 请重试')
        return false
      }

      // TODO: 错误码处理
      // if (res.error_code === 10110) {
      //   throw new Error('文件体积过大')
      // }

      // 更新数据表的 avatar 地址
      put('/cms/user/avatar', {
        avatar: res[0].path,
      })
        .then((res: IResponseWithoutData) => {
          // eslint-disable-line
          if (res.error_code === 0) {
            message.success('更新头像成功')
            setSubmitting(false)
            setCropVisible(false)
            // 触发重新获取用户信息
            return UserModal.getInformation()
          }
          // 更新头像失败
          setSubmitting(false)
          return Promise.reject(new Error('更新头像失败'))
        })
        .then((res: IUserType) => {
          // eslint-disable-line
          // 尝试获取当前用户信息
          const user = res
          dispatch(setUserAndState(user))
        })
        .catch(err => {
          setSubmitting(false)
          console.log(err)
        })
    })
  }

  const userBox = (
    <UserBox
      changePassword={() => setPwdVisible(pwdVisible => !pwdVisible)}
      onFileChange={onFileChange}
    />
  )

  return (
    <div className='user-container'>
      <Dropdown
        overlay={userBox}
        placement='bottomRight'
        overlayStyle={{ zIndex: 800 }} // 在点击进入需要开启 Modal 的功能模块时不遮挡 Modal
      >
        <span className='dropdown-link'>
          <div className='nav-avatar'>
            <img src={avatar || defaultAvatar} alt='头像' />
          </div>
        </span>
      </Dropdown>

      {/* 弹出裁剪头像框 */}
      <Modal
        title='裁剪'
        destroyOnClose
        visible={cropVisible}
        onCancel={() => setCropVisible(cropVisible => !cropVisible)}
        onOk={handleCrop}
        okButtonProps={{ loading: submitting }}
      >
        <Cropper ref={cropper} src={cropImg} />
      </Modal>

      {/* 弹出修改密码框 */}
      <PwdModal
        visible={pwdVisible}
        onCancel={() => setPwdVisible(pwdVisible => !pwdVisible)}
      />
    </div>
  )
}
