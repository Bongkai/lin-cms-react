import React from 'react'
import { connect } from 'react-redux'
import axios from 'lin/plugins/axios'
import { Dropdown, Modal, message } from 'antd'
import UserBox from './UserBox'
import Cropper from 'components/base/cropper/Cropper'
import UserModal from 'lin/models/user'
import PwdModal from './PwdModal'
import { setUserAndState } from '@/store/actions/app.actions'

import './user.scss'
import defaultAvatar from '@/assets/img/user/user.png'


const connectWrapper = connect(
  state => state,
  { setUserAndState }
)
class User extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      avatar: '',
      cropVisible: false,
      pwdVisible: false,
      cropImg: null,
      submitting: false,
    }
    this.onFileChange = this.onFileChange.bind(this)
    this.handleCrop = this.handleCrop.bind(this)
  }

  // 读取本地图片并进入截图界面
  onFileChange(ev) {
    if (ev.target.files.length !== 1) {
      return
    }
    const imgFile = ev.target.files[0]
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
      this.setState({
        cropImg: imgSrc,
        cropVisible: true
      })
    }
    image.onerror = () => {
      message.error('获取本地图片出现错误, 请重试')
    }
  }

  // 生成截取的图片并修改头像
  async handleCrop() {
    const file = await this.cropper.submit()

    this.setState({ submitting: true }, () => {
      // 上传 avatar 图片
      axios({
        method: 'post',
        url: '/cms/file',
        data: {
          file,
        },
      }).then(res => {
        if (!Array.isArray(res) || res.length !== 1) {
          this.setState({ submitting: false })
          message.error('头像上传失败, 请重试')
          return false
        }

        // TODO: 错误码处理
        // if (res.error_code === 10110) {
        //   throw new Error('文件体积过大')
        // }

        // 更新数据表的 avatar 地址
        axios({
          method: 'put',
          url: '/cms/user/avatar',
          data: {
            avatar: res[0].path,
          },
        }).then(res => { // eslint-disable-line
          if (res.error_code === 0) {
            message.success('更新头像成功')
            this.setState({
              cropVisible: false,
              submitting: false,
            })
            // 触发重新获取用户信息
            return UserModal.getInformation()
          }

          this.setState({ submitting: false })
          return Promise.reject(new Error('更新头像失败'))
        }).then(res => { // eslint-disable-line
          // 尝试获取当前用户信息
          const user = res
          this.props.setUserAndState(user)
        })
      })
    })
  }

  toggleModal(key) {
    this.setState({
      [key]: !this.state[key]
    })
  }

  render() {
    const { avatar } = this.props.app.user || {}

    const { cropVisible, pwdVisible, cropImg, submitting } = this.state
    const userBox = (
      <UserBox
        changePassword={()=>this.toggleModal('pwdVisible')} 
        onFileChange={this.onFileChange}
      />
    )

    return (
      <div className='user-container'>
        <Dropdown overlay={userBox} placement='bottomRight'
          overlayStyle={{ zIndex: 800 }}  // 在点击进入需要开启 Modal 的功能模块时不遮挡 Modal
        >
          <span className='dropdown-link'>
            <div className='nav-avatar'>
              <img src={avatar||defaultAvatar} alt='头像' />
            </div>
          </span>
        </Dropdown>

        {/* 弹出裁剪头像框 */}
        <Modal title='裁剪' destroyOnClose
          visible={cropVisible}
          onCancel={()=>this.toggleModal('cropVisible')}
          onOk={this.handleCrop}
          okButtonProps={{ loading: submitting }}
        >
          <Cropper ref={ref=>this.cropper=ref}
            src={cropImg}
          />
        </Modal>

        {/* 弹出修改密码框 */}
        <PwdModal
          visible={pwdVisible}
          onCancel={()=>this.toggleModal('pwdVisible')}
        />
      </div>
    )
  }
}

export default connectWrapper(User)