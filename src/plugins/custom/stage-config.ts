import { IRouterItem } from '@/config/stage'

const CustomRouter: IRouterItem = {
  route: null,
  name: null,
  title: '自定义组件',
  type: 'folder',
  icon: 'tool',
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
      icon: 'tool',
      right: null,
    },
    // {
    //   title: 'gallery 画廊',
    //   type: 'view',
    //   name: 'GalleryDemo',
    //   route: '/custom/gallery',
    //   filePath: 'plugins/custom/views/Gallery.vue',
    //   inNav: true,
    //   icon: 'iconfont icon-zidingyi',
    //   right: null,
    // },
    {
      title: '富文本',
      type: 'view',
      name: 'Tinymce',
      route: '/custom/tinymce',
      filePath: 'plugins/custom/views/tinymce-demo/TinymceDemo',
      inNav: true,
      icon: 'tool',
      right: null,
    },
    // {
    //   title: 'multiple 多重输入',
    //   type: 'view',
    //   name: 'Multiple',
    //   route: '/custom/multiple',
    //   filePath: 'plugins/custom/views/MultipleInput.vue',
    //   inNav: true,
    //   icon: 'iconfont icon-zidingyi',
    //   right: null,
    // },
  ],
}

export default CustomRouter