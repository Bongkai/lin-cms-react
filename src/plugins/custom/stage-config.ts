import { IRouterItem } from '@/types/project'

const CustomRouter: IRouterItem = {
  route: null,
  name: null,
  title: '自定义组件',
  type: 'folder',
  icon: 'ToolOutlined',
  filePath: 'views/custom/',
  order: null,
  inNav: true,
  children: [
    {
      title: '图像上传',
      type: 'view',
      name: 'ImgsUploadDemo',
      route: '/imgs-upload/stage1',
      filePath: 'plugins/custom/views/upload-imgs-demo/UploadImgsDemo',
      inNav: true,
      icon: 'ToolOutlined',
      permission: null,
    },
    {
      title: '富文本',
      type: 'view',
      name: 'Tinymce',
      route: '/custom/tinymce',
      filePath: 'plugins/custom/views/tinymce-demo/TinymceDemo',
      inNav: true,
      icon: 'ToolOutlined',
      permission: null,
    },
  ],
}

export default CustomRouter
