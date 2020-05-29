
<p align="center">
  <a href="http://doc.cms.7yue.pro/">
    <img width="200" src="https://consumerminiaclprd01.blob.core.chinacloudapi.cn/miniappbackground/sfgmember/lin/left-logo.png">
  </a>
</p>

<p align="center">
  <a href="#简介">简介</a>&nbsp;|&nbsp;<a href="#快速上手">快速上手</a>&nbsp;|&nbsp;<a href="#版本日志">版本日志</a>
</p>

![](https://img.shields.io/badge/版本-0.2.0-3963bc.svg)
![](https://img.shields.io/badge/node-8.11.0+-3963bc.svg)
![](https://img.shields.io/badge/脚手架-create--react--app-3963bc.svg)
![](https://img.shields.io/badge/license-MIT-3963bc.svg)
![](https://img.shields.io/badge/developer-@Bongkai-3963bc.svg)

## 预防针

* 本项目非官方团队出品，仅出于学习、研究目的丰富下官方项目的语言支持。官方团队仓库链接：[点击查看](https://github.com/TaleLin)
* 本项目采取后跟进官方团队功能的形式，即官方团队出什么功能，这边就跟进开发什么功能，开发者不必担心适配问题。
* 在上一点的基础上，我们会尝试加入一些自己的想法并实现。
* 局限于本人水平，有些地方还需重构，已经纳入了计划中，当然也会有我没考虑到的，希望有更多人参与进来一起完善。

## 简介

Lin-CMS 是林间有风团队经过大量项目实践所提炼出的一套**内容管理系统框架**。

Lin-CMS 可以有效的帮助开发者提高 CMS 的开发效率。

Lin-CMS 是一套前后端完整的解决方案，后端部署请移步：

[lin-cms-spring-boot](https://github.com/TaleLin/lin-cms-spring-boot)

[lin-cms-koa](https://github.com/TaleLin/lin-cms-koa)

### 注意

**Lin-CMS 是工程类开源项目，不能保证无缝升级**

### 官方文档地址

[http://doc.cms.7yue.pro/](http://doc.cms.7yue.pro/)

#### 项目后端 PHP 版作者编写的 Vue + PHP 文档地址，可供进一步参考

[https://chenjinchuang.github.io/](https://chenjinchuang.github.io/)

### 线上 Demo

[http://lincms.bongkai.com/](http://lincms.bongkai.com/)


### Lin CMS 的特点

Lin CMS 的构筑思想是有其自身特点的。下面我们阐述一些 Lin 的主要特点。

#### Lin CMS 是一个前后端分离的 CMS 解决方案

这意味着，Lin 既提供后台的支撑，也有一套对应的前端系统，当然双端分离的好处不仅仅在于此，我们会在后续提供`NodeJS`和`PHP`版本的 Lin。如果你心仪 Lin，却又因为技术栈的原因无法即可使用，没关系，我们会在后续提供更多的语言版本。为什么 Lin 要选择前后端分离的单页面架构呢？

首先，传统的网站开发更多的是采用服务端渲染的方式，需用使用一种模板语言在服务端完成页面渲染：比如 JinJa2、Jade 等。
服务端渲染的好处在于可以比较好的支持 SEO，但作为内部使用的 CMS 管理系统，SEO 并不重要。

但一个不可忽视的事实是，服务器渲染的页面到底是由前端开发者来完成，还是由服务器开发者来完成？其实都不太合适。现在已经没有多少前端开发者是了解这些服务端模板语言的，而服务器开发者本身是不太擅长开发页面的。那还是分开吧，前端用最熟悉的 Vue/React 写 JS 和 CSS，而服务器只关注自己的 API 即可。

其次，单页面应用程序的体验本身就要好于传统网站。

#### 框架本身已内置了 CMS 常用的功能

Lin 已经内置了 CMS 中最为常见的需求：用户管理、权限管理、日志系统等。开发者只需要集中精力开发自己的 CMS 业务即可

#### Lin CMS 本身也是一套开发规范

Lin CMS 除了内置常见的功能外，还提供了一套开发规范与工具类。换句话说，开发者无需再纠结如何验证参数？如何操作数据库？如何做全局的异常处理？API 的结构如何？前端结构应该如何组织？这些问题 Lin CMS 已经给出了解决方案。当然，如果你不喜欢 Lin 给出的架构，那么自己去实现自己的 CMS 架构也是可以的。但通常情况下，你确实无需再做出架构上的改动，Lin 可以满足绝大多数中小型的 CMS 需求。

举例来说，每个 API 都需要校验客户端传递的参数。但校验的方法有很多种，不同的开发者会有不同的构筑方案。但 Lin 提供了一套验证机制，开发者无需再纠结如何校验参数，只需模仿 Lin 的校验方案去写自己的业务即可。

还是基于这样的一个原则：**Lin CMS 只需要开发者关注自己的业务开发，它已经内置了很多机制帮助开发者快速开发自己的业务**。

## 快速上手

```sh
# clone the project
git clone https://github.com/Bongkai/lin-cms-react.git

# install dependency
npm install or yarn

# develop
npm start or yarn start

# build & run build
npm run build
node server.js
```

## 讨论交流
微信公众号搜索：林间有风
<br>
<img class="QR-img" src="http://imglf6.nosdn0.126.net/img/YUdIR2E3ME5weEdlNThuRmI4TFh3UWhiNmladWVoaTlXUXpicEFPa1F6czFNYkdmcWRIbGRRPT0.jpg?imageView&thumbnail=500x0&quality=96&stripmeta=0&type=jpg" width="150" height="150" style='text-align: left;width: 100px;height: 100px'>

QQ群搜索：林间有风 或 643205479

<img src="https://consumerminiaclprd01.blob.core.chinacloudapi.cn/miniappbackground/sfgmember/lin/qrcode_1558012902375.jpg" width="150" height="205" >

## 版本日志

最新版本 `0.2.0`

### 0.2.0

1.  `U` 使用 [dream-redux](https://github.com/Bongkai/dream-redux) 重构 Redux 代码，极大简化 Redux 的使用
2.  `U` 调整 useSelector 的用法，保证代码性能的同时简化 ts 写法

### 0.1.1-beta.1

1.  `U` 升级 antd v4
2.  `U` 使用 Immer 和自定义 hook 优化 Redux 代码，简化使用方法
3.  `U` 修改项目构建配置，优化动态加载功能

### 0.1.0-beta.2

1.  `A` 新增消息中心组件
2.  `A` 新增 useWebSocket 核心代码库

### 0.1.0-beta.1

1.  `A` 新增一个用户可以属于多个分组
2.  `F` 权限相关 auth right 统一替换为 permission
3.  `A` 使用 babel-plugin-react-directives 添加 r-if 指令优化 tsx 代码

*  核心功能对应 Vue 版 0.3.0

### 0.0.1-alpha.2

1.  `U` 使用 React Hooks 进行项目重构
2.  `A` 使用 TypeScript 优化大部分项目代码
3.  `A` 添加 ESLint 和 Prettier 提升项目代码规范

*  核心功能对应 Vue 版 0.2.x

### 0.0.1-alpha.1

1.  `A` 初始化内测版

